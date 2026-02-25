# 📋 Tài Liệu Bàn Giao – Miro Clone

> **Ngày cập nhật:** 2026-02-25 (v3)  
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
| 📝 Rich Text Node | Tiptap editor: Bold, Italic, Underline, Font size (custom extension), Color, Alignment. Placeholder text, dark mode, auto-height. |
| 🖼️ Image Node | URL input + Upload từ file picker + Drag & Drop + Ctrl+V screenshot, có optimize ảnh client-side trước khi lưu để giảm lag |
| 📌 Sticky Note | Markdown rendering, 4 colors (yellow/blue/pink/green) |
| 🔲 Shape Node | Rectangle, Circle, Triangle, Diamond with text support |
| 🖍️ Pen Tool | Freehand drawing using `perfect-freehand` with real-time sync |
| 🔗 Ultimate Connections | Bi-directional handles (source/target 4 cạnh), hybrid routing (dominant-side + brute-force closest pair cho diagonal), bezier mặc định, live preview mượt hơn với ghost stroke, dark mode labels. |
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
| Tiptap Toolbar focus loss | Toolbar auto unmount khi click `<select>` vì mất focus editor. Nút bấm bị event drag của ReactFlow chặn | Bọc class `nodrag` cho editor & toolbar, dùng `requestAnimationFrame` + `containerRef.contains` để giữ toolbar khi focus ở select, đổi `onClick` sang `onPointerDown`. |
| Edge clipping & overlapping | Lưới kẻ ô vuông thỉnh thoảng đâm xuyên qua góc hộp hình chữ nhật hoặc tự sinh nếp gấp thừa | Đổi logic `getEdgeParams` từ trượt viền (sliding) sang "Smart side-centers" (khoảng cách Euclidean ngắn nhất giữa trung điểm 4 cạnh) và đặt `borderRadius: 16`. |
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

---

## 9. Cập nhật mới (Session 2026-02-25)

### ✅ Connecting mượt & linh hoạt hơn

- Chuyển các node chính (`text`, `image`, `sticky`, `shape`) sang **bi-directional handles** ở cả 4 cạnh (vừa source vừa target) để kéo/thả kết nối dễ hơn.
- Sửa hiển thị handles bằng `group` wrapper để trạng thái hover hoạt động đúng (trước đó một số node bị ẩn handle liên tục).
- Tăng độ dễ bắt khi nối/reconnect với:
    - `connectionRadius={36}`
    - `reconnectRadius={36}`
    - `autoPanOnConnect`
- Cải thiện logic routing trong `lib/edge-utils.ts`: chọn cạnh bám theo vector hướng giữa tâm 2 node để đường nối ổn định hơn, giảm giật cạnh khi node gần nhau.
- Đổi live connection preview sang bezier (`components/edges/connection-line.tsx`) để cảm giác kéo dây mượt hơn.
- Fix bug xoá edge từ context menu: không còn gọi nhầm luồng xoá node.

### ✅ Upload ảnh + Ctrl+V screenshot — REBUILT (v2)

**Root cause đã fix:** `ImageNode` dùng `useState` nhưng không sync lại khi Liveblocks storage cập nhật URL từ bên ngoài (paste/drop). Kết quả: paste screenshot xong, node vẫn hiện form "Paste URL" trống.

**Thay đổi chi tiết:**

#### `components/nodes/image-node.tsx` — Xây lại hoàn toàn:
- **useEffect sync** từ `data.url` (Liveblocks) → local state: khi canvas ghi URL vào storage, node tự hiện ảnh ngay.
- **Node-level paste/drop**: mỗi ImageNode tự listen `onPaste` + `onDrop`, cho phép paste/drop ảnh trực tiếp vào node đã có.
- **File picker riêng**: nút "Upload" mở file dialog tại chỗ trong node.
- **Loading overlay**: spinner hiện trong khi optimize ảnh, tránh mất phản hồi.
- **Skeleton shimmer**: hiệu ứng shimmer trước khi ảnh render xong.
- **`object-contain` full-size**: ảnh chiếm 100% node container, không bị crop hay giới hạn `max-h`.
- **Dark mode**: hỗ trợ đầy đủ `dark:` classes.
- **Clean empty state**: 2 nút Upload + URL + gợi ý "Ctrl+V to paste".

#### `app/board/[boardId]/_components/canvas.tsx` — Paste handler cải thiện:
- Listener paste dùng **capture phase** (`addEventListener("paste", ..., true)`) để bắt event trước React Flow.
- Check `isTextInput` kỹ hơn: bao gồm cả `.ProseMirror` (Tiptap editor).
- `e.stopPropagation()` sau xử lý để các handler khác không nhận event.
- `addImageFromBlob` giờ có `try/catch` − im lặng nếu ảnh lỗi, không crash.
- Truyền `maxDimension: 1800` + `quality: 0.85` rõ ràng.

#### `lib/image-utils.ts` — Pipeline optimize nhanh hơn:
- Dùng `createImageBitmap` (off-main-thread decode) khi có, fallback `<img>`.
- Auto-detect WebP support, fallback JPEG.
- Mặc định `maxDimension: 1800`, `quality: 0.85` (nhỏ hơn trước, phù hợp Liveblocks quota).
- Export `OptimizeOptions` interface cho consumer tuỳ chỉnh.

---

## 10. Cập nhật mới (Session 2026-02-25 v3)

### ✅ Text Node — Polish toàn diện

- **Dark mode**: container `bg-white dark:bg-slate-800`, border, shadow đều hỗ trợ dark mode.
- **Placeholder**: Thêm `@tiptap/extension-placeholder` — hiện "Type something…" khi node trống, thay vì nội dung tĩnh "Double-click to edit…".
- **Auto-height**: `ResizeObserver` trên `.ProseMirror` content → trigger re-measure khi nội dung thay đổi.
- **Toolbar centered**: Toolbar giờ float ở center (`left-1/2 -translate-x-1/2`) thay vì bám góc trái.
- **`minHeight` giảm**: từ 100px xuống 60px — text node gọn hơn khi ít nội dung.
- **Handle style DRY**: Trích `handleStyle` thành biến chung, handle nhỏ hơn (`!w-2.5 !h-2.5`) + `!rounded-full`.
- **Rich Text Toolbar dark mode**: Tất cả button/select/divider đều hỗ trợ dark mode class.

### ✅ Connecting Lines — Routing & Visual upgrade

#### `lib/edge-utils.ts` — Hybrid routing algorithm:
- **Aligned nodes** (ratio > 1.4): dùng dominant-side logic (nhanh, sạch).
- **Diagonal nodes**: brute-force tìm cặp side-center ngắn nhất trong 16 tổ hợp (4×4).
- Kết quả: đường nối tự nhiên hơn khi node ở góc chéo, không bị lệch cạnh.

#### `components/edges/floating-edge.tsx`:
- **Default path type đổi sang `bezier`** — mượt hơn step, giống Miro hơn.
- **Curvature 0.25** cho bezier path — cong vừa đủ.
- **Selected glow**: dùng `drop-shadow` theo màu edge thay vì hardcode rgba.
- **Label dark mode**: `bg-white/95 dark:bg-slate-800/95`, border, text đều hỗ trợ dark.
- **Label rounded-lg**: bo tròn hơn, padding rộng hơn.

#### `components/edges/connection-line.tsx`:
- **Ghost stroke**: thêm stroke mờ `opacity 0.15, width 10` bên dưới — dễ nhìn hơn khi kéo.
- **Valid indicator**: circle target đổi fill khi valid (`strokeColor` thay vì luôn trắng), phóng to (`r=5`).
- **Curvature 0.25**: đồng bộ với floating edge.

#### `app/globals.css`:
- **`animated-dash` keyframe**: defined animation cho stroke-dashoffset (trước đó class tồn tại nhưng không có CSS).
- **`.text-node-content`**: class riêng điều khiển màu text theo dark mode.
- **Prose dark mode**: thêm dark variants cho `.prose`, `.prose a`, `.prose code`, `.prose blockquote`, `.prose th/td`.

