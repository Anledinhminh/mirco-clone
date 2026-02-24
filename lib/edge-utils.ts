import { Position, type InternalNode } from '@xyflow/react';

// Computes both the intersection point on the bounding box and the Side (Position) the point lies on
function getIntersectionAndPosition(node: InternalNode, targetNode: InternalNode) {
    const w = (node.measured.width || 0) / 2;
    const h = (node.measured.height || 0) / 2;

    const sourceCenter = {
        x: node.internals.positionAbsolute.x + w,
        y: node.internals.positionAbsolute.y + h,
    };
    const targetCenter = {
        x: targetNode.internals.positionAbsolute.x + (targetNode.measured.width || 0) / 2,
        y: targetNode.internals.positionAbsolute.y + (targetNode.measured.height || 0) / 2,
    };

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    if (dx === 0 && dy === 0) {
        return { point: sourceCenter, position: Position.Top };
    }

    const ratioX = Math.abs(w / dx);
    const ratioY = Math.abs(h / dy);
    const ratio = Math.min(ratioX, ratioY);

    const intersectionPoint = {
        x: sourceCenter.x + dx * ratio,
        y: sourceCenter.y + dy * ratio,
    };

    let position: Position;
    // If ratioX is smaller, the point lies on the left or right edge
    if (ratioX < ratioY) {
        position = dx > 0 ? Position.Right : Position.Left;
    } else {
        // If ratioY is smaller or equal, the point lies on the top or bottom edge
        position = dy > 0 ? Position.Bottom : Position.Top;
    }

    return { point: intersectionPoint, position };
}

// Returns the parameters to construct the Edge, given two internal nodes.
export function getEdgeParams(source: InternalNode, target: InternalNode) {
    const sourceResult = getIntersectionAndPosition(source, target);
    const targetResult = getIntersectionAndPosition(target, source);

    return {
        sx: sourceResult.point.x,
        sy: sourceResult.point.y,
        tx: targetResult.point.x,
        ty: targetResult.point.y,
        sourcePos: sourceResult.position,
        targetPos: targetResult.position,
    };
}
