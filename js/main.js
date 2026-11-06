import { resetAstar, runAstar } from "./search/astar-controller.js";
import { state } from "./state.js";
import { drawGraph } from "./ui/canvas-renderer.js";
import { ui } from "./ui/dom.js";
import { updateInfo } from "./ui/info-panel.js";
import { move, updateMovementButtons } from "./ui/movement-controls.js";

function renderApp() {
    drawGraph();
    updateInfo();
    updateMovementButtons();
}

function bindEvents() {
    ui.viewToggle.addEventListener("change", (event) => {
        state.isRatView = event.target.checked;
        renderApp();
    });

    ui.heuristicToggle.addEventListener("change", renderApp);

    ui.speedSlider.addEventListener("input", (event) => {
        state.astarAnimationSpeed = parseInt(event.target.value, 10);
        ui.speedDisplay.innerText = `${state.astarAnimationSpeed}ms`;
    });

    ui.btnRunAstar.addEventListener("click", () => runAstar(renderApp));
    ui.btnReset.addEventListener("click", () => resetAstar(renderApp));

    const moveAndRender = (direction) => {
        if (move(direction)) renderApp();
        else updateMovementButtons();
    };

    ui.btnUp.addEventListener("click", () => moveAndRender("up"));
    ui.btnLeft.addEventListener("click", () => moveAndRender("left"));
    ui.btnRight.addEventListener("click", () => moveAndRender("right"));
    ui.btnDown.addEventListener("click", () => moveAndRender("down"));

    document.addEventListener("keydown", (event) => {
        const directionByKey = {
            ArrowUp: "up",
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowDown: "down",
        };
        const direction = directionByKey[event.key];
        if (!direction) return;
        event.preventDefault();
        moveAndRender(direction);
    });
}

function redrawWhenImagesFinishLoading() {
    for (const image of Object.values(ui.images)) {
        if (!image.complete) {
            image.addEventListener("load", renderApp, { once: true });
            image.addEventListener("error", renderApp, { once: true });
        }
    }
}

bindEvents();
redrawWhenImagesFinishLoading();
renderApp();
