import { Position, type InternalNode } from '@xyflow/react';

function getSideCenters(node: InternalNode) {
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

function getNodeCenter(node: InternalNode) {
    const w = node.measured.width || 0;
    const h = node.measured.height || 0;
    const x = node.internals.positionAbsolute.x;
    const y = node.internals.positionAbsolute.y;

    return {
        x: x + w / 2,
        y: y + h / 2,
    };
}

function getDominantSide(dx: number, dy: number): Position {
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0 ? Position.Right : Position.Left;
    }

    return dy >= 0 ? Position.Bottom : Position.Top;
}

// Returns the parameters to construct the Edge, given two internal nodes.
// It smartly finds the closest pair of side-centers between the two nodes.
export function getEdgeParams(source: InternalNode, target: InternalNode) {
    const sourceCenters = getSideCenters(source);
    const targetCenters = getSideCenters(target);
    const sourceCenter = getNodeCenter(source);
    const targetCenter = getNodeCenter(target);

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    const bestSourcePos = getDominantSide(dx, dy);
    const bestTargetPos = getDominantSide(-dx, -dy);

    return {
        sx: sourceCenters[bestSourcePos].x,
        sy: sourceCenters[bestSourcePos].y,
        tx: targetCenters[bestTargetPos].x,
        ty: targetCenters[bestTargetPos].y,
        sourcePos: bestSourcePos,
        targetPos: bestTargetPos,
    };
}
