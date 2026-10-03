import { Session } from "@shopify/shopify-api";
import type { SessionStorage } from "@shopify/shopify-app-session-storage";
import prisma from "./db.server";

// Global in-memory cache to persist sessions across warm Lambda invocations
declare global {
  var _dropclockMemorySessions: Map<string, Session> | undefined;
}

const memoryStore = global._dropclockMemorySessions || new Map<string, Session>();
global._dropclockMemorySessions = memoryStore;

// Defensive check: If DATABASE_URL is localhost, 127.0.0.1, dummy, or missing, skip slow network TCP hangs
const isLocalOrDummyDatabase = Boolean(
  !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1") ||
    process.env.DATABASE_URL.includes("dummy")
);

export class ResilientSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    memoryStore.set(session.id, session);

    if (!isLocalOrDummyDatabase) {
      try {
        const sessionParams = session.toObject ? session.toObject() : (session as any);
        const data = {
          id: session.id,
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope || null,
          expires: session.expires || null,
          accessToken: session.accessToken || "",
          userId: sessionParams.onlineAccessInfo?.associated_user?.id || null,
          firstName: sessionParams.onlineAccessInfo?.associated_user?.first_name || null,
          lastName: sessionParams.onlineAccessInfo?.associated_user?.last_name || null,
          email: sessionParams.onlineAccessInfo?.associated_user?.email || null,
          accountOwner: sessionParams.onlineAccessInfo?.associated_user?.account_owner || false,
          locale: sessionParams.onlineAccessInfo?.associated_user?.locale || null,
          collaborator: sessionParams.onlineAccessInfo?.associated_user?.collaborator || false,
          emailVerified: sessionParams.onlineAccessInfo?.associated_user?.email_verified || false,
        };

        await Promise.race([
          prisma.session.upsert({
            where: { id: session.id },
            update: data,
            create: data,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000)),
        ]);
      } catch (err: any) {
        console.warn("[SessionStorage] Prisma storeSession bypassed:", err?.message || err);
      }
    }

    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const cached = memoryStore.get(id);
    if (cached) {
      return cached;
    }

    if (!isLocalOrDummyDatabase) {
      try {
        const row = await Promise.race([
          prisma.session.findUnique({ where: { id } }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
        ]);

        if (row) {
          const sessionParams: any = {
            id: row.id,
            shop: row.shop,
            state: row.state,
            isOnline: row.isOnline,
            userId: row.userId ? String(row.userId) : undefined,
            firstName: row.firstName || undefined,
            lastName: row.lastName || undefined,
            email: row.email || undefined,
            locale: row.locale || undefined,
            accountOwner: row.accountOwner,
            collaborator: row.collaborator,
            emailVerified: row.emailVerified,
            expires: row.expires ? row.expires.getTime() : undefined,
            scope: row.scope || undefined,
            accessToken: row.accessToken,
          };

          const s = (Session as any).fromPropertyArray
            ? (Session as any).fromPropertyArray(Object.entries(sessionParams), true)
            : new Session(sessionParams);

          memoryStore.set(id, s);
          return s;
        }
      } catch (err: any) {
        console.warn("[SessionStorage] Prisma loadSession bypassed:", err?.message || err);
      }
    }

    return undefined;
  }

  async deleteSession(id: string): Promise<boolean> {
    memoryStore.delete(id);

    if (!isLocalOrDummyDatabase) {
      try {
        await Promise.race([
          prisma.session.delete({ where: { id } }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000)),
        ]);
      } catch {}
    }

    return true;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    ids.forEach((id) => memoryStore.delete(id));

    if (!isLocalOrDummyDatabase) {
      try {
        await Promise.race([
          prisma.session.deleteMany({ where: { id: { in: ids } } }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000)),
        ]);
      } catch {}
    }

    return true;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const results: Session[] = [];
    for (const s of memoryStore.values()) {
      if (s.shop === shop) {
        results.push(s);
      }
    }

    if (results.length > 0 || isLocalOrDummyDatabase) {
      return results;
    }

    try {
      const rows = await Promise.race([
        prisma.session.findMany({
          where: { shop },
          take: 25,
          orderBy: [{ expires: "desc" }],
        }),
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 2000)),
      ]);

      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((row) => {
          const sessionParams: any = {
            id: row.id,
            shop: row.shop,
            state: row.state,
            isOnline: row.isOnline,
            userId: row.userId ? String(row.userId) : undefined,
            firstName: row.firstName || undefined,
            lastName: row.lastName || undefined,
            email: row.email || undefined,
            locale: row.locale || undefined,
            accountOwner: row.accountOwner,
            collaborator: row.collaborator,
            emailVerified: row.emailVerified,
            expires: row.expires ? row.expires.getTime() : undefined,
            scope: row.scope || undefined,
            accessToken: row.accessToken,
          };

          const s = (Session as any).fromPropertyArray
            ? (Session as any).fromPropertyArray(Object.entries(sessionParams), true)
            : new Session(sessionParams);

          memoryStore.set(s.id, s);
          return s;
        });
      }
    } catch {}

    return results;
  }
}

export const resilientSessionStorage = new ResilientSessionStorage();
