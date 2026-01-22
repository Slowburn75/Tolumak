import type { Context as HonoContext } from "hono";

import { auth } from "@Tolumak/auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  return {
    session,
    user: session?.user ?? null,
    role: (session?.user as any)?.role ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
