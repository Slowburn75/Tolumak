import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createContext } from "@Tolumak/api/context";
import { appRouter } from "@Tolumak/api/routers/index";
import { auth } from "@Tolumak/auth";
import { env } from "@Tolumak/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/uploads/*", serveStatic({ root: "./" }));

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error("[RPC Error]", error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.all("/rpc/*", async (c) => {
  const context = await createContext({ context: c });
  console.log(`[Server] RPC Request: ${c.req.path}`);
  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }
  return c.text("Not Found", 404);
});

app.all("/api-reference/*", async (c) => {
  const context = await createContext({ context: c });
  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }
  return c.text("Not Found", 404);
});

app.post("/upload/payment-proof", async (c) => {
  const context = await createContext({ context: c });
  if (!context.user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.parseBody();
  const file = body["file"];

  if (!(file instanceof File)) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  // Validate type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG and WEBP allowed." }, 400);
  }

  // Validate size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return c.json({ error: "File too large. Max size is 5MB." }, 400);
  }

  const extension = file.type.split("/")[1];
  const fileName = `${context.user.id}-${Date.now()}.${extension}`;
  const filePath = join("uploads", fileName);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const url = `${env.BETTER_AUTH_URL}/uploads/${fileName}`;

  return c.json({ url });
});

app.get("/", (c) => {
  return c.text("OK");
});

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  serve({
    port: 3000,
    fetch: app.fetch,
  });
  console.log("Server running on http://localhost:3000");
}

export default app;
