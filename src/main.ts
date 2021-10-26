import { mudworld } from "@/behavior/mudman/data/MudworldBlackboard";
import MudworldRenderer from "@/rendering/mudstuff/MudworldRenderer";

window.addEventListener("DOMContentLoaded", () => {
  const viewportCanvas = document.getElementById("viewport") as HTMLCanvasElement;
  const renderer = new MudworldRenderer(viewportCanvas, mudworld, 24);
  renderer.drawWorld();
  renderer.drawLoop();

  // TODO: remove
  (window as any).renderer = renderer;
  (window as any).pathFinder = renderer.world.data.map.pathFinder;
});

