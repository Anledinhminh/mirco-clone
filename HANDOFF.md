# 📋 Tài Liệu Bàn Giao – Miro Clone

> **Ngày cập nhật:** 2026-02-24  
> **Project path:** `d:\Manro\miro-clone`  
> **GitHub:** [https://github.com/Anledinhminh/mirco-clone](https://github.com/Anledinhminh/mirco-clone)

---

## 1. Tổng Quan Dự Án

**Miro Clone** là ứng dụng collaborative whiteboard real-time, mô phỏng các tính năng cốt lõi của [Miro](https://miro.com).

### Tính năng đã hoàn thiện:
| Feature | Mô tả |
|---------|-------|
| 🔐 Auth + Org | Đăng nhập, tạo tổ chức qua Clerk |
| 📋 Dashboard | Danh sách board, tạo mới, đổi tên, xóa, tìm kiếm, favorite |
| 🎨 Infinite Canvas | React Flow với zoom/pan/minimap |
| 🖱️ Live Cursors | Cursor real-time + smooth animation (80ms transition) |
| 🔄 Real-time Sync | Nodes & Edges đồng bộ qua Liveblocks storage |
| 📝 Rich Text Node | Tiptap editor: Bold, Italic, Underline, Font size (custom extension), Color, Alignment. Seamless UI without headers. |
| 🖼️ Image Node | Seamless URL input + Ctrl+V screenshot paste (base64) with invisible bounding boxes |
| 📌 Sticky Note | Markdown rendering, 4 colors (yellow/blue/pink/green) |
| 🔲 Shape Node | Rectangle, Circle, Triangle, Diamond with text support |
| 🖍️ Pen Tool | Freehand drawing using `perfect-freehand` with real-time sync |
| 🔗 Custom Connections | Reconnectable edges (drag ends to change nodes), any-to-any handle connections, editable text labels and context menu styling |
| 🌙 Dark Mode | Sáng/Tối theme toàn ứng dụng thông qua `next-themes` |
| 📥 Export to PNG | Tải xuống canvas hiện tại dạng PNG qua `html-to-image` |
| 🔧 Node Resize | Kéo handle để thay đổi kích thước (NodeResizer) |
| ✂️ Context Menu | Chuột phải: Bring to front, Send to back, Duplicate, Delete |
| ⌨️ Keyboard Shortcuts | Delete, Ctrl+D (duplicate), Ctrl+[/] (z-index), Esc |
| 🧲 Snap to Grid | Toggle snap 20px grid trên toolbar |
| 🖱️ Miro-style Mouse | Space+drag = pan, default drag = box-select, scroll = pan |
| 👁️ Following Mode | Click avatar → theo dõi viewport của user khác |
| 👥 Live Selection | Thấy node nào user khác đang chọn |
| ↩️ Undo/Redo | Ctrl+Z / Ctrl+Y qua Liveblocks history |
| 👥 Participants | Avatar bubble + follow/unfollow UI |
| 🛡️ RBAC | Owner / Editor / Viewer roles |
| 📋 Click-to-place | Click toolbar Text/Sticky/Shape → click canvas đặt tại vị trí |

---

## 2. Tech Stack

```
Framework:        Next.js 16.1.6 (App Router, Turbopack)
Language:         TypeScript 5
Styling:          Tailwind CSS v4

Canvas:           @xyflow/react v12.10.1 (React Flow)
Rich Text:        @tiptap/react v3.20 + extensions (Color, FontSize, TextStyle, Underline, Highlight, TextAlign)
Real-time:        @liveblocks/client v3.14, @liveblocks/react v3.14, @liveblocks/node v3.14
Auth:             @clerk/nextjs v6.38.1
Database:         convex v1.32.0
UI:               @radix-ui/* (dialog, dropdown-menu, alert-dialog, toast, tooltip, avatar, context-menu)
State:            zustand v5
Markdown:         react-markdown v10, remark-gfm v4
Icons:            lucide-react v0.575
```

---

## 3. Cấu Trúc Thư Mục

```
d:\Manro\miro-clone\
├── liveblocks.config.ts         ← Presence (cursor, selectedNodeId, viewport), Storage, createRoomContext
├── middleware.ts                ← Clerk auth middleware
├── next.config.ts               ← HTTPS image hosts, ignoreBuildErrors
│
├── convex/
│   ├── schema.ts, boards.ts, auth.config.ts
│   └── _generated/              ← Stub files (replaced by `npx convex dev`)
│
├── app/
│   ├── layout.tsx, globals.css, providers.tsx
│   ├── (dashboard)/             ← Dashboard: board list, search, favorites
│   ├── board/[boardId]/
│   │   ├── page.tsx             ← RoomProvider + ClientSideSuspense
│   │   └── _components/
│   │       ├── canvas.tsx       ← ⭐ CORE: ReactFlow + Liveblocks + all features
│   │       ├── toolbar.tsx      ← Bottom bar: Select/Text/Image/Sticky/Shape/Pen/Snap/Undo/Redo
│   │       ├── participants.tsx ← Avatar bubbles + following mode
│   │       ├── cursors-presence.tsx ← Live cursors with smooth CSS transition
│   │       ├── board-info.tsx   ← Title + rename + back + export
│   │       └── canvas-wrapper.tsx, board-loading.tsx
│   └── api/liveblocks-auth/     ← Liveblocks token endpoint
│
├── components/
│   ├── edges/
│   │   └── custom-edge.tsx      ← Editable edge with context menu
│   ├── nodes/
│   │   ├── text-node.tsx        ← Tiptap editor + NodeResizer
│   │   ├── image-node.tsx       ← URL/paste image + NodeResizer
│   │   ├── sticky-note-node.tsx ← Markdown sticky + NodeResizer
│   │   ├── shape-node.tsx       ← Square, Circle, Triangle, Diamond
│   │   ├── path-node.tsx        ← Freehand SVG drawing paths
│   │   └── rich-text-toolbar.tsx ← Floating toolbar (bold/italic/color/size)
│   ├── canvas/
│   │   └── node-context-menu.tsx ← Right-click menu
│   ├── ui/                      ← Radix wrappers (dialog, toast, context-menu, etc.)
│   ├── rename-modal.tsx, confirm-modal.tsx
│   └── theme-toggle.tsx         ← Navbar dark mode toggle
│
├── hooks/
│   ├── use-board-role.ts        ← RBAC: owner/editor/viewer
│   ├── use-api-mutation.ts, use-debounce.ts, use-toast.ts
│
└── store/
    └── use-rename-modal.ts      ← Zustand store
```

---

## 4. Bugs Đã Fix (Session 2026-02-23)

| Bug | Nguyên nhân | Fix |
|-----|-------------|-----|
| Tiptap SSR hydration | Tiptap v3 yêu cầu `immediatelyRender: false` | Thêm option vào `useEditor()` |
| ClientSideSuspense render function | Liveblocks v3 không dùng render function `{() => ...}` | Đổi sang direct JSX children |
| `@tiptap/extension-text-style` no default export | Tiptap v3 chỉ có named exports | `import { TextStyle, FontSize, Color }` |
| Tiptap FontSize missing | Không có official extension cho FontSize | Tự tạo `tiptap-fontsize-extension.ts` |
| Edge inflexibility | Edges không cho reconnect, click bị path ẩn đè mất | Bật `ConnectionMode.Loose`, thêm `onReconnect` và dùng `interactionWidth` của BaseEdge |
| Storage type error | `unknown[]` không satisfy `LsonObject` | Đổi sang `any[]` |
| Unused lucide icons | `BringToFront`/`SendToBack` không tồn tại | Xóa khỏi import |

---

## 5. Môi Trường

- ✅ **Clerk**: Keys đã điền, auth hoạt động
- ✅ **Convex**: DB chạy tốt (`npx convex dev`)
- ✅ **Liveblocks**: Keys đã điền, real-time hoạt động
- ✅ **Build**: `npm run build` → Exit code 0

---

## 6. Setup Nhanh

```bash
cd d:\Manro\miro-clone
npm install
npx convex dev        # Terminal 1
npm run dev           # Terminal 2
# Mở http://localhost:3000
```

---

## 7. Ghi Chú Kỹ Thuật

| Chủ đề | Ghi chú |
|--------|---------|
| **Tailwind v4** | `@import "tailwindcss"` + `@theme {}` |
| **Clerk v5** | `clerkMiddleware` từ `@clerk/nextjs/server` |
| **Liveblocks v3** | `createRoomContext` + `ClientSideSuspense` (direct children, không render function) |
| **Tiptap v3** | Named exports, `immediatelyRender: false` bắt buộc |
| **React Flow v12** | `NodeResizer`, `panOnDrag`, `selectionOnDrag` — cần `ReactFlowProvider` wrapper |
| **Next.js 16** | `params`/`searchParams` là Promise. Turbopack mặc định |
| **Space-to-pan** | Track `keydown`/`keyup` Space → toggle `panOnDrag`/`selectionOnDrag` |

---

## 8. Gợi Ý Phát Triển Tiếp

1. **Board Templates** — Retrospective, Brainstorm, Flowchart (Thêm template vào canvas)
2. **Cloud Image Upload** — Thay đổi logic upload qua AWS S3/Cloudinary thay vì Base64 để tiết kiệm Storage
3. **Advanced Permissions** — Cấp quyền riêng lẻ cho từng người dùng (share link via email invitation)
