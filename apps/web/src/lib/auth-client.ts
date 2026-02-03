import { env } from "@Tolumak/env/web";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
    },
  },
});
