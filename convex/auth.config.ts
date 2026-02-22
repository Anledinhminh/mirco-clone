// Convex auth config – NOT a real TypeScript file, must be renamed to auth.config.json
// But Convex actually expects this at convex/auth.config.ts and uses JWKS from Clerk

export default {
    providers: [
        {
            // After running `npx convex dev`, set your Clerk Frontend API URL here
            // e.g. "https://xyz.clerk.accounts.dev"
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN ?? "https://REPLACE_ME.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
