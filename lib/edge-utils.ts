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

// Returns the parameters to construct the Edge, given two internal nodes.
// It smartly finds the closest pair of side-centers between the two nodes.
export function getEdgeParams(source: InternalNode, target: InternalNode) {
    const sourceCenters = getSideCenters(source);
    const targetCenters = getSideCenters(target);

    let minDistance = Infinity;
    let bestSourcePos = Position.Right;
    let bestTargetPos = Position.Left;

    const positions = [Position.Top, Position.Right, Position.Bottom, Position.Left];

    for (const sPos of positions) {
        for (const tPos of positions) {
            const sPoint = sourceCenters[sPos];
            const tPoint = targetCenters[tPos];

            // Euclidean distance squared
            const dist = Math.pow(sPoint.x - tPoint.x, 2) + Math.pow(sPoint.y - tPoint.y, 2);

            if (dist < minDistance) {
                minDistance = dist;
                bestSourcePos = sPos;
                bestTargetPos = tPos;
            }
        }
    }

    return {
        sx: sourceCenters[bestSourcePos].x,
        sy: sourceCenters[bestSourcePos].y,
        tx: targetCenters[bestTargetPos].x,
        ty: targetCenters[bestTargetPos].y,
        sourcePos: bestSourcePos,
        targetPos: bestTargetPos,
    };
}
