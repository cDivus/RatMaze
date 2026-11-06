import {
    CANVAS_MARGIN_TOP,
    GOAL_NODE,
    NODE_RADIUS,
    START_NODE,
    edges,
    nodes,
} from "../graph-data.js";
import { state } from "../state.js";
import { ctx, ui } from "./dom.js";

function edgeIsInPath(path, a, b) {
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        if ((a === from && b === to) || (a === to && b === from)) return true;
    }
    return false;
}

function edgeIsBestComparison(a, b) {
    if (!state.astarBestEdge) return false;
    return (state.astarBestEdge.from === a && state.astarBestEdge.to === b)
        || (state.astarBestEdge.from === b && state.astarBestEdge.to === a);
}

function drawPolyline(points, color, width, glow = false) {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = glow ? 15 : 0;
    ctx.shadowColor = color;
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function edgePoints(a, b, via) {
    const [x1, y1] = nodes[a].pos;
    const [x2, y2] = nodes[b].pos;
    const points = [[x1, y1]];
    if (via && via.length > 0) {
        for (const point of via) {
            if (point && point.length === 2) points.push(point);
        }
    }
    points.push([x2, y2]);
    return points;
}

export function drawGraph() {
    ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
    ctx.save();
    ctx.translate(0, CANVAS_MARGIN_TOP);

    if (state.isRatView) {
        ctx.drawImage(ui.images.mazeOutline, 50, -25, 900, 850);

        if (ui.heuristicToggle.checked) {
            const scale = 0.85;
            const overlayW = 900 * scale;
            const overlayH = 850 * scale;
            const overlayX = 70 + (900 - overlayW) / 2;
            const overlayY = -25 + (850 - overlayH) / 2;
            ctx.drawImage(ui.images.heuristic, overlayX, overlayY, overlayW, overlayH);
        }

        for (const [a, b, , via] of edges) {
            const points = edgePoints(a, b, via);
            if (edgeIsBestComparison(a, b)) {
                drawPolyline(points, "rgba(34,197,94,0.85)", 16, true);
            } else if (edgeIsInPath(state.astarPath, a, b)) {
                drawPolyline(points, "rgba(255,235,59,0.75)", 15, true);
            } else if (edgeIsInPath(state.path, a, b)) {
                drawPolyline(points, "rgba(255,152,0,0.75)", 10, true);
            }
        }

        const [gx, gy] = nodes[GOAL_NODE].pos;
        const [rx, ry] = nodes[state.currentNode].pos;

        if (state.currentNode === GOAL_NODE) {
            ctx.drawImage(ui.images.end, gx - 50, gy - 50, 100, 100);
        } else {
            const jerrySprite = state.jerryFacing === "left"
                ? ui.images.jerryLeft
                : ui.images.jerryRight;
            ctx.drawImage(jerrySprite, rx - 40, ry - 30, 80, 60);
            ctx.drawImage(ui.images.tom, gx - 45, gy - 45, 90, 90);
        }
    } else {
        ctx.globalAlpha = 0.18;
        ctx.drawImage(ui.images.mazeOutline, 50, -25, 900, 850);
        ctx.globalAlpha = 1;

        for (const [a, b, weight, via] of edges) {
            const points = edgePoints(a, b, via);
            const inAstar = edgeIsInPath(state.astarPath, a, b);
            const inManual = edgeIsInPath(state.path, a, b);
            const inBest = edgeIsBestComparison(a, b);

            let color = "#475569";
            let width = 2;
            let glow = false;
            if (inManual) { color = "#f59e0b"; width = 4; }
            if (inAstar) { color = "#06b6d4"; width = 5; glow = true; }
            if (inBest) { color = "#22c55e"; width = 6; glow = true; }
            drawPolyline(points, color, width, glow);

            const mid = Math.floor((points.length - 1) / 2);
            const mx = (points[mid][0] + points[mid + 1][0]) / 2;
            const my = (points[mid][1] + points[mid + 1][1]) / 2;
            ctx.fillStyle = inAstar ? "#06b6d4" : (inManual ? "#f59e0b" : "#10b981");
            ctx.font = "bold 13px 'Outfit'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(weight.toString(), mx, my - 9);
        }

        for (const nodeId in nodes) {
            const { pos: [x, y], h } = nodes[nodeId];
            let fill = "#ffffff";
            let outline = "#8b5cf6";
            let width = 3;

            if (state.astarVisited.includes(nodeId)) fill = "#ede9fe";
            if (state.astarPath.includes(nodeId)) fill = "#cffafe";
            if (nodeId === GOAL_NODE) fill = "#d1fae5";
            if (nodeId === state.currentNode) {
                fill = "#fef08a";
                outline = "#ef4444";
                width = 5;
            }
            if (nodeId === START_NODE && nodeId !== state.currentNode) outline = "#ef4444";

            ctx.beginPath();
            ctx.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.lineWidth = width;
            ctx.strokeStyle = outline;
            ctx.stroke();
            ctx.fillStyle = "#6d28d9";
            ctx.font = "bold 12px 'Outfit'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(h.toString(), x, y);
        }
    }

    ctx.restore();
}
