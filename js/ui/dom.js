const get = (id) => document.getElementById(id);

export const ui = {
    canvas: get("mazeCanvas"),
    btnUp: get("btnUp"),
    btnLeft: get("btnLeft"),
    btnRight: get("btnRight"),
    btnDown: get("btnDown"),
    btnRunAstar: get("btnRunAstar"),
    btnReset: get("btnReset"),
    currentNodeDisplay: get("currentNodeDisplay"),
    gScoreDisplay: get("gScoreDisplay"),
    hScoreDisplay: get("hScoreDisplay"),
    fScoreDisplay: get("fScoreDisplay"),
    viewToggle: get("viewToggle"),
    heuristicToggle: get("heuristicToggle"),
    speedSlider: get("speedSlider"),
    speedDisplay: get("speedDisplay"),
    comparisonList: get("comparisonList"),
    images: {
        mazeOutline: get("imgMazeOutline"),
        jerryRight: get("imgJerryRight"),
        jerryLeft: get("imgJerryLeft"),
        tom: get("imgTom"),
        heuristic: get("imgHeuristic"),
        end: get("imgEnd"),
    },
};

export const ctx = ui.canvas.getContext("2d");
