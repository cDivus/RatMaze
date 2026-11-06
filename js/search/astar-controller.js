import { GOAL_NODE, START_NODE, nodes } from "../graph-data.js";
import { createAstarSession, step } from "./astar-core.js";
import { resetState, state } from "../state.js";
import { ui } from "../ui/dom.js";

function clearAstarTimer() {
    if (state.astarAnimationTimer !== null) {
        clearTimeout(state.astarAnimationTimer);
        state.astarAnimationTimer = null;
    }
}

function syncAstarButton() {
    ui.btnRunAstar.disabled = false;

    if (state.astarStatus === "running") {
        ui.btnRunAstar.textContent = "Pause A* Search";
    } else if (state.astarStatus === "paused") {
        ui.btnRunAstar.textContent = "Resume A* Search";
    } else {
        ui.btnRunAstar.textContent = "Run A* Search";
    }
}

export function stopAstarAnimation() {
    clearAstarTimer();
    state.astarSession = null;
    state.astarStatus = "idle";
    syncAstarButton();
}

export function pauseAstarAnimation(render) {
    if (state.astarStatus !== "running") return;

    clearAstarTimer();
    state.astarStatus = "paused";
    syncAstarButton();
    render();
}

export function resumeAstarAnimation(render) {
    if (state.astarStatus !== "paused" || !state.astarSession) return;

    state.astarStatus = "running";
    syncAstarButton();
    render();
    stepThroughSearch(render);
}

function finalizeAstarRun(stepResult, reachedGoal, render) {
    clearAstarTimer();

    if (reachedGoal) {
        state.astarPath = stepResult.path;
        state.astarCost = stepResult.cost;
        state.path = stepResult.path.slice();
        state.currentNode = GOAL_NODE;
        state.gScore = stepResult.cost ?? 0;
        state.jerryFacing = "right";
    }

    state.astarVisited = stepResult.visited;
    state.astarBestEdge = null;
    state.astarSession = null;
    state.astarStatus = "idle";
    syncAstarButton();
    render();
}

function stepThroughSearch(render) {
    if (state.astarStatus !== "running" || !state.astarSession) return;

    const stepResult = step(state.astarSession);
    state.astarVisited = stepResult.visited;

    if (stepResult.comparisons && stepResult.comparisons.length > 0) {
        state.astarComparisonHistory.push({
            step: stepResult.step,
            current: stepResult.current,
            candidates: stepResult.comparisons,
            bestNeighbor: stepResult.bestNeighbor,
        });
        state.astarBestEdge = stepResult.bestNeighbor
            ? { from: stepResult.current, to: stepResult.bestNeighbor }
            : null;
    } else {
        state.astarBestEdge = null;
    }

    if (stepResult.current !== null) {
        state.path = stepResult.path;
        state.currentNode = stepResult.current;
        state.gScore = stepResult.cost ?? 0;

        if (state.path.length > 1) {
            const previousNode = state.path[state.path.length - 2];
            state.jerryFacing = nodes[previousNode].pos[0] <= nodes[state.currentNode].pos[0]
                ? "right"
                : "left";
        } else {
            state.jerryFacing = "right";
        }
        render();
    }

    if (stepResult.status === "goal") {
        finalizeAstarRun(stepResult, true, render);
        return;
    }

    if (stepResult.status === "exhausted") {
        finalizeAstarRun(stepResult, false, render);
        return;
    }

    state.astarAnimationTimer = setTimeout(
        () => stepThroughSearch(render),
        state.astarAnimationSpeed,
    );
}

export function runAstar(render) {
    if (state.astarStatus === "running") {
        pauseAstarAnimation(render);
        return;
    }

    if (state.astarStatus === "paused") {
        resumeAstarAnimation(render);
        return;
    }

    stopAstarAnimation();
    state.astarSession = createAstarSession(START_NODE, GOAL_NODE);
    state.astarPath = [];
    state.astarCost = null;
    state.astarVisited = [];
    state.astarComparisonHistory = [];
    state.astarBestEdge = null;
    state.currentNode = START_NODE;
    state.path = [START_NODE];
    state.gScore = 0;
    state.astarStatus = "running";
    syncAstarButton();
    render();
    stepThroughSearch(render);
}

export function resetAstar(render) {
    stopAstarAnimation();
    resetState();
    syncAstarButton();
    render();
}
