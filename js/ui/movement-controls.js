import { graph, nodes } from "../graph-data.js";
import { state } from "../state.js";
import { ui } from "./dom.js";

function findNeighborInDirection(direction) {
    const [cx, cy] = nodes[state.currentNode].pos;
    const candidates = [];

    for (const { neighbor, weight } of graph[state.currentNode]) {
        const [nx, ny] = nodes[neighbor].pos;
        const dx = nx - cx;
        const dy = ny - cy;
        let matchesDirection = false;

        if (direction === "up" && dy < 0 && Math.abs(dy) >= Math.abs(dx)) matchesDirection = true;
        else if (direction === "down" && dy > 0 && Math.abs(dy) >= Math.abs(dx)) matchesDirection = true;
        else if (direction === "left" && dx < 0 && Math.abs(dx) >= Math.abs(dy)) matchesDirection = true;
        else if (direction === "right" && dx > 0 && Math.abs(dx) >= Math.abs(dy)) matchesDirection = true;

        if (matchesDirection) {
            candidates.push({ score: Math.abs(dx) + Math.abs(dy), neighbor, weight });
        }
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.score - b.score);
    return { neighbor: candidates[0].neighbor, weight: candidates[0].weight };
}

export function move(direction) {
    const nextChoice = findNeighborInDirection(direction);
    if (!nextChoice) return false;

    const { neighbor, weight } = nextChoice;
    updateJerryFacing(state.currentNode, neighbor);
    state.currentNode = neighbor;
    state.path.push(neighbor);
    state.gScore += weight;
    return true;
}

export function updateMovementButtons() {
    ui.btnUp.disabled = findNeighborInDirection("up") === null;
    ui.btnLeft.disabled = findNeighborInDirection("left") === null;
    ui.btnRight.disabled = findNeighborInDirection("right") === null;
    ui.btnDown.disabled = findNeighborInDirection("down") === null;
}

function updateJerryFacing(fromNode, toNode) {
    const [fromX] = nodes[fromNode].pos;
    const [toX] = nodes[toNode].pos;
    if (toX > fromX) state.jerryFacing = "right";
    else if (toX < fromX) state.jerryFacing = "left";
}
