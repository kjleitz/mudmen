import { mudworld } from "@/behavior/mudman/data/MudworldBlackboard";
import MudworldRenderer from "@/rendering/mudstuff/MudworldRenderer";

window.addEventListener("DOMContentLoaded", () => {
  const viewportCanvas = document.getElementById("viewport") as HTMLCanvasElement;
  // document.body.tabIndex = 0;
  // document.body.focus();
  const renderer = new MudworldRenderer(viewportCanvas, mudworld, 24);
  renderer.drawWorld();
  renderer.drawSpace();
  renderer.drawLoop();

  document.body.addEventListener("keydown", (event) => {
    // console.log(event);
    if (event.key === "ArrowRight") {
      renderer.nextHero();
    } else if (event.key === "ArrowLeft") {
      renderer.prevHero();
    }
  });

  viewportCanvas.addEventListener("click", (event) => {
    // console.log(event);
    // if (event.key === "ArrowRight") {
    //   renderer.nextHero();
    // } else if (event.key === "ArrowLeft") {
    //   renderer.prevHero();
    // }
    const { x, y, data } = renderer.hero.local;
    const viewportOriginX = x - (renderer.viewportWidth / 2);
    const viewportOriginY = y - (renderer.viewportHeight / 2);
    const destX = viewportOriginX + event.offsetX;
    const destY = viewportOriginY + event.offsetY;

    renderer.world.data.map.populatePath(
      data.path,
      x,
      y,
      destX,
      destY,
      data.eyesight,
    );
  });

  // TODO: remove
  (window as any).renderer = renderer;
  (window as any).pathFinder = renderer.world.data.map.pathFinder;
});

