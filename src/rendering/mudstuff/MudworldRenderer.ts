import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import snowiness from "@/mapmaking/mudworld/generators/snowiness";
import MudworldMap, { Structure } from "@/mapmaking/mudworld/MudworldMap";
import Item, { ItemType } from "@/models/Item";
import Mudman from "@/models/Mudman";
import Renderer from "@/rendering/base/Renderer";
import SpriteRenderer from "@/rendering/base/SpriteRenderer";
import { BLACK, BLUE, DARK_BROWN, DARK_GREEN, DARK_SLATE_GRAY, FOREST_GREEN, LIGHT_HALF, LIGHT_QUARTER, LIGHT_THREE_QUARTERS, PALE_VIOLET_RED, PERU_BROWN, RED, SADDLE_BROWN, SANDY_BROWN, SHADOW_QUARTER, TRANSPARENT, WHITE } from "@/rendering/mudstuff/colors";
import MudmanRenderer from "@/rendering/mudstuff/MudmanRenderer";
import { Shoreline, shorelineAt, shorelineHasLand } from "@/rendering/mudstuff/Shoreline";
import { insideRect } from "@/utilities/geo";
import { weightHigh, weightLow } from "@/utilities/weight";

const enum FlameSprite {
  FLAME_1,
  FLAME_2,
  FLAME_3,
  FLAME_4,
  FLAME_5,
  FLAME_6,
  FLAME_7,
  FLAME_8,
}

const FLAME_SPRITES = [
  FlameSprite.FLAME_1,
  FlameSprite.FLAME_2,
  FlameSprite.FLAME_3,
  FlameSprite.FLAME_4,
  FlameSprite.FLAME_5,
  FlameSprite.FLAME_6,
  FlameSprite.FLAME_7,
  FlameSprite.FLAME_8,
];

const enum BottleSprite {
  EMPTY,
  WATER_FULL,
  WATER_PARTIAL,
}

const enum TreeSprite {
  STUMP,
  BOUGHS_1,
  BOUGHS_2,
  BOUGHS_3,
  BOUGHS_4,
}

const BOUGH_SPRITES = [
  TreeSprite.BOUGHS_1,
  TreeSprite.BOUGHS_2,
  TreeSprite.BOUGHS_3,
  TreeSprite.BOUGHS_4,
];

const f = (val: number): number => Math.floor(val);

export default class MudworldRenderer {
  public worldRenderer: Renderer;
  public viewportRenderer: Renderer;
  public spaceRenderer: Renderer;
  public hudRenderer: Renderer;
  public nightRenderer: Renderer;
  public firelightRenderer: Renderer;
  public flameRenderer: SpriteRenderer;
  public bottleRenderer: SpriteRenderer;
  public treeRenderer: SpriteRenderer;
  public mudmanRenderer: MudmanRenderer;
  public world: MudworldBlackboard;
  public overlayFullMap = false;
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

    this.hudRenderer = new Renderer(
      document.createElement("canvas"),
      viewportCanvas.width,
      viewportCanvas.height,
      6,
    );

    this.nightRenderer = new Renderer(
      document.createElement("canvas"),
      viewportCanvas.width,
      viewportCanvas.height,
      fps,
    );

    this.firelightRenderer = new Renderer(
      document.createElement("canvas"),
      this.firelightSize,
      this.firelightSize,
      12,
    );

    this.flameRenderer = new SpriteRenderer(
      this.tileSize,
      this.tileSize * 2,
      fps,
    );

    this.bottleRenderer = new SpriteRenderer(
      f(this.tileSize / 2.5),
      f(this.tileSize / 2),
      fps,
    );

    this.treeRenderer = new SpriteRenderer(
      this.tileSize * 4,
      this.tileSize * 4,
      fps,
    );

    const drawRandomFlameComponent = (ctx: CanvasRenderingContext2D, width: number, centerX: number, centerY: number, color: string): void => {
      const size = f((0.1 * width) + (0.25 * Math.random() * width));
      const halfSize = f(size / 2);
      const xJitter = (Math.random() - 0.5) * size;
      const yJitter = (weightLow(Math.random()) - 0.5) * size;
      const angle = Math.random() * (2 * Math.PI);
      const x = f(centerX - halfSize + xJitter);
      const y = f(centerY - halfSize + yJitter);

      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.translate(-1 * centerX, -1 * centerY);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.25 + (0.75 * Math.random());
      ctx.fillRect(x, y, size, size);

      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    FLAME_SPRITES.forEach((sprite) => {
      this.flameRenderer.addSprite(sprite, 0, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
        drawRandomFlameComponent(ctx, width, centerX, centerY, "red");
        drawRandomFlameComponent(ctx, width, centerX, centerY, "yellow");
        drawRandomFlameComponent(ctx, width, centerX, centerY, "orange");
        drawRandomFlameComponent(ctx, width / 2, centerX, centerY - f(0.25 * Math.random() * height), "red");
        drawRandomFlameComponent(ctx, width / 2, centerX, centerY - f(0.25 * Math.random() * height), "red");
      });
    });

    const createBottlePath = (
      width: number,
      height: number,
      centerX: number,
      centerY: number,
      topY: number,
      rightX: number,
      bottomY: number,
      leftX: number,
    ): Path2D => {
      const neckWidth = f(width / 2);
      const neckLeftX = centerX - f(neckWidth / 2);
      const neckRightX = centerX + f(neckWidth / 2);
      const bottomRadius = f(width / 4);
      const lipBottomY = topY + f(height / 8);
      const shoulderY = topY + f(height / 4);
      const neckRadius = f((shoulderY - lipBottomY) / 2);

      const bottlePath = new Path2D();

      bottlePath.moveTo(neckLeftX, topY);
      bottlePath.lineTo(neckRightX, topY);
      bottlePath.lineTo(neckRightX, lipBottomY);
      bottlePath.arc(neckRightX, lipBottomY + neckRadius, neckRadius, -0.5 * Math.PI, 0.5 * Math.PI, true);
      bottlePath.lineTo(rightX, shoulderY);
      bottlePath.lineTo(rightX, bottomY - bottomRadius);
      bottlePath.arc(rightX - bottomRadius, bottomY - bottomRadius, bottomRadius, 0, 0.5 * Math.PI);
      bottlePath.lineTo(leftX + bottomRadius, bottomY);
      bottlePath.arc(leftX + bottomRadius, bottomY - bottomRadius, bottomRadius, 0.5 * Math.PI, Math.PI);
      bottlePath.lineTo(leftX, shoulderY);
      bottlePath.lineTo(leftX + f((width - neckWidth) / 2), shoulderY);
      bottlePath.arc(neckLeftX, lipBottomY + neckRadius, neckRadius, 0.5 * Math.PI, -0.5 * Math.PI, true);
      bottlePath.lineTo(neckLeftX, topY);
      bottlePath.closePath();

      return bottlePath;
    };

    this.bottleRenderer.addSprite(BottleSprite.EMPTY, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
      const bottlePath = createBottlePath(width, height, centerX, centerY, topY, rightX, bottomY, leftX);

      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.stroke(bottlePath);
    });

    this.bottleRenderer.addSprite(BottleSprite.WATER_FULL, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
      const bottlePath = createBottlePath(width, height, centerX, centerY, topY, rightX, bottomY, leftX);

      ctx.save();

      ctx.clip(bottlePath);
      ctx.fillStyle = BLUE;
      ctx.fillRect(leftX, topY + f(height / 4), width, height);

      ctx.restore();

      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.stroke(bottlePath);
    });

    this.bottleRenderer.addSprite(BottleSprite.WATER_PARTIAL, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
      const bottlePath = createBottlePath(width, height, centerX, centerY, topY, rightX, bottomY, leftX);

      ctx.save();

      ctx.clip(bottlePath);
      ctx.fillStyle = BLUE;
      ctx.fillRect(leftX, bottomY - f(height / 4), width, height);

      ctx.restore();

      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.stroke(bottlePath);
    });

    this.treeRenderer.addSprite(
      TreeSprite.STUMP, 1,
      this.tileSize,
      this.tileSize,
      (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
        const trunkRadius = f(width / 4);
        const trunkHeight = f(height / 3);
        const sidesBottomY = bottomY - trunkRadius;
        const sidesTopY = sidesBottomY - trunkHeight;

        ctx.fillStyle = DARK_BROWN;
        ctx.lineWidth = 2;
        ctx.strokeStyle = DARK_BROWN;
        ctx.beginPath();
        ctx.arc(centerX, sidesBottomY, trunkRadius, 0, Math.PI);
        ctx.lineTo(centerX - trunkRadius, sidesTopY);
        ctx.lineTo(centerX + trunkRadius, sidesTopY);
        ctx.lineTo(centerX + trunkRadius, sidesBottomY);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = SANDY_BROWN;
        ctx.beginPath();
        ctx.arc(centerX, sidesTopY, trunkRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = PERU_BROWN;
        ctx.beginPath();
        ctx.arc(centerX, sidesTopY, f(trunkRadius / 2), 0, 2 * Math.PI);
        ctx.fill();
      },
    );

    const drawRandomBoughComponent = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, minRadius: number, maxRadius: number, minOpacity: number, maxOpacity: number, color: string, spread: number): void => {
      const baseRadius = f(minRadius + (Math.random() * (maxRadius - minRadius)));
      const avgRadius = (maxRadius + minRadius) / 2;
      const xJitter = f((Math.random() - 0.5) * avgRadius * spread);
      const yJitter = f((-0.5 * Math.random()) * avgRadius * spread);
      const opacity = minOpacity + (Math.random() * (maxOpacity - minOpacity));

      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(
        centerX + xJitter,
        centerY + yJitter,
        baseRadius,
        0,
        2 * Math.PI,
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    BOUGH_SPRITES.forEach((sprite) => {
      const { tileSize } = this;
      this.treeRenderer.addSprite(sprite, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
        const roughStumpCenterY = centerY - f(tileSize / 8);
        const roughStumpRadius = f(tileSize / 3);
        drawRandomBoughComponent(ctx, centerX, roughStumpCenterY, roughStumpRadius, roughStumpRadius, 1, 1, DARK_GREEN, 0);

        for (let i = 0; i < 5; i++) {
          drawRandomBoughComponent(ctx, centerX, roughStumpCenterY - roughStumpRadius, f(tileSize / 2), f(tileSize / 1.5), 0.5, 1, DARK_GREEN, 1);
        }

        for (let i = 0; i < 5; i++) {
          drawRandomBoughComponent(ctx, centerX, roughStumpCenterY - roughStumpRadius, f(tileSize / 16), f(tileSize / 2), 0.1, 0.5, FOREST_GREEN, 3);
        }
      });
    });

    const mudmanSize = 16;
    this.mudmanRenderer = new MudmanRenderer(mudmanSize, fps);

    const createMudman = (x?: number, y?: number) => {
      if (typeof x !== "number" || typeof y !== "number") {
        const mudmanCoords = this.world.data.map.randomWalkableCoords();
        x = mudmanCoords[0];
        y = mudmanCoords[1];
      }

      const mudman = new Mudman(x, y, 20 * this.world.data.map.tileSize, mudmanSize);
      this.world.data.mudmen.push(mudman);
    };

    // createMudman(350, 200);
    // const population = 0;
    const population = 1000;
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

  get firelightSize(): number { return 4 * this.tileSize }

  get nightCtx(): CanvasRenderingContext2D { return this.nightRenderer.ctx }

  get viewportOriginX(): number { return this.hero.local.x - f(this.viewportWidth / 2) }
  get viewportOriginY(): number { return this.hero.local.y - f(this.viewportHeight / 2) }

  eachItemOfTypeInViewport(
    itemType: ItemType,
    viewportOriginX: number,
    viewportOriginY: number,
    mapper: (item: Item, viewportX: number, viewportY: number) => void,
  ): void {
    const {
      viewportWidth,
      viewportHeight,
    } = this;

    // items (water)
    this.world.data.items.forEachOfType(itemType, (item) => {
      if (item.used || item.held) return;
      if (!insideRect(
        item.x,
        item.y,
        viewportOriginX,
        viewportOriginY,
        viewportWidth,
        viewportHeight,
      )) return;

      mapper(item, item.x - viewportOriginX, item.y - viewportOriginY);
    });
  }

  eachMudmanInViewport(
    viewportOriginX: number,
    viewportOriginY: number,
    mapper: (mudman: Mudman, viewportX: number, viewportY: number) => void,
  ): void {
    const {
      viewportWidth,
      viewportHeight,
    } = this;

    this.world.data.mudmen.forEach((mudman) => {
      if (!insideRect(
        mudman.local.x,
        mudman.local.y,
        viewportOriginX,
        viewportOriginY,
        viewportWidth,
        viewportHeight,
      )) return;

      mapper(mudman, mudman.local.x - viewportOriginX, mudman.local.y - viewportOriginY);
    });
  }

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
    structure: Structure,
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
      const red = f(Math.max(white, baseRed));
      const green = f(Math.max(white, baseGreen));
      const blue = f(Math.max(white, baseBlue));
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(x, y, tileSize, tileSize);

      // switch (structure) {
      //   case Structure.NONE: break;
      //   case Structure.TREE: {
      //     const radius = f(tileSize / 2);
      //     ctx.fillStyle = "darkgreen";
      //     ctx.beginPath();
      //     ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
      //     ctx.fill();
      //     break;
      //   }
      //   default: break;
      // }
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
        const x = f(Math.random() * spaceWidth);
        const y = f(Math.random() * spaceHeight);
        const size = f((1 - Math.sqrt(Math.random())) * 4);
        const opacity = Math.sqrt(Math.random()).toFixed(2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(x, y, size, size);
      }
    });
  }

  // Careful, this creates a new `Path2D` every time
  createEmptyFillBar(leftX: number, topY: number, width: number, height: number): Path2D {
    const bottomY = topY + height;
    const centerX = leftX + f(width / 2);
    const rightX = centerX + f(width / 2);
    const endRadius = f(width / 2);
    const sidesTopY = topY + endRadius;
    const sidesBottomY = bottomY - endRadius;

    const fillBar = new Path2D();
    fillBar.arc(centerX, sidesTopY, endRadius, Math.PI, 0);
    fillBar.lineTo(rightX, sidesBottomY);
    fillBar.arc(centerX, sidesBottomY, endRadius, 0, Math.PI);
    fillBar.lineTo(leftX, sidesTopY);

    return fillBar;
  }

  drawHud(): void {
    const { tileSize, viewportWidth, viewportHeight } = this;
    const barWidth = f(tileSize / 4);
    const barHeight = f(1.5 * tileSize);
    const barTopY = f(tileSize / 2);
    const barBottomY = barTopY + barHeight;
    const hydrationLeftX = viewportWidth - f(tileSize / 2) - f(barWidth / 2);

    const hydrationBar = this.createEmptyFillBar(hydrationLeftX, barTopY, barWidth, barHeight);

    this.hudRenderer.drawOnce((ctx, _timestamp) => {
      ctx.clip(hydrationBar);
    });

    this.hudRenderer.drawLoop((ctx, _timestamp) => {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      const hydrationFillBarHeight = f(this.hero.local.percentHydrated * barHeight);
      const hydrationFillBarTopY = barBottomY - hydrationFillBarHeight;

      ctx.fillStyle = SHADOW_QUARTER;
      ctx.fill(hydrationBar);

      ctx.fillStyle = BLUE;
      ctx.fillRect(hydrationLeftX, hydrationFillBarTopY, barWidth, hydrationFillBarHeight);
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 2;
      ctx.stroke(hydrationBar);
    });
  }

  // drawFirelight(): void {
  //   const { firelightSize } = this;
  //   const radius = f(firelightSize / 2);
  //   const centerX = radius;
  //   const centerY = radius;

  //   this.firelightRenderer.drawOnce((ctx) => {
  //     const firelight = ctx.createRadialGradient(
  //       centerX,
  //       centerY,
  //       f(radius / 5),
  //       centerX,
  //       centerY,
  //       radius,
  //     );

  //     firelight.addColorStop(0, WHITE);
  //     firelight.addColorStop(0.2, WHITE);
  //     firelight.addColorStop(0.5, LIGHT_THREE_QUARTERS);
  //     firelight.addColorStop(1, TRANSPARENT);

  //     ctx.fillStyle = firelight;
  //     ctx.fillRect(0, 0, firelightSize, firelightSize);
  //   });
  // }

  drawFirelight(): void {
    const { firelightSize } = this;
    const radius = f(firelightSize / 2);
    const centerX = radius;
    const centerY = radius;

    this.firelightRenderer.drawLoop((ctx, timestamp) => {
      const { daylight } = this.world;
      if (daylight === 1) return;

      ctx.clearRect(0, 0, firelightSize, firelightSize);

      const flickerRadius = (1 - daylight) * (radius * (0.9 + (0.1 * Math.random())));

      const firelight = ctx.createRadialGradient(
        centerX,
        centerY,
        f(flickerRadius / 5),
        // 0,
        centerX,
        centerY,
        flickerRadius,
      );

      firelight.addColorStop(0, WHITE);
      // firelight.addColorStop(0.2, WHITE);
      firelight.addColorStop(0.2, WHITE);
      firelight.addColorStop(0.4, LIGHT_HALF);
      // firelight.addColorStop(0.4, LIGHT_THREE_QUARTERS);
      // firelight.addColorStop(0.5, LIGHT_THREE_QUARTERS);
      // firelight.addColorStop(0.5, LIGHT_THREE_QUARTERS);
      firelight.addColorStop(0.6, LIGHT_HALF);
      // firelight.addColorStop(0.6, LIGHT_QUARTER);
      firelight.addColorStop(0.75, LIGHT_QUARTER);
      firelight.addColorStop(1, TRANSPARENT);

      ctx.fillStyle = firelight;
      ctx.fillRect(0, 0, firelightSize, firelightSize);
    });
  }

  drawNightInto(ctx: CanvasRenderingContext2D, timestamp: number): void {
    const { daylight } = this.world;
    if (daylight === 1) return;

    const {
      nightCtx,
      viewportWidth,
      viewportHeight,
      viewportOriginX,
      viewportOriginY,
      firelightSize,
    } = this;

    // clear current night
    nightCtx.clearRect(0, 0, viewportWidth, viewportHeight);

    // render darkness
    nightCtx.fillStyle = BLACK;
    nightCtx.fillRect(0, 0, viewportWidth, viewportHeight);

    // we're gonna carve out firelight spots
    const oldGcOp = nightCtx.globalCompositeOperation;
    nightCtx.globalCompositeOperation = "destination-out";

    const firelightCanvas = this.firelightRenderer.canvas;
    const firelightRadius = f(firelightSize / 2);

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

      nightCtx.drawImage(
        firelightCanvas,
        0, 0,
        firelightSize, firelightSize,
        x - firelightRadius, y - firelightRadius,
        firelightSize, firelightSize,
      );

      const flameSprite = FLAME_SPRITES[f(FLAME_SPRITES.length * ((timestamp % 2000) / 2000))];
      this.flameRenderer.drawSprite(flameSprite, ctx, x, y - 2);
    });

    nightCtx.globalCompositeOperation = oldGcOp;

    ctx.globalAlpha = 0.35 * (1 - daylight);
    ctx.drawImage(
      this.nightRenderer.canvas,
      0, 0,
      viewportWidth, viewportHeight,
      0, 0,
      viewportWidth, viewportHeight,
    );
    ctx.globalAlpha = 1;
  }

  drawGroundLevel(ctx: CanvasRenderingContext2D, timestamp: number): void {
    const {
      viewportWidth,
      viewportHeight,
      worldWidth,
      worldHeight,
      viewportOriginX,
      viewportOriginY,
    } = this;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    if (
      viewportOriginX < 0
      || viewportOriginY < 0
      || viewportOriginX + viewportWidth > worldWidth
      || viewportOriginY + viewportHeight > worldHeight
    ) {
      const {
        spaceWidth,
        spaceHeight,
      } = this;

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
      const shadowGirth = f(viewportWidth / 40);

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
  }

  drawKneeLevel(ctx: CanvasRenderingContext2D, timestamp: number): void {
    const {
      viewportWidth,
      viewportHeight,
      viewportOriginX,
      viewportOriginY,
      tileSize,
    } = this;

    // items (water)
    this.eachItemOfTypeInViewport(ItemType.WATER, viewportOriginX, viewportOriginY, (item, x, y) => {
      this.bottleRenderer.drawSprite(BottleSprite.WATER_FULL, ctx, x, y);
    });

    // items (fire)
    this.eachItemOfTypeInViewport(ItemType.FIRE, viewportOriginX, viewportOriginY, (item, x, y) => {
      // TODO: this needs a sprite
      ctx.fillStyle = DARK_BROWN;
      ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.fillStyle = "orangered";
      ctx.fillRect(x - 4, y - 5, 8, 6);
    });

    // tree trunks
    const { map } = this.world.data;
    // const trunkRadius = f(tileSize / 4);
    // const trunkHeight = f(tileSize / 3);
    const halfTile = f(tileSize / 2);
    this.eachTileInViewport(viewportOriginX, viewportOriginY, (row, col, worldX, worldY, viewportX, viewportY) => {
      // TODO: values for each tile in viewport should be rolled up into a grid
      //       that updates each frame, because doing this loop multiple times a
      //       frame is unacceptable.
      const tileValue = map.valueAtTile(row, col);
      const structure = MudworldMap.structureFromTileValue(tileValue);

      // TODO: this needs a sprite
      switch (structure) {
        case Structure.NONE: break;
        case Structure.TREE: {
          this.treeRenderer.drawSprite(TreeSprite.STUMP, ctx, viewportX + halfTile, viewportY + halfTile);
          break;
        }
        default: break;
      }
    });
  }

  drawEyeLevel(ctx: CanvasRenderingContext2D, timestamp: number): void {
    const {
      viewportOriginX,
      viewportOriginY,
    } = this;

    // population
    this.eachMudmanInViewport(viewportOriginX, viewportOriginY, (mudman, x, y) => {
      this.mudmanRenderer.drawMudman(ctx, mudman, x, y, timestamp);
      // mudman.tick();
    });
  }

  drawCanopyLevel(ctx: CanvasRenderingContext2D, timestamp: number): void {
    const { map } = this.world.data;
    const {
      tileSize,
      viewportOriginX,
      viewportOriginY,
    } = this;

    const halfTile = f(tileSize / 2);
    const boughCount = BOUGH_SPRITES.length;
    this.eachTileInViewport(viewportOriginX, viewportOriginY, (row, col, worldX, worldY, viewportX, viewportY) => {
      // TODO: values for each tile in viewport should be rolled up into a grid
      //       that updates each frame, because doing this loop multiple times a
      //       frame is unacceptable.
      const tileValue = map.valueAtTile(row, col);
      const structure = MudworldMap.structureFromTileValue(tileValue);

      switch (structure) {
        case Structure.NONE: break;
        case Structure.TREE: {
          this.treeRenderer.drawSprite(
            BOUGH_SPRITES[(row + (3 * col)) % boughCount],
            ctx,
            viewportX + halfTile,
            viewportY + halfTile,
          );
          break;
        }
        default: break;
      }
    });
  }

  drawBirdLevel(ctx: CanvasRenderingContext2D, timestamp: number): void {
    // TODO: birds! and other flying/sky objects
  }

  drawCloudLevel(ctx: CanvasRenderingContext2D, timestamp: number): void {
    // day/night; at night, darkness falls, firelight cuts through the
    // darkness, and flames appear above fires
    this.drawNightInto(ctx, timestamp);
  }

  drawOrbitLevel(ctx: CanvasRenderingContext2D, timestamp: number): void {
    const {
      viewportOriginX,
      viewportOriginY,
      viewportWidth,
      viewportHeight,
    } = this;

    // indicator showing destination
    const { destination } = this.hero.local;
    if (destination) {
      const cyclePercent = (timestamp % 500) / 500;
      ctx.strokeStyle = DARK_SLATE_GRAY;
      ctx.globalAlpha = 1 - cyclePercent;
      ctx.beginPath();
      ctx.arc(
        destination.x - viewportOriginX,
        destination.y - viewportOriginY,
        f((0.5 * this.tileSize) * cyclePercent),
        0,
        2 * Math.PI,
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // draw HUD (hydration bar)
    ctx.drawImage(
      this.hudRenderer.canvas,
      0, 0,
      viewportWidth, viewportHeight,
      0, 0,
      viewportWidth, viewportHeight,
    );
  }

  drawLoop(): void {
    const {
      viewportWidth,
      viewportHeight,
      worldWidth,
      worldHeight,
    } = this;

    this.viewportRenderer.drawLoop((ctx, timestamp) => {
      this.world.data.timestamp = timestamp;

      if (this.overlayFullMap) {
        ctx.clearRect(0, 0, viewportWidth, viewportHeight);
        ctx.drawImage(
          this.worldRenderer.canvas,
          0, 0,
          worldWidth, worldHeight,
          0, 0,
          viewportWidth, viewportHeight,
        );

        return;
      }

      this.drawGroundLevel(ctx, timestamp);
      this.drawKneeLevel(ctx, timestamp);
      this.drawEyeLevel(ctx, timestamp);
      this.drawCanopyLevel(ctx, timestamp);
      this.drawBirdLevel(ctx, timestamp);
      this.drawCloudLevel(ctx, timestamp);
      this.drawOrbitLevel(ctx, timestamp);

      this.eachMudmanInViewport(this.viewportOriginX, this.viewportOriginY, (mudman, x, y) => {
        mudman.tick();
      });
    });
  }

  start(): void {
    this.drawWorld();
    this.drawSpace();
    this.drawHud();
    this.drawFirelight();
    this.drawLoop();
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
