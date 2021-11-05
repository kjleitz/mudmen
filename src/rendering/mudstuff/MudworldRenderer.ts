import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import snowiness from "@/mapmaking/mudworld/generators/snowiness";
import MudworldMap, { Structure } from "@/mapmaking/mudworld/MudworldMap";
import Item, { ItemType } from "@/models/Item";
import Mudman from "@/models/Mudman";
import Renderer from "@/rendering/base/Renderer";
import { BLACK, BLUE, DARK_BROWN, DARK_SLATE_GRAY, GOLD, GRAY_CHARCOAL, GRAY_LIGHT, GRAY_MEDIUM, LIGHT_HALF, LIGHT_QUARTER, RED, SHADOW_QUARTER, TRANSPARENT, WHITE } from "@/rendering/mudstuff/colors";
import drawShoreline from "@/rendering/mudstuff/drawShoreline";
import MudmanRenderer from "@/rendering/mudstuff/MudmanRenderer";
import BottleRenderer, { BottleSprite } from "@/rendering/mudstuff/sprites/BottleRenderer";
import FlameRenderer from "@/rendering/mudstuff/sprites/FlameRenderer";
import TreeRenderer, { BOUGH_SPRITES, TreeSprite } from "@/rendering/mudstuff/sprites/TreeRenderer";
import { insideRect } from "@/utilities/geo";
import { f, rand } from "@/utilities/math";

export default class MudworldRenderer {
  public worldRenderer: Renderer;
  public viewportRenderer: Renderer;
  public spaceRenderer: Renderer;
  public hudRenderer: Renderer;
  public nightRenderer: Renderer;
  public firelightRenderer: Renderer;
  public flameRenderer: FlameRenderer;
  public bottleRenderer: BottleRenderer;
  public treeRenderer: TreeRenderer;
  public mudmanRenderer: MudmanRenderer;
  public world: MudworldBlackboard;
  public overlayFullMap = false;

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

    this.flameRenderer = new FlameRenderer(this.tileSize);
    this.bottleRenderer = new BottleRenderer(this.tileSize);
    this.treeRenderer = new TreeRenderer(this.tileSize);

    // const mudmanSize = 16;
    // const mudmanSize = 32;
    const mudmanSize = f(this.tileSize / 2);
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
    // const population = 1;
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
    expandTopRow = 0,
    expandRightCol = 0,
    expandBottomRow = 0,
    expandLeftCol = 0,
  ): void {
    const { tileSize, viewportWidth, viewportHeight} = this;

    const leftX = viewportOriginX - (tileSize * expandLeftCol);
    const width = viewportWidth + (tileSize * (expandLeftCol + expandRightCol));
    const topY = viewportOriginY - (tileSize * expandTopRow);
    const height = viewportHeight + (tileSize * (expandTopRow + expandBottomRow));

    this.world.data.items.forEachOfType(itemType, (item) => {
      if (item.used || item.held) return;
      if (!insideRect(item.x, item.y, leftX, topY, width, height)) return;

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
    expandTopRow = 0,
    expandRightCol = 0,
    expandBottomRow = 0,
    expandLeftCol = 0,
  ): void {
    const { map } = this.world.data;
    const { tileSize } = this;
    const minCol = Math.max(0, map.xToCol(viewportOriginX) - expandLeftCol);
    const maxCol = Math.min(map.colCount - 1, map.xToCol(viewportOriginX + this.viewportWidth) + expandRightCol);
    const minRow = Math.max(0, map.yToRow(viewportOriginY) - expandTopRow);
    const maxRow = Math.min(map.rowCount - 1, map.yToRow(viewportOriginY + this.viewportHeight) + expandBottomRow);

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
      drawShoreline(ctx, this.world.data.map, x, y, x, y, tileSize, baseRed, baseGreen, baseBlue);
    } else {
      // TODO: have a set of pre-defined tile color/illustrations when each
      //       value is within a certain range
      const white = snowiness(elevation);
      const red = f(Math.max(white, baseRed));
      const green = f(Math.max(white, baseGreen));
      const blue = f(Math.max(white, baseBlue));
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
        const x = f(rand() * spaceWidth);
        const y = f(rand() * spaceHeight);
        const size = f((1 - Math.sqrt(rand())) * 4);
        const opacity = Math.sqrt(rand()).toFixed(2);
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
    const warmthLeftX = hydrationLeftX - (barWidth * 2);
    const socialLeftX = warmthLeftX - (barWidth * 2);

    const barPaths = new Path2D();

    const hydrationBar = this.createEmptyFillBar(hydrationLeftX, barTopY, barWidth, barHeight);
    barPaths.addPath(hydrationBar);

    const warmthBar = this.createEmptyFillBar(warmthLeftX, barTopY, barWidth, barHeight);
    barPaths.addPath(warmthBar);

    const socialBar = this.createEmptyFillBar(socialLeftX, barTopY, barWidth, barHeight);
    barPaths.addPath(socialBar);

    this.hudRenderer.ctx.clip(barPaths);

    this.hudRenderer.drawLoop((ctx, _timestamp) => {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      // background of the fill bars
      ctx.fillStyle = SHADOW_QUARTER;
      ctx.fill(barPaths);

      // hydration bar fill
      ctx.fillStyle = BLUE;
      const hydrationFillBarHeight = f(this.hero.local.percentHydrated * barHeight);
      const hydrationFillBarTopY = barBottomY - hydrationFillBarHeight;
      ctx.fillRect(hydrationLeftX, hydrationFillBarTopY, barWidth, hydrationFillBarHeight);

      // warmth bar fill
      ctx.fillStyle = RED;
      const warmthFillBarHeight = f(this.hero.local.percentWarm * barHeight);
      const warmthFillBarTopY = barBottomY - warmthFillBarHeight;
      ctx.fillRect(warmthLeftX, warmthFillBarTopY, barWidth, warmthFillBarHeight);

      // social bar fill
      ctx.fillStyle = GOLD;
      const socialFillBarHeight = f(this.hero.local.percentSocial * barHeight);
      const socialFillBarTopY = barBottomY - socialFillBarHeight;
      ctx.fillRect(socialLeftX, socialFillBarTopY, barWidth, socialFillBarHeight);

      // border of the fill bars
      // ctx.strokeStyle = WHITE;
      // ctx.strokeStyle = GRAY_LIGHT;
      ctx.strokeStyle = GRAY_CHARCOAL;
      ctx.lineWidth = 2;
      ctx.stroke(barPaths);
    });
  }

  drawFirelight(): void {
    const { firelightSize } = this;
    const radius = f(firelightSize / 2);
    const centerX = radius;
    const centerY = radius;

    this.firelightRenderer.drawLoop((ctx, timestamp) => {
      const { daylight } = this.world;
      if (daylight === 1) return;

      ctx.clearRect(0, 0, firelightSize, firelightSize);

      const flickerRadius = (1 - daylight) * (radius * (0.9 + (0.1 * rand())));

      const firelight = ctx.createRadialGradient(
        centerX,
        centerY,
        f(flickerRadius / 5),
        centerX,
        centerY,
        flickerRadius,
      );

      firelight.addColorStop(0, WHITE);
      firelight.addColorStop(0.2, WHITE);
      firelight.addColorStop(0.4, LIGHT_HALF);
      firelight.addColorStop(0.6, LIGHT_HALF);
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

    this.eachItemOfTypeInViewport(ItemType.FIRE, viewportOriginX, viewportOriginY, (item, x, y) => {
      nightCtx.drawImage(
        firelightCanvas,
        0, 0,
        firelightSize, firelightSize,
        x - firelightRadius, y - firelightRadius,
        firelightSize, firelightSize,
      );

      this.flameRenderer.drawAnimated(ctx, timestamp, x, y);
    }, 1, 1, 1, 1);

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
    }, 0, 1, 1, 1);

    this.eachMudmanInViewport(viewportOriginX, viewportOriginY, (mudman, x, y) => {
      this.mudmanRenderer.drawConvo(ctx, mudman, x, y, timestamp);
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

    const { movingTarget } = this.hero.local.data;
    const { destination } = this.hero.local;

    if (movingTarget) {
      // indicator showing moving target
      const cyclePercent = (timestamp % 500) / 500;
      ctx.strokeStyle = RED;
      ctx.globalAlpha = 1 - cyclePercent;
      ctx.beginPath();
      ctx.arc(
        movingTarget.x - viewportOriginX,
        movingTarget.y - viewportOriginY,
        f((0.5 * this.tileSize) * cyclePercent),
        0,
        2 * Math.PI,
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (destination) {
      // indicator showing destination
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
