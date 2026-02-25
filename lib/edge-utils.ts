import { Position, type InternalNode } from '@xyflow/react';

interface Point { x: number; y: number; }

function getSideCenters(node: InternalNode): Record<Position, Point> {
    const w = node.measured.width || 0;
    const h = node.measured.height || 0;
    const x = node.internals.positionAbsolute.x;
    const y = node.internals.positionAbsolute.y;

    return {
        [Position.Top]: { x: x + w / 2, y },
        [Position.Bottom]: { x: x + w / 2, y: y + h },
        [Position.Left]: { x, y: y + h / 2 },
        [Position.Right]: { x: x + w, y: y + h / 2 },
    };
}

function getNodeCenter(node: InternalNode): Point {
    const w = node.measured.width || 0;
    const h = node.measured.height || 0;
    const x = node.internals.positionAbsolute.x;
    const y = node.internals.positionAbsolute.y;

    return { x: x + w / 2, y: y + h / 2 };
}

function dist(a: Point, b: Point): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy; // squared distance is fine for comparison
}

const SIDES: Position[] = [Position.Top, Position.Bottom, Position.Left, Position.Right];

// Opposite side mapping — prefers the facing pair first, but falls back to
// the globally shortest side-center pair when nodes are diagonal.
const OPPOSITE: Record<Position, Position> = {
    [Position.Top]: Position.Bottom,
    [Position.Bottom]: Position.Top,
    [Position.Left]: Position.Right,
    [Position.Right]: Position.Left,
};

/**
 * Returns the best (sourcePos, targetPos) pair by:
 * 1. Finding the dominant direction from center-to-center.
 * 2. Using facing sides when nodes are clearly horizontal/vertical.
 * 3. Falling back to a brute-force closest side-center pair for diagonal cases.
 *
 * This hybrid approach produces clean straight/step paths when nodes are aligned
 * and practical diagonal connections when they aren't.
 */
export function getEdgeParams(source: InternalNode, target: InternalNode) {
    const sc = getSideCenters(source);
    const tc = getSideCenters(target);
    const sourceCenter = getNodeCenter(source);
    const targetCenter = getNodeCenter(target);

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // If clearly more horizontal or vertical (ratio > 1.2), use dominant-side
    const ratio = absDx > 0 && absDy > 0 ? Math.max(absDx, absDy) / Math.min(absDx, absDy) : Infinity;

    let bestSourcePos: Position;
    let bestTargetPos: Position;

    if (ratio > 1.4) {
        // Dominant direction is clear
        if (absDx >= absDy) {
            bestSourcePos = dx >= 0 ? Position.Right : Position.Left;
        } else {
            bestSourcePos = dy >= 0 ? Position.Bottom : Position.Top;
        }
        bestTargetPos = OPPOSITE[bestSourcePos];
    } else {
        // Diagonal — brute-force find shortest pair
        let minDist = Infinity;
        bestSourcePos = Position.Right;
        bestTargetPos = Position.Left;

        for (const sp of SIDES) {
            for (const tp of SIDES) {
                const d = dist(sc[sp], tc[tp]);
                if (d < minDist) {
                    minDist = d;
                    bestSourcePos = sp;
                    bestTargetPos = tp;
                }
            }
        }
    }

    return {
        sx: sc[bestSourcePos].x,
        sy: sc[bestSourcePos].y,
        tx: tc[bestTargetPos].x,
        ty: tc[bestTargetPos].y,
        sourcePos: bestSourcePos,
        targetPos: bestTargetPos,
    };
}
