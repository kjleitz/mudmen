import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import snowiness from "@/mapmaking/mudworld/generators/snowiness";
import { ItemType } from "@/models/Item";
import Mudman from "@/models/Mudman";
import Renderer from "@/rendering/base/Renderer";
import { BLACK } from "@/rendering/mudstuff/colors";
import MudmanRenderer from "@/rendering/mudstuff/MudmanRenderer";
import { Shoreline, shorelineAt, shorelineHasLand } from "@/rendering/mudstuff/Shoreline";
import { insideRect } from "@/utilities/geo";

export default class MudworldRenderer {
  public worldRenderer: Renderer;
  public viewportRenderer: Renderer;
  public spaceRenderer: Renderer;
  public mudmanRenderer: MudmanRenderer;
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

    const mudmanSize = 16;
    this.mudmanRenderer = new MudmanRenderer(mudmanSize, fps);

    const createMudman = (x?: number, y?: number) => {
      if (typeof x !== "number" || typeof y !== "number") {
        const mudmanCoords = this.world.data.map.randomCoordsOnLand();
        x = mudmanCoords[0];
        y = mudmanCoords[1];
      }

      const mudman = new Mudman(x, y, 20 * this.world.data.map.tileSize, mudmanSize);
      this.world.data.mudmen.push(mudman);
    };

    createMudman(350, 200);
    // const population = 100;
    const population = 0;
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

  eachTileInViewport(
    viewportOriginX: number,
    viewportOriginY: number,
    mapper: (
      row: number,
      col: number,
      worldX: number,
      worldY: number,
      viewportX: number,
      viewportY: number,
      tileSize: number,
    ) => void,
  ): void {
    const { map } = this.world.data;
    const { tileSize } = this;
    const minCol = Math.max(0, map.xToCol(viewportOriginX));
    const maxCol = Math.min(map.colCount - 1, map.xToCol(viewportOriginX + this.viewportWidth));
    const minRow = Math.max(0, map.yToRow(viewportOriginY));
    const maxRow = Math.min(map.rowCount - 1, map.yToRow(viewportOriginY + this.viewportHeight));

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const worldX = col * tileSize;
        const worldY = row * tileSize;
        mapper(
          row,
          col,
          worldX,
          worldY,
          worldX - viewportOriginX,
          worldY - viewportOriginY,
          tileSize,
        );
      }
    }
  }

  drawShoreline(
    ctx: CanvasRenderingContext2D,
    worldX: number,
    worldY: number,
    drawX: number,
    drawY: number,
    tileSize: number,
    landRed = 0,
    landGreen = 200,
    landBlue = 0,
  ): void {
    const shoreline = shorelineAt(worldX, worldY, this.world.data.map, tileSize);

    if (shorelineHasLand(shoreline, Shoreline.NONE)) return;

    const halfTileSize = tileSize / 2;
    const tileLeftX = drawX;
    const tileRightX = tileLeftX + tileSize;
    const tileTopY = drawY;
    const tileBottomY = drawY + tileSize;
    const tileCenterX = tileLeftX + halfTileSize;
    const tileCenterY = drawY + halfTileSize;

    const shoreSize = tileSize / 4;
    const shoreTopY = tileTopY + shoreSize;
    const shoreBottomY = tileTopY + (tileSize - shoreSize);
    const shoreLeftX = tileLeftX + shoreSize;
    const shoreRightX = tileLeftX + (tileSize - shoreSize);

    // Always going to need to be checked
    const landTop = shorelineHasLand(shoreline, Shoreline.TOP);
    const landRight = shorelineHasLand(shoreline, Shoreline.RIGHT);
    const landBottom = shorelineHasLand(shoreline, Shoreline.BOTTOM);
    const landLeft = shorelineHasLand(shoreline, Shoreline.LEFT);

    // Might not need to be checked
    let landTopLeft: boolean;
    let landTopRight: boolean;
    let landBottomRight: boolean;
    let landBottomLeft: boolean;

    ctx.fillStyle = `rgb(${landRed}, ${landGreen}, ${landBlue})`;

    // const write = (text: string, offsetX = 0, offsetY = 0): void => {
    //   const oldStyle = ctx.fillStyle;
    //   ctx.fillStyle = "black";
    //   ctx.fillText(text, tileCenterX + offsetX, tileCenterY + offsetY);
    //   ctx.fillStyle = oldStyle;
    // };

    // .--------.
    // |????????|
    // |?      ?|
    // |????????|
    // '--------'
    if (landTop) {
      // .--------.
      // |########|
      // |?      ?|
      // |????????|
      // '--------'
      ctx.fillRect(tileLeftX, tileTopY, tileSize, shoreSize);
      // write("^");

      if (landBottom) {
        // .--------.
        // |########|
        // |?      ?|
        // |########|
        // '--------'
        ctx.fillRect(tileLeftX, shoreBottomY, tileSize, shoreSize);
        // write("v", 0, 5);

        if (landRight || landLeft) {
          if (landRight) {
            // write(">", 5, 0);
            ctx.fillRect(tileCenterX, tileTopY, halfTileSize, tileSize);
          }
          if (landLeft) {
            // write("<", -5, 0);
            ctx.fillRect(tileLeftX, tileTopY, halfTileSize, tileSize);
          }

          // carve out a center circle
          const oldStyle = ctx.fillStyle;
          ctx.fillStyle = "rgb(0, 100, 200)";
          ctx.beginPath();
          ctx.arc(tileCenterX, tileCenterY, shoreSize, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = oldStyle;
        }
        // .--------. | .--------. | .--------. | .--------.
        // |########| | |########| | |########| | |########|
        // |x      x| | |#      x| | |x      #| | |#      #|
        // |########| | |########| | |########| | |########|
        // '--------' | '--------' | '--------' | '--------'

        return;
      }
      // .--------.
      // |########|
      // |?      ?|
      // |?xxxxxx?|
      // '--------'

      if (landRight) {
        // .--------.
        // |########|
        // |?      #|
        // |?xxxxxx#|
        // '--------'
        ctx.beginPath();
        ctx.moveTo(tileCenterX, tileTopY);
        ctx.lineTo(tileCenterX, shoreTopY);
        ctx.arcTo(shoreRightX, shoreTopY, shoreRightX, tileBottomY, shoreSize);
        ctx.lineTo(shoreRightX, tileBottomY);
        ctx.lineTo(tileRightX, tileBottomY);
        ctx.lineTo(tileRightX, tileTopY);
        ctx.closePath();
        ctx.fill();
        // write(">", 5, 0);

        if (landLeft) {
          // .--------.
          // |########|
          // |#      #|
          // |#xxxxxx#|
          // '--------'
          ctx.beginPath();
          ctx.moveTo(tileCenterX, tileTopY);
          ctx.lineTo(tileCenterX, shoreTopY);
          ctx.arcTo(shoreLeftX, shoreTopY, shoreLeftX, tileBottomY, shoreSize);
          ctx.lineTo(shoreLeftX, tileBottomY);
          ctx.lineTo(tileLeftX, tileBottomY);
          ctx.lineTo(tileLeftX, tileTopY);
          ctx.closePath();
          ctx.fill();
          // write("<", -5, 0);

          return;
        }
        // .--------.
        // |########|
        // |x      #|
        // |?xxxxxx#|
        // '--------'

        landBottomLeft ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_LEFT);
        if (landBottomLeft) {
          ctx.beginPath();
          ctx.arc(tileLeftX, tileBottomY, shoreSize, -0.5 * Math.PI, 0);
          ctx.lineTo(tileLeftX, tileBottomY);
          ctx.closePath();
          ctx.fill();
          // write(".", -5, 5);
        }
        // .--------. | .--------.
        // |########| | |########|
        // |x      #| | |x      #|
        // |#xxxxxx#| | |xxxxxxx#|
        // '--------' | '--------'

        return;
      }
      // .--------.
      // |########|
      // |?      x|
      // |?xxxxxx?|
      // '--------'

      if (landLeft) {
        // .--------.
        // |########|
        // |#      x|
        // |#xxxxxx?|
        // '--------'
        ctx.beginPath();
        ctx.moveTo(tileCenterX, tileTopY);
        ctx.lineTo(tileCenterX, shoreTopY);
        ctx.arcTo(shoreLeftX, shoreTopY, shoreLeftX, tileBottomY, shoreSize);
        ctx.lineTo(shoreLeftX, tileBottomY);
        ctx.lineTo(tileLeftX, tileBottomY);
        ctx.lineTo(tileLeftX, tileTopY);
        ctx.closePath();
        ctx.fill();
        // write("<", -5, 0);

        landBottomRight ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_RIGHT);
        if (landBottomRight) {
          ctx.beginPath();
          ctx.arc(tileRightX, tileBottomY, shoreSize, Math.PI, -0.5 * Math.PI);
          ctx.lineTo(tileRightX, tileBottomY);
          ctx.closePath();
          ctx.fill();
          // write(".", 5, 5);
        }
        // .--------. | .--------.
        // |########| | |########|
        // |#      x| | |#      x|
        // |#xxxxxxx| | |#xxxxxx#|
        // '--------' | '--------'

        return;
      }
      // .--------.
      // |########|
      // |x      x|
      // |?xxxxxx?|
      // '--------'

      landBottomLeft ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_LEFT);
      landBottomRight ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_RIGHT);
      if (landBottomLeft) {
        ctx.beginPath();
        ctx.arc(tileLeftX, tileBottomY, shoreSize, -0.5 * Math.PI, 0);
        ctx.lineTo(tileLeftX, tileBottomY);
        ctx.closePath();
        ctx.fill();
        // write(".", -5, 5);
      }
      if (landBottomRight) {
        ctx.beginPath();
        ctx.arc(tileRightX, tileBottomY, shoreSize, Math.PI, -0.5 * Math.PI);
        ctx.lineTo(tileRightX, tileBottomY);
        ctx.closePath();
        ctx.fill();
        // write(".", 5, 5);
      }
      // .--------. | .--------. | .--------. | .--------.
      // |########| | |########| | |########| | |########|
      // |x      x| | |x      x| | |x      x| | |x      x|
      // |xxxxxxxx| | |xxxxxxx#| | |#xxxxxxx| | |#xxxxxx#|
      // '--------' | '--------' | '--------' | '--------'
    } else if (landBottom) {
      // .--------.
      // |?xxxxxx?|
      // |?      ?|
      // |########|
      // '--------'
      ctx.fillRect(tileLeftX, shoreBottomY, tileSize, shoreSize);
      // write("v", 0, 5);
      // write(`${tileTopY}`, 0, 0);


      if (landLeft) {
        // .--------.
        // |#xxxxxx?|
        // |#      ?|
        // |########|
        // '--------'
        ctx.beginPath();
        ctx.moveTo(tileCenterX, tileBottomY);
        ctx.lineTo(tileCenterX, shoreBottomY);
        ctx.arcTo(shoreLeftX, shoreBottomY, shoreLeftX, tileTopY, shoreSize);
        ctx.lineTo(shoreLeftX, tileTopY);
        ctx.lineTo(tileLeftX, tileTopY);
        ctx.lineTo(tileLeftX, tileBottomY);
        ctx.closePath();
        ctx.fill();
        // write("<", -5, 0);

        if (landRight) {
          // .--------.
          // |#xxxxxx#|
          // |#      #|
          // |########|
          // '--------'
          ctx.beginPath();
          ctx.moveTo(tileCenterX, tileBottomY);
          ctx.lineTo(tileCenterX, shoreBottomY);
          ctx.arcTo(shoreRightX, shoreBottomY, shoreRightX, tileTopY, shoreSize);
          ctx.lineTo(shoreRightX, tileTopY);
          ctx.lineTo(tileRightX, tileTopY);
          ctx.lineTo(tileRightX, tileBottomY);
          ctx.closePath();
          ctx.fill();
          // write(">", 5, 0);

          return;
        }
        // .--------.
        // |#xxxxxx?|
        // |#      x|
        // |########|
        // '--------'

        landTopRight ??= shorelineHasLand(shoreline, Shoreline.TOP_RIGHT);
        if (landTopRight) {
          ctx.beginPath();
          ctx.arc(tileRightX, tileTopY, shoreSize, 0.5 * Math.PI, Math.PI);
          ctx.lineTo(tileRightX, tileTopY);
          ctx.closePath();
          ctx.fill();
          // write(".", 5, -5);
        }
        // .--------. | .--------.
        // |#xxxxxxx| | |#xxxxxx#|
        // |#      x| | |#      x|
        // |########| | |########|
        // '--------' | '--------'

        return;
      }
      // .--------.
      // |?xxxxxx?|
      // |x      ?|
      // |########|
      // '--------'

      if (landRight) {
        // .--------.
        // |?xxxxxx#|
        // |x      #|
        // |########|
        // '--------'
        ctx.beginPath();
        ctx.moveTo(tileCenterX, tileBottomY);
        ctx.lineTo(tileCenterX, shoreBottomY);
        ctx.arcTo(shoreRightX, shoreBottomY, shoreRightX, tileTopY, shoreSize);
        ctx.lineTo(shoreRightX, tileTopY);
        ctx.lineTo(tileRightX, tileTopY);
        ctx.lineTo(tileRightX, tileBottomY);
        ctx.closePath();
        ctx.fill();
        // write(">", 5, 0);

        landTopLeft ??= shorelineHasLand(shoreline, Shoreline.TOP_LEFT);
        if (landTopLeft) {
          ctx.beginPath();
          ctx.arc(tileLeftX, tileTopY, shoreSize, 0, 0.5 * Math.PI);
          ctx.lineTo(tileLeftX, tileTopY);
          ctx.closePath();
          ctx.fill();
          // write(".", -5, -5);
        }
        // .--------. | .--------.
        // |xxxxxxx#| | |#xxxxxx#|
        // |x      #| | |x      #|
        // |########| | |########|
        // '--------' | '--------'

        return;
      }
      // .--------.
      // |?xxxxxx?|
      // |x      x|
      // |########|
      // '--------'

      landTopLeft ??= shorelineHasLand(shoreline, Shoreline.TOP_LEFT);
      landTopRight ??= shorelineHasLand(shoreline, Shoreline.TOP_RIGHT);
      if (landTopLeft) {
        ctx.beginPath();
        ctx.arc(tileLeftX, tileTopY, shoreSize, 0, 0.5 * Math.PI);
        ctx.lineTo(tileLeftX, tileTopY);
        ctx.closePath();
        ctx.fill();
        // write(".", -5, -5);
      }
      if (landTopRight) {
        ctx.beginPath();
        ctx.arc(tileRightX, tileTopY, shoreSize, 0.5 * Math.PI, Math.PI);
        ctx.lineTo(tileRightX, tileTopY);
        ctx.closePath();
        ctx.fill();
        // write(".", 5, -5);
      }
      // .--------. | .--------. | .--------. | .--------.
      // |xxxxxxxx| | |#xxxxxxx| | |#xxxxxx#| | |xxxxxxx#|
      // |x      x| | |x      x| | |x      x| | |x      x|
      // |########| | |########| | |########| | |########|
      // '--------' | '--------' | '--------' | '--------'
    } else if (landLeft) {
      // .--------.
      // |#xxxxxx?|
      // |#      ?|
      // |#xxxxxx?|
      // '--------'
      ctx.fillRect(tileLeftX, tileTopY, shoreSize, tileSize);
      // write("<", -5, 0);

      if (landRight) {
        // .--------.
        // |#xxxxxx#|
        // |#      #|
        // |#xxxxxx#|
        // '--------'
        ctx.fillRect(shoreRightX, tileTopY, shoreSize, tileSize);
        // write(">", 5, 0);

        return;
      }
      // .--------.
      // |#xxxxxx?|
      // |#      x|
      // |#xxxxxx?|
      // '--------'

      landTopRight ??= shorelineHasLand(shoreline, Shoreline.TOP_RIGHT);
      landBottomRight ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_RIGHT);
      if (landTopRight) {
        ctx.beginPath();
        ctx.arc(tileRightX, tileTopY, shoreSize, 0.5 * Math.PI, Math.PI);
        ctx.lineTo(tileRightX, tileTopY);
        ctx.closePath();
        ctx.fill();
        // write(".", 5, -5);
      }
      if (landBottomRight) {
        ctx.beginPath();
        ctx.arc(tileRightX, tileBottomY, shoreSize, Math.PI, -0.5 * Math.PI);
        ctx.lineTo(tileRightX, tileBottomY);
        ctx.closePath();
        ctx.fill();
        // write(".", 5, 5);
      }
      // .--------. | .--------. | .--------. | .--------.
      // |#xxxxxxx| | |#xxxxxxx| | |#xxxxxx#| | |#xxxxxx#|
      // |#      x| | |#      x| | |#      x| | |#      x|
      // |#xxxxxxx| | |#xxxxxx#| | |#xxxxxxx| | |#xxxxxx#|
      // '--------' | '--------' | '--------' | '--------'
    } else if (landRight) {
      // .--------.
      // |?xxxxxx#|
      // |x      #|
      // |?xxxxxx#|
      // '--------'
      ctx.fillRect(shoreRightX, tileTopY, shoreSize, tileSize);
      // write(">", 5, 0);

      landTopLeft ??= shorelineHasLand(shoreline, Shoreline.TOP_LEFT);
      landBottomLeft ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_LEFT);
      if (landTopLeft) {
        ctx.beginPath();
        ctx.arc(tileLeftX, tileTopY, shoreSize, 0, 0.5 * Math.PI);
        ctx.lineTo(tileLeftX, tileTopY);
        ctx.closePath();
        ctx.fill();
        // write(".", -5, -5);
      }
      if (landBottomLeft) {
        ctx.beginPath();
        ctx.arc(tileLeftX, tileBottomY, shoreSize, -0.5 * Math.PI, 0);
        ctx.lineTo(tileLeftX, tileBottomY);
        ctx.closePath();
        ctx.fill();
        // write(".", -5, 5);
      }
      // .--------. | .--------. | .--------. | .--------.
      // |xxxxxxx#| | |xxxxxxx#| | |#xxxxxx#| | |#xxxxxx#|
      // |x      #| | |x      #| | |x      #| | |x      #|
      // |xxxxxxx#| | |#xxxxxx#| | |xxxxxxx#| | |#xxxxxx#|
      // '--------' | '--------' | '--------' | '--------'
    } else {
      // .--------.
      // |?xxxxxx?|
      // |x      x|
      // |?xxxxxx?|
      // '--------'

      landTopLeft ??= shorelineHasLand(shoreline, Shoreline.TOP_LEFT);
      landBottomLeft ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_LEFT);
      landTopRight ??= shorelineHasLand(shoreline, Shoreline.TOP_RIGHT);
      landBottomRight ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_RIGHT);
      if (landTopLeft) {
        ctx.beginPath();
        ctx.arc(tileLeftX, tileTopY, shoreSize, 0, 0.5 * Math.PI);
        ctx.lineTo(tileLeftX, tileTopY);
        ctx.closePath();
        ctx.fill();
        // write(".", -5, -5);
      }
      if (landTopRight) {
        ctx.beginPath();
        ctx.arc(tileRightX, tileTopY, shoreSize, 0.5 * Math.PI, Math.PI);
        ctx.lineTo(tileRightX, tileTopY);
        ctx.closePath();
        ctx.fill();
        // write(".", 5, -5);
      }
      if (landBottomRight) {
        ctx.beginPath();
        ctx.arc(tileRightX, tileBottomY, shoreSize, Math.PI, -0.5 * Math.PI);
        ctx.lineTo(tileRightX, tileBottomY);
        ctx.closePath();
        ctx.fill();
        // write(".", 5, 5);
      }
      if (landBottomLeft) {
        ctx.beginPath();
        ctx.arc(tileLeftX, tileBottomY, shoreSize, -0.5 * Math.PI, 0);
        ctx.lineTo(tileLeftX, tileBottomY);
        ctx.closePath();
        ctx.fill();
        // write(".", -5, 5);
      }
      // ,------------+------------.
      // | .--------. | .--------. |
      // | |xxxxxxxx| | |#xxxxxx#| |
      // | |x      x| | |x      x| |
      // | |xxxxxxxx| | |#xxxxxx#| |
      // | '--------' | '--------' |
      // ;------------+------------+------------+------------.
      // | .--------. | .--------. | .--------. | .--------. |
      // | |xxxxxxx#| | |#xxxxxxx| | |#xxxxxx#| | |#xxxxxx#| |
      // | |x      x| | |x      x| | |x      x| | |x      x| |
      // | |#xxxxxx#| | |#xxxxxx#| | |#xxxxxxx| | |xxxxxxx#| |
      // | '--------' | '--------' | '--------' | '--------' |
      // ;------------+------------+------------+------------+------------+------------.
      // | .--------. | .--------. | .--------. | .--------. | .--------. | .--------. |
      // | |xxxxxxxx| | |xxxxxxx#| | |xxxxxxx#| | |#xxxxxxx| | |#xxxxxxx| | |#xxxxxx#| |
      // | |x      x| | |x      x| | |x      x| | |x      x| | |x      x| | |x      x| |
      // | |#xxxxxx#| | |#xxxxxxx| | |xxxxxxx#| | |xxxxxxx#| | |#xxxxxxx| | |xxxxxxxx| |
      // | '--------' | '--------' | '--------' | '--------' | '--------' | '--------' |
      // ;------------+------------+------------+------------+------------+------------'
      // | .--------. | .--------. | .--------. | .--------. |
      // | |#xxxxxxx| | |xxxxxxx#| | |xxxxxxxx| | |xxxxxxxx| |
      // | |x      x| | |x      x| | |x      x| | |x      x| |
      // | |xxxxxxxx| | |xxxxxxxx| | |xxxxxxx#| | |#xxxxxxx| |
      // | '--------' | '--------' | '--------' | '--------' |
      // '------------+------------+------------+------------'
    }
  }

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
    const x = col * tileSize;
    const y = row * tileSize;
    const baseRed = elevation / 1.5;
    const baseGreen = moisture;
    const baseBlue = elevation / 2.5;

    if (underwater) {
      ctx.fillStyle = "rgb(0, 100, 200)";
      ctx.fillRect(x, y, tileSize, tileSize);
      this.drawShoreline(ctx, x, y, x, y, tileSize, baseRed, baseGreen, baseBlue);
    } else {
      // TODO: have a set of pre-defined tile color/illustrations when each
      //       value is within a certain range
      const white = snowiness(elevation);
      const red = Math.floor(Math.max(white, baseRed));
      const green = Math.floor(Math.max(white, baseGreen));
      const blue = Math.floor(Math.max(white, baseBlue));
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(x, y, tileSize, tileSize);
    }

    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
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

    this.viewportRenderer.drawLoop((ctx, timestamp) => {
      this.world.data.timestamp = timestamp;

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

      // items (water)
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

      // items (fire)
      this.world.data.items.forEachOfType(ItemType.FIRE, (item) => {
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

        ctx.fillStyle = "red";
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

        this.mudmanRenderer.drawMudman(
          ctx,
          mudman,
          mudman.local.x - viewportOriginX,
          mudman.local.y - viewportOriginY,
          timestamp,
        );

        mudman.tick();
      });

      // ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillStyle = BLACK;
      ctx.globalAlpha = 0.35 * (1 - this.world.daylight);
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
      ctx.globalAlpha = 1;

      // const { map } = this.world.data;
      // this.eachTileInViewport(viewportOriginX, viewportOriginY, (row, col, worldX, worldY, viewportX, viewportY, tileSize) => {
      //   // if (map.underwaterAt(worldX, worldY)) {
      //   //   this.drawShoreline(ctx, worldX, worldY, viewportX, viewportY, tileSize);
      //   // }
      //   const tileCenterX = viewportX + (tileSize / 2);
      //   const tileCenterY = viewportY + (tileSize / 2);
      //   const tileValue = map.valueAt(worldX, worldY);
      //   const underwater = MudworldMap.underwaterFromTileValue(tileValue);
      //   const elevation = MudworldMap.elevationFromTileValue(tileValue);
      //   const moisture = MudworldMap.moistureFromTileValue(tileValue);
      //   const hasGrass = !underwater && elevation < SNOW_LINE && moisture > 170;
      //   if (hasGrass) {
      //     const grassCoverage = weightLow(moistureNoise(worldX / worldWidth, worldY / worldHeight));
      //     const grassBladeCount = (3 * Math.floor(grassCoverage * tileSize));
      //     const timeFraction = (timestamp % 2000) / 2000;
      //     const windSpeed = (1 + Math.sin(timeFraction * (2 * Math.PI))) / 2;
      //     // const grassLean = moistureNoise((worldX / worldWidth) * windSpeed, (worldY / worldHeight) * windSpeed)
      //     const grassLean = (moistureNoise(windSpeed, windSpeed) + 1) / 2;
      //     for (let i = 0; i < grassBladeCount; i++) {
      //       // const bladeX = tileCenterX + ((Math.random() - 0.5) * tileSize);
      //       // const bladeY = tileCenterY + ((Math.random() - 0.5) * tileSize);
      //       const bladeX = viewportX + (tileSize * ((i + 0.5) / grassBladeCount));
      //       const bladeY = viewportY + (tileSize * (((i * 2 + 1) % grassBladeCount) / grassBladeCount));

      //       ctx.beginPath();
      //       ctx.moveTo(bladeX, bladeY);
      //       // ctx.lineTo(bladeX + Math.floor(Math.random() * 5), bladeY - 3);
      //       // ctx.lineTo(bladeX + Math.floor(windSpeed * 5), bladeY - 3);
      //       ctx.lineTo(bladeX + Math.floor(grassLean * 5), bladeY - 3);
      //       ctx.strokeStyle = "rgba(0, 255, 0, 0.25)";
      //       // ctx.strokeStyle = "rgba(0, 255, 0, 1)";
      //       ctx.stroke();
      //     }
      //   }
      // });
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
