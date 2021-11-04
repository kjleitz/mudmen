import { mudworld } from "@/behavior/mudman/data/MudworldBlackboard";
import MudworldRenderer from "@/rendering/mudstuff/MudworldRenderer";

window.addEventListener("DOMContentLoaded", () => {
  const viewportCanvas = document.getElementById("viewport") as HTMLCanvasElement;
  const renderer = new MudworldRenderer(viewportCanvas, mudworld, 24);
  renderer.start();

  // renderer.overlayFullMap = true;

  document.body.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowRight": renderer.nextHero(); break;
      case "ArrowLeft": renderer.prevHero(); break;
      case "m": renderer.overlayFullMap = !renderer.overlayFullMap; break;
      case "d": renderer.world.letItBeDay(); break;
      case "n": renderer.world.letItBeNight(); break;
      // default: console.log(event.key);
    }
  });

  viewportCanvas.addEventListener("click", (event) => {
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

    const item = renderer.world.data.items.itemAt(destX, destY, renderer.tileSize);
    if (item) renderer.hero.local.data.targetedItem = item;
  });

  // TODO: remove
  (window as any).renderer = renderer;
  (window as any).pathFinder = renderer.world.data.map.pathFinder;
});

