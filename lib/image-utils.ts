export interface OptimizedImageResult {
    dataUrl: string;
    width: number;
    height: number;
}

interface OptimizeOptions {
    maxDimension?: number;
    quality?: number;
}

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

async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    const dataUrl = await readBlobAsDataUrl(blob);

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to decode image"));
        image.src = dataUrl;
    });
}

export async function optimizeImageBlobToDataUrl(
    blob: Blob,
    options: OptimizeOptions = {}
): Promise<OptimizedImageResult> {
    const maxDimension = options.maxDimension ?? 2200;
    const quality = options.quality ?? 0.88;

    try {
        const image = await loadImageFromBlob(blob);
        const originalWidth = image.naturalWidth || image.width;
        const originalHeight = image.naturalHeight || image.height;

        if (!originalWidth || !originalHeight) {
            const fallback = await readBlobAsDataUrl(blob);
            return { dataUrl: fallback, width: 1200, height: 900 };
        }

        const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
        const width = Math.max(1, Math.round(originalWidth * scale));
        const height = Math.max(1, Math.round(originalHeight * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
            const fallback = await readBlobAsDataUrl(blob);
            return { dataUrl: fallback, width: originalWidth, height: originalHeight };
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, width, height);

        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        return {
            dataUrl: webpDataUrl,
            width,
            height,
        };
    } catch {
        const fallback = await readBlobAsDataUrl(blob);
        return {
            dataUrl: fallback,
            width: 1200,
            height: 900,
        };
    }
}
