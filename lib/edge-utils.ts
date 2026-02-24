import { Position, type InternalNode } from '@xyflow/react';

// Returns the position (top,bottom,left,right) of the target node relative to the source node
function getTargetPosition(source: InternalNode, target: InternalNode) {
    const sourceCenter = {
        x: source.internals.positionAbsolute.x + (source.measured.width || 0) / 2,
        y: source.internals.positionAbsolute.y + (source.measured.height || 0) / 2,
    };
    const targetCenter = {
        x: target.internals.positionAbsolute.x + (target.measured.width || 0) / 2,
        y: target.internals.positionAbsolute.y + (target.measured.height || 0) / 2,
    };

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? Position.Right : Position.Left;
    }
    return dy > 0 ? Position.Bottom : Position.Top;
}

// Calculate the intersection point of a line segment between a node's center and another point,
// bounded by the node's rectangular dimensions.
function getNodeIntersection(intersectionNode: InternalNode, targetNode: InternalNode) {
    // Treat nodes as rectangles.
    const w = (intersectionNode.measured.width || 0) / 2;
    const h = (intersectionNode.measured.height || 0) / 2;

    const sourceCenter = {
        x: intersectionNode.internals.positionAbsolute.x + w,
        y: intersectionNode.internals.positionAbsolute.y + h,
    };
    const targetCenter = {
        x: targetNode.internals.positionAbsolute.x + (targetNode.measured.width || 0) / 2,
        y: targetNode.internals.positionAbsolute.y + (targetNode.measured.height || 0) / 2,
    };

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    if (dx === 0 && dy === 0) return sourceCenter;

    // Use similar triangles to find the bounding box intersection.
    // (Intersection on vertical vs horizontal edges depends on the aspect ratio vs path slope)
    const ratioX = Math.abs(w / dx);
    const ratioY = Math.abs(h / dy);
    const ratio = Math.min(ratioX, ratioY);

    return {
        x: sourceCenter.x + dx * ratio,
        y: sourceCenter.y + dy * ratio,
    };
}

// Returns the parameters to construct the Edge, given two internal nodes.
export function getEdgeParams(source: InternalNode, target: InternalNode) {
    const sourceIntersectionPoint = getNodeIntersection(source, target);
    const targetIntersectionPoint = getNodeIntersection(target, source);

    const sourcePos = getTargetPosition(source, target);
    const targetPos = getTargetPosition(target, source);

    return {
        sx: sourceIntersectionPoint.x,
        sy: sourceIntersectionPoint.y,
        tx: targetIntersectionPoint.x,
        ty: targetIntersectionPoint.y,
        sourcePos,
        targetPos,
    };
}
