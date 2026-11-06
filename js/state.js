import { START_NODE } from "./graph-data.js";

// The application state is kept in one place so modules do not create
// unrelated globals or reach into the DOM to coordinate with one another.
export const state = {
    currentNode: START_NODE,
    path: [START_NODE],
    gScore: 0,

    astarPath: [],
    astarCost: null,
    astarVisited: [],
    astarComparisonHistory: [],
    astarBestEdge: null,
    astarAnimationTimer: null,
    astarSession: null,
    astarStatus: "idle",
    astarAnimationSpeed: 450,

    isRatView: true,
    jerryFacing: "right",
};

export function resetState() {
    state.currentNode = START_NODE;
    state.path = [START_NODE];
    state.gScore = 0;
    state.astarPath = [];
    state.astarCost = null;
    state.astarVisited = [];
    state.astarComparisonHistory = [];
    state.astarBestEdge = null;
    state.astarAnimationTimer = null;
    state.astarSession = null;
    state.astarStatus = "idle";
    state.jerryFacing = "right";
}
