import { serverEnv } from "../lib/env";

export default {
  providers: [
    {
      domain: serverEnv.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
