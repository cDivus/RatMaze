import { graph, nodes } from "../graph-data.js";
import { PriorityQueue } from "./priority-queue.js";

export function createAstarSession(start, goal) {
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

export function step(session) {
    while (!session.openSet.isEmpty()) {
        const current = session.openSet.dequeue();

        if (session.closedSet.has(current)) continue;

        session.closedSet.add(current);
        session.visitedOrder.push(current);
        session.stepCount += 1;

        const comparisons = [];
        let bestNeighbor = null;
        let bestScore = Infinity;

        if (current === session.goal) {
            const pathResult = reconstructPath(session.cameFrom, current);
            return {
                status: "goal",
                current,
                path: pathResult,
                cost: session.gScores[current],
                visited: session.visitedOrder.slice(),
                comparisons,
                bestNeighbor,
                step: session.stepCount,
            };
        }

        const pathToCurrent = reconstructPath(session.cameFrom, current);
        const forwardSet = new Set(pathToCurrent);

        for (const { neighbor, weight } of graph[current]) {
            const tentativeG = session.gScores[current] + weight;
            const hScore = nodes[neighbor].h;
            const fScore = tentativeG + hScore;

            if (tentativeG < session.gScores[neighbor]) {
                if (!forwardSet.has(neighbor)) {
                    const gText = buildWeightExpression(pathToCurrent, weight);
                    comparisons.push({ neighbor, g: tentativeG, gText, h: hScore, f: fScore, weight });
                    if (fScore < bestScore) {
                        bestScore = fScore;
                        bestNeighbor = neighbor;
                    }
                }

                session.cameFrom[neighbor] = current;
                session.gScores[neighbor] = tentativeG;
                session.openSet.enqueue(neighbor, fScore);
            }
        }

        return {
            status: "expanded",
            current,
            path: reconstructPath(session.cameFrom, current),
            cost: session.gScores[current],
            visited: session.visitedOrder.slice(),
            comparisons,
            bestNeighbor,
            step: session.stepCount,
        };
    }

    return {
        status: "exhausted",
        current: null,
        path: [],
        cost: null,
        visited: session.visitedOrder.slice(),
        comparisons: [],
        bestNeighbor: null,
        step: session.stepCount,
    };
}

export function aStar(start, goal) {
    const session = createAstarSession(start, goal);
    let stepResult = step(session);

    while (stepResult.status === "expanded") {
        stepResult = step(session);
    }

    if (stepResult.status === "goal") {
        return {
            path: stepResult.path,
            cost: stepResult.cost,
            visited: stepResult.visited,
            cameFrom: session.cameFrom,
        };
    }

    return {
        path: [],
        cost: null,
        visited: session.visitedOrder.slice(),
        cameFrom: session.cameFrom,
    };
}

export function reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom[current]) {
        current = cameFrom[current];
        path.push(current);
    }
    return path.reverse();
}

export function getEdgeWeight(from, to) {
    const neighbors = graph[from] || [];
    for (const { neighbor, weight } of neighbors) {
        if (neighbor === to) return weight;
    }
    return null;
}

export function buildWeightExpression(pathArr, extraWeight) {
    const weights = [];
    for (let i = 0; i < pathArr.length - 1; i++) {
        const weight = getEdgeWeight(pathArr[i], pathArr[i + 1]);
        if (weight !== null) weights.push(weight);
    }
    if (typeof extraWeight === "number") weights.push(extraWeight);
    return weights.length === 0 ? "0" : weights.join(" + ");
}
