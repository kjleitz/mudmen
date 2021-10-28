import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import snowiness from "@/mapmaking/mudworld/generators/snowiness";
import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import { ItemType } from "@/models/Item";
import Mudman from "@/models/Mudman";
import Renderer from "@/rendering/base/Renderer";
import { insideRect } from "@/utilities/geo";

export enum Shoreline {
  NONE,
  TOP_LEFT_NUB,
  TOP_RIGHT_NUB,
  BOTTOM_RIGHT_NUB,
  BOTTOM_LEFT_NUB,
  TOP_SHORE,
  RIGHT_SHORE,
  BOTTOM_SHORE,
  LEFT_SHORE,
  TOP_LEFT_WRAP,
  TOP_RIGHT_WRAP,
  BOTTOM_RIGHT_WRAP,
  BOTTOM_LEFT_WRAP,
  TOP_WRAP,
  RIGHT_WRAP,
  BOTTOM_WRAP,
  LEFT_WRAP,
  FULL_WRAP,
}

export default class MudworldRenderer {
  public worldRenderer: Renderer;
  public viewportRenderer: Renderer;
  public spaceRenderer: Renderer;
  public world: MudworldBlackboard;
  // public hero: Mudman;

  private heroIndex = 0;

  constructor(viewportCanvas: HTMLCanvasElement, mudworldBlackboard: MudworldBlackboard, fps = 24) {
    this.world = mudworldBlackboard;

    this.worldRenderer = new Renderer(
      document.createElement("canvas"),
      mudworldBlackboard.data.map.width,
      mudworldBlackboard.data.map.height,
      fps,
    );

    this.spaceRenderer = new Renderer(
      document.createElement("canvas"),
      viewportCanvas.width,
      viewportCanvas.height,
      fps,
    );

    this.viewportRenderer = new Renderer(
      viewportCanvas,
      viewportCanvas.width,
      viewportCanvas.height,
      fps,
    );

    const createMudman = () => {
      const mudmanCoords = this.world.data.map.randomCoordsOnLand();
      const mudman = new Mudman(mudmanCoords[0], mudmanCoords[1], 20 * this.world.data.map.tileSize);
      this.world.data.mudmen.push(mudman);
    };

    const population = 100;
    for (let i = 0; i < population; i++) {
      createMudman();
    }
  }

  set fps(framesPerSecond: number) { this.viewportRenderer.fps = framesPerSecond }

  get hero(): Mudman { return this.world.data.mudmen[this.heroIndex] }

  get worldWidth(): number { return this.worldRenderer.canvas.width }
  get worldHeight(): number { return this.worldRenderer.canvas.height }

  get spaceWidth(): number { return this.spaceRenderer.canvas.width }
  get spaceHeight(): number { return this.spaceRenderer.canvas.height }

  get viewportWidth(): number { return this.viewportRenderer.canvas.width }
  get viewportHeight(): number { return this.viewportRenderer.canvas.height }

  get tileSize(): number { return this.world.data.map.tileSize }

  // shorelineForTile(x: number, y: number): Shoreline {
  //   let shoreline: Shoreline;
  //   let topLeftLand = false;
  //   let topLand = false;
  //   let topRightLand = false;
  //   let rightLand = false;
  //   let bottomRightLand = false;
  //   let bottomLand = false;
  //   let bottomLeftLand = false;
  //   let leftLand = false;
  //   // this.world.data.map.eachNeighboringTile(row, col, (_row, _col, _elevation, _moisture, _structure, underwater) => {
  //   //   if (underwater) return;
  //   //   if ()
  //   // });

  //   x = Math.floor(x);
  //   y = Math.floor(y);

  //   let ny: number;
  //   let nx: number;
  //   const { map } = this.world.data;
  //   const { tileSize } = this;

  //   // === TOP ROW ===
  //   ny = y - tileSize;

  //   // top left
  //   nx = x - tileSize;
  //   topLeftLand = !map.underwaterAt(nx, ny);

  //   // top
  //   nx = x;
  //   topLand = !map.underwaterAt(nx, ny);

  //   // top right
  //   nx = x + tileSize;
  //   topRightLand = !map.underwaterAt(nx, ny);

  //   // === LEFT AND RIGHT SIDES ===
  //   ny = y;

  //   // left
  //   nx = x - tileSize;
  //   rightLand = !map.underwaterAt(nx, ny);

  //   // right
  //   nx = x + tileSize;
  //   bottomRightLand = !map.underwaterAt(nx, ny);

  //   // === BOTTOM ROW ===
  //   ny = y + tileSize;

  //   // bottom left
  //   nx = x - tileSize;
  //   bottomLand = !map.underwaterAt(nx, ny);

  //   // bottom
  //   nx = x;
  //   bottomLeftLand = !map.underwaterAt(nx, ny);

  //   // bottom right
  //   nx = x + tileSize;
  //   leftLand = !map.underwaterAt(nx, ny);

  //   if (topLeftLand)
  // }

  drawTile(
    ctx: CanvasRenderingContext2D,
    row: number,
    col: number,
    tileSize: number,
    elevation: number,
    moisture: number,
    structure: number,
    underwater: boolean,
  ): void {
    if (underwater) {
      ctx.fillStyle = "rgb(0, 100, 200)";

    } else {
      // TODO: have a set of pre-defined tile color/illustrations when each
      //       value is within a certain range
      const white = snowiness(elevation);
      const baseRed = elevation / 1.5;
      const baseGreen = moisture;
      const baseBlue = elevation / 2.5;
      const red = Math.floor(Math.max(white, baseRed));
      const green = Math.floor(Math.max(white, baseGreen));
      const blue = Math.floor(Math.max(white, baseBlue));
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    }

    const x = col * tileSize;
    const y = row * tileSize;
    ctx.fillRect(x, y, tileSize, tileSize);

    ctx.strokeStyle = "rgba(0, 0, 0, 0.125)";
    ctx.strokeRect(x, y, tileSize, tileSize);
  }

  drawWorld(): void {
    this.worldRenderer.drawOnce((ctx, _timestamp) => {
      ctx.clearRect(0, 0, this.worldWidth, this.worldHeight);
      const { tileSize } = this;

      this.world.data.map.eachTile((row, col, elevation, moisture, structure, underwater) => {
        this.drawTile(ctx, row, col, tileSize, elevation, moisture, structure, underwater);
      });
    });
  }

  drawSpace(): void {
    this.spaceRenderer.drawOnce((ctx, _timestamp) => {
      const { spaceWidth, spaceHeight } = this;
      ctx.clearRect(0, 0, spaceWidth, spaceHeight);
      const starCount = 1000;
      for (let n = 0; n < starCount; n++) {
        const x = Math.floor(Math.random() * spaceWidth);
        const y = Math.floor(Math.random() * spaceHeight);
        const size = Math.floor((1 - Math.sqrt(Math.random())) * 4);
        const opacity = Math.sqrt(Math.random()).toFixed(2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(x, y, size, size);
      }
    });
  }

  drawLoop(): void {
    const {
      viewportWidth,
      viewportHeight,
      worldWidth,
      worldHeight,
      spaceWidth,
      spaceHeight,
    } = this;

    this.viewportRenderer.drawLoop((ctx, _timestamp) => {
      // ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);

      const viewportOriginX = this.hero.local.x - (viewportWidth / 2);
      const viewportOriginY = this.hero.local.y - (viewportHeight / 2);

      if (
        viewportOriginX < 0
        || viewportOriginY < 0
        || viewportOriginX + viewportWidth > worldWidth
        || viewportOriginY + viewportHeight > worldHeight
      ) {
        // space & stars
        ctx.drawImage(
          this.spaceRenderer.canvas,
          0, 0,
          spaceWidth, spaceHeight,
          0, 0,
          viewportWidth, viewportHeight,
        );

        // mudworld's shadow
        const shadowX = viewportOriginX < 0 ? Math.abs(viewportOriginX) : 0;
        const shadowY = viewportOriginY < 0 ? Math.abs(viewportOriginY) : 0;
        const shadowWidth = viewportOriginX + viewportWidth > worldWidth ? (worldWidth - viewportOriginX) : viewportWidth;
        const shadowHeight = viewportOriginY + viewportHeight > worldHeight ? (worldHeight - viewportOriginY) : viewportHeight;
        const shadowGirth = Math.floor(viewportWidth / 40);

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

        // first layer of shadow
        ctx.fillRect(
          shadowX - (shadowGirth / 2),
          shadowY - (shadowGirth / 2),
          shadowWidth + shadowGirth,
          shadowHeight + shadowGirth,
        );

        // second layer of shadow
        ctx.fillRect(
          shadowX - shadowGirth,
          shadowY - shadowGirth,
          shadowWidth + (shadowGirth * 2),
          shadowHeight + (shadowGirth * 2),
        );

        // atmosphere
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "rgb(0, 0, 255)";
        ctx.shadowBlur = 50;
        ctx.fillStyle = "rgb(0, 0, 255)";
        ctx.fillRect(shadowX - 0.5, shadowY - 0.5, shadowWidth + 1, shadowHeight + 1);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      // the planet
      ctx.drawImage(
        this.worldRenderer.canvas,
        viewportOriginX, viewportOriginY,
        viewportWidth, viewportHeight,
        0, 0,
        viewportWidth, viewportHeight,
      );

      // items
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

      // population
      this.world.data.mudmen.forEach((mudman) => {
        const inView = insideRect(
          mudman.local.x,
          mudman.local.y,
          viewportOriginX,
          viewportOriginY,
          viewportWidth,
          viewportHeight,
        );

        if (!inView) return;

        const x = mudman.local.x - viewportOriginX;
        const y = mudman.local.y - viewportOriginY;
        const mudmanSize = 10;

        ctx.fillStyle = "red";
        ctx.fillRect(
          Math.floor(x - (mudmanSize / 2)),
          Math.floor(y - (mudmanSize / 2)),
          mudmanSize,
          mudmanSize,
        );

        mudman.tick();
      });
    });
  }

  nextHero(): void {
    this.heroIndex = (this.heroIndex + 1) % this.world.data.mudmen.length;
  }

  prevHero(): void {
    this.heroIndex = this.heroIndex === 0
      ? this.world.data.mudmen.length - 1
      : this.heroIndex - 1;
  }
}
