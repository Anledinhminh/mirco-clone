# Miro Clone — Collaborative Whiteboard

A real-time collaborative whiteboard inspired by Miro, built with Next.js 15, React Flow, Liveblocks, Clerk, and Convex.

---

## 🚀 Setup Instructions

### 1. Fill in Environment Variables

Open `.env.local` and fill in your API keys:

```bash
# From https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# From https://dashboard.convex.dev (run step 2 first)
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud

# From https://liveblocks.io/dashboard → API Keys
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_...
LIVEBLOCKS_SECRET_KEY=sk_dev_...
```

### 2. Initialize Convex (in a separate terminal)

```bash
cd d:\Manro\miro-clone
npx convex dev
```

- This will prompt you to create/log in to a Convex account
- Copy the deployment URL into `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
- This also generates the `convex/_generated/` types automatically

### 3. Configure Convex + Clerk Integration

In your Convex dashboard, add the Clerk JWT domain:
1. Go to `Settings → Authentication`
2. Add `Clerk` as a provider
3. Enter your **Clerk Frontend API URL** (e.g. `https://xyz.clerk.accounts.dev`)

Update `convex/auth.config.ts` with your Clerk domain:
```ts
domain: "https://YOUR_CLERK_DOMAIN.clerk.accounts.dev",
```

### 4. Run the Development Server

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
miro-clone/
├── app/
│   ├── (dashboard)/           # Dashboard pages
│   │   ├── layout.tsx         # Sidebar + Navbar layout
│   │   ├── page.tsx           # Board listing page
│   │   └── _components/       # Board cards, search, etc.
│   ├── board/[boardId]/       # Individual board pages
│   │   ├── page.tsx           # RoomProvider wrapper
│   │   └── _components/       # Canvas, toolbar, cursors
│   ├── api/
│   │   └── liveblocks-auth/   # Liveblocks JWT endpoint
│   ├── sign-in/               # Clerk sign-in page
│   └── sign-up/               # Clerk sign-up page
├── components/
│   ├── nodes/                 # Custom React Flow nodes
│   │   ├── text-node.tsx      # Markdown text node
│   │   └── image-node.tsx     # Image URL node
│   └── ui/                    # Shared UI primitives
├── convex/
│   ├── schema.ts              # Database schema
│   ├── boards.ts              # Board mutations & queries
│   └── auth.config.ts         # Clerk JWT config
├── hooks/                     # Custom React hooks
├── store/                     # Zustand stores
├── lib/                       # Utilities
├── liveblocks.config.ts       # Liveblocks client setup
└── middleware.ts              # Clerk auth middleware
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| 🔐 Clerk Authentication | ✅ |
| 🏢 Organization + Personal Boards | ✅ |
| 📋 Dashboard with Board List | ✅ |
| 🔍 Search Boards | ✅ |
| ⭐ Favorite Boards | ✅ |
| 🖍️ Rename / Delete Boards | ✅ |
| 🎨 Infinite Canvas (React Flow) | ✅ |
| 🖱️ Live Cursors (Liveblocks) | ✅ |
| 🔄 Real-time Node/Edge Sync | ✅ |
| 📝 TextNode with Markdown | ✅ |
| 🖼️ ImageNode with URL/Paste | ✅ |
| 📌 Sticky Notes | ✅ |
| 🔲 Shape Nodes (Rect/Circle/Triangle) | ✅ |
| 🖍️ Freehand Pen Drawing | ✅ |
| 🔗 Customizable Connections | ✅ |
| 🌙 Dark Mode Support | ✅ |
| 📥 Export to PNG | ✅ |
| ↩️ Undo/Redo (Ctrl+Z/Y) | ✅ |
| 🗺️ MiniMap + Controls | ✅ |
| 👥 Participant Avatars | ✅ |
| 👁️ Following Mode | ✅ |
