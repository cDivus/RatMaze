// Initialize A* session state (logic only).
function createAstarSession(start, goal) {
    const openSet = new PriorityQueue();
    openSet.enqueue(start, nodes[start].h);

    const gScores = {};
    for (const nodeId in nodes) gScores[nodeId] = Infinity;
    gScores[start] = 0;

    return {
        start,
        goal,
        openSet,
        cameFrom: {},
        gScores,
        visitedOrder: [],
        closedSet: new Set(),
        stepCount: 0,
    };
}