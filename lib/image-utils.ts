export interface OptimizedImageResult {
    dataUrl: string;
    width: number;
    height: number;
}

export interface OptimizeOptions {
    /** Maximum width or height in pixels (default 1800) */
    maxDimension?: number;
    /** Output quality 0-1 (default 0.85) */
    quality?: number;
}

// ── Helpers ──────────────────────────────────────────────────────

function readBlobAsDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }
            reject(new Error("Unable to read image as data URL"));
        };
        reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
        reader.readAsDataURL(blob);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Unable to decode image"));
        img.src = src;
    });
}

/**
 * Tries to use `createImageBitmap` (fast, off-main-thread) before
 * falling back to `<img>` decode.  Returns width, height and the
 * drawable source.
 */
async function decodeBlob(
    blob: Blob
): Promise<{ drawable: CanvasImageSource; w: number; h: number }> {
    // Fast path – most modern browsers
    if (typeof createImageBitmap === "function") {
        try {
            const bmp = await createImageBitmap(blob);
            return { drawable: bmp, w: bmp.width, h: bmp.height };
        } catch {
            /* fall through to <img> path */
        }
    }

    // Fallback – read as data URL then decode via <img>
    const dataUrl = await readBlobAsDataUrl(blob);
    const img = await loadImage(dataUrl);
    return {
        drawable: img,
        w: img.naturalWidth || img.width,
        h: img.naturalHeight || img.height,
    };
}

/**
 * Check if the browser can encode to WebP by doing a tiny test.
 * Cached after first call.
 */
let _webpSupported: boolean | null = null;
function supportsWebp(): boolean {
    if (_webpSupported !== null) return _webpSupported;
    try {
        const c = document.createElement("canvas");
        c.width = 1;
        c.height = 1;
        _webpSupported = c.toDataURL("image/webp").startsWith("data:image/webp");
    } catch {
        _webpSupported = false;
    }
    return _webpSupported;
}

// ── Main export ──────────────────────────────────────────────────

/**
 * Takes any image Blob (screenshot, file upload, drag-drop) and
 * returns an optimised data-URL that is small enough for Liveblocks
 * storage, together with the final pixel dimensions.
 *
 * Pipeline:
 * 1. Decode via `createImageBitmap` (fast) or `<img>` fallback.
 * 2. Down-scale if either dimension exceeds `maxDimension`.
 * 3. Encode to WebP (or JPEG fallback) at `quality`.
 */
export async function optimizeImageBlobToDataUrl(
    blob: Blob,
    options: OptimizeOptions = {}
): Promise<OptimizedImageResult> {
    const maxDimension = options.maxDimension ?? 1800;
    const quality = options.quality ?? 0.85;

    try {
        const { drawable, w: origW, h: origH } = await decodeBlob(blob);

        if (!origW || !origH) {
            // Could not determine dimensions – return raw data URL
            const fallback = await readBlobAsDataUrl(blob);
            return { dataUrl: fallback, width: 800, height: 600 };
        }

        // Calculate target size
        const scale = Math.min(1, maxDimension / Math.max(origW, origH));
        const width = Math.max(1, Math.round(origW * scale));
        const height = Math.max(1, Math.round(origH * scale));

        // Draw to an off-screen canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            const fallback = await readBlobAsDataUrl(blob);
            return { dataUrl: fallback, width: origW, height: origH };
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(drawable, 0, 0, width, height);

        // Encode – prefer WebP, fall back to JPEG
        const mime = supportsWebp() ? "image/webp" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mime, quality);

        return { dataUrl, width, height };
    } catch {
        // Last resort – return the blob unchanged
        const fallback = await readBlobAsDataUrl(blob);
        return { dataUrl: fallback, width: 800, height: 600 };
    }
}
