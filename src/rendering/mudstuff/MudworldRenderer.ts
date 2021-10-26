import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";
import Mudman from "@/models/Mudman";
import Renderer from "@/rendering/base/Renderer";
import { insideRect } from "@/utilities/geo";

export default class MudworldRenderer {
  public worldRenderer: Renderer;
  public viewportRenderer: Renderer;
  public world: MudworldBlackboard;
  public hero: Mudman;

  constructor(viewportCanvas: HTMLCanvasElement, mudworldBlackboard: MudworldBlackboard, fps = 24) {
    this.world = mudworldBlackboard;

    this.worldRenderer = new Renderer(
      document.createElement("canvas"),
      mudworldBlackboard.data.map.width,
      mudworldBlackboard.data.map.height,
      fps,
    );

    this.viewportRenderer = new Renderer(
      viewportCanvas,
      viewportCanvas.width,
      viewportCanvas.height,
      fps,
    );

    const mudmanCoords = this.world.data.map.randomCoordsOnLand();
    this.hero = new Mudman(mudmanCoords[0], mudmanCoords[1]);
    // this.hero = new Mudman(0, 0);
  }

  set fps(framesPerSecond: number) { this.viewportRenderer.fps = framesPerSecond }

  get worldWidth(): number { return this.worldRenderer.canvas.width }
  get worldHeight(): number { return this.worldRenderer.canvas.height }

  get viewportWidth(): number { return this.viewportRenderer.canvas.width }
  get viewportHeight(): number { return this.viewportRenderer.canvas.height }

  get tileSize(): number { return this.world.data.map.tileSize }

  drawWorld(): void {
    this.worldRenderer.drawOnce((ctx, _timestamp) => {
      ctx.clearRect(0, 0, this.worldWidth, this.worldHeight);
      const { tileSize } = this;
      this.world.data.map.eachTile((row, col, elevation, moisture, structure, underwater) => {
        if (underwater) {
          ctx.fillStyle = "rgb(0, 100, 200)";
        } else {
          // TODO: have a set of pre-defined tile color/illustrations when each
          //       value is within a certain range
          ctx.fillStyle = `rgb(${elevation}, ${moisture}, ${(elevation / 2).toFixed(0)})`;
        }

        const x = col * tileSize;
        const y = row * tileSize;
        ctx.fillRect(x, y, tileSize, tileSize);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.125)";
        ctx.strokeRect(x, y, tileSize, tileSize);
      });
    });
  }

  drawLoop(): void {
    const { viewportWidth, viewportHeight } = this;
    this.viewportRenderer.drawLoop((ctx, _timestamp) => {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      const viewportOriginX = this.hero.local.x - (viewportWidth / 2);
      const viewportOriginY = this.hero.local.y - (viewportHeight / 2);

      ctx.drawImage(
        this.worldRenderer.canvas,
        viewportOriginX, viewportOriginY,
        viewportWidth, viewportHeight,
        0, 0,
        viewportWidth, viewportHeight,
      );

      ctx.fillStyle = "red";
      ctx.fillRect((viewportWidth / 2) - 5, (viewportHeight / 2) - 5, 10, 10);

      this.world.data.items.forEachOfType(ItemType.WATER, (item) => {
        if (item.used || item.held) return;

        const inView = insideRect(
          item.x,
          item.y,
          viewportOriginX,
          viewportOriginY,
          viewportWidth,
          viewportHeight,
        );

        if (!inView) return;

        const x = item.x - viewportOriginX;
        const y = item.y - viewportOriginY;

        ctx.fillStyle = "blueviolet";
        ctx.fillRect(x - 4, y - 4, 8, 8);
      });

      this.hero.tick();
    });
  }
}
