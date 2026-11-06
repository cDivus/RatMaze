import { nodes } from "../graph-data.js";
import { getEdgeWeight } from "../search/astar-core.js";
import { state } from "../state.js";
import { ui } from "./dom.js";

export function updateInfo() {
    const h = nodes[state.currentNode].h;
    const gExpression = buildGScoreExpression();
    const gTotal = gExpression.total;

    ui.currentNodeDisplay.innerText = state.currentNode;
    ui.gScoreDisplay.innerText = gExpression.text;
    ui.hScoreDisplay.innerText = h;
    ui.fScoreDisplay.innerText = gTotal + h;
    renderComparisonHistory();
}

function renderComparisonHistory() {
    if (!state.astarComparisonHistory || state.astarComparisonHistory.length === 0) {
        ui.comparisonList.innerHTML = "<div class=\"comparison-empty\">No comparisons yet.</div>";
        return;
    }

    const recent = state.astarComparisonHistory.slice(-6);
    ui.comparisonList.innerHTML = recent.map((entry) => {
        const header = `<div class="comparison-step">Step ${entry.step} - ${entry.current}</div>`;
        const lines = entry.candidates.map((candidate) => {
            const isBest = candidate.neighbor === entry.bestNeighbor;
            const rowClass = isBest ? "comparison-line best" : "comparison-line";
            const gText = candidate.gText || candidate.g.toString();
            const equation = `f(n) = ${gText} + ${candidate.h} = ${candidate.f}`;
            return `<div class="${rowClass}"><span class="comparison-node">${candidate.neighbor}</span><span class="comparison-eq">${equation}</span></div>`;
        }).join("");
        return `<div class="comparison-block">${header}${lines}</div>`;
    }).join("");
}

function buildGScoreExpression() {
    const currentPath = buildCurrentPath();
    if (currentPath.length < 2) return { text: "0", total: 0 };

    const weights = [];
    for (let i = 0; i < currentPath.length - 1; i++) {
        const edgeWeight = getEdgeWeight(currentPath[i], currentPath[i + 1]);
        if (edgeWeight !== null) weights.push(edgeWeight);
    }

    const total = weights.reduce((sum, value) => sum + value, 0);
    return weights.length === 0
        ? { text: "0", total: 0 }
        : { text: `${weights.join(" + ")} = ${total}`, total };
}

function buildCurrentPath() {
    const stack = [];
    const indexByNode = new Map();

    for (const nodeId of state.path) {
        if (indexByNode.has(nodeId)) {
            const index = indexByNode.get(nodeId);
            for (let i = stack.length - 1; i > index; i--) {
                indexByNode.delete(stack[i]);
                stack.pop();
            }
        } else {
            indexByNode.set(nodeId, stack.length);
            stack.push(nodeId);
        }
    }

    return stack;
}
