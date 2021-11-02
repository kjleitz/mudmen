import Renderer from "@/rendering/base/Renderer";

export interface DrawSprite {
  (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    topY: number,
    rightX: number,
    bottomY: number,
    leftX: number,
  ): void;
}

export default class SpriteRenderer {
  private spriteRenderers: Renderer[] = [];

  constructor(public defaultSpriteWidth: number, public defaultSpriteHeight: number, private fps = 24) {
    this.defaultSpriteWidth = Math.floor(defaultSpriteWidth);
    this.defaultSpriteHeight = Math.floor(defaultSpriteHeight);
  }

  addSprite(id: number, padding: number, draw: DrawSprite, ...rest: never): void;
  addSprite(id: number, padding: number, size: number, draw: DrawSprite, ...rest: never): void;
  addSprite(id: number, padding: number, width: number, height: number, draw: DrawSprite): void;
  addSprite(id: number, padding: number, ...[drawOrWidth, drawOrHeight, drawSprite]: [DrawSprite, never, never] | [number, DrawSprite, never] | [number, number, DrawSprite]): void {
    let width: number;
    let height: number;
    let draw: DrawSprite;

    if (typeof drawOrWidth === "function") {
      width = this.defaultSpriteWidth;
      height = this.defaultSpriteHeight;
      draw = drawOrWidth;
    } else if (typeof drawOrHeight === "function") {
      width = Math.floor(drawOrWidth);
      height = width;
      draw = drawOrHeight;
    } else {
      width = Math.floor(drawOrWidth);
      height = Math.floor(drawOrHeight);
      draw = drawSprite;
    }

    const renderer = new Renderer(
      document.createElement("canvas"),
      width + (padding * 2),
      height + (padding * 2),
      this.fps,
    );

    this.spriteRenderers[id] = renderer;

    renderer.drawOnce((ctx) => {
      draw(
        ctx,
        width,
        height,
        Math.floor(width / 2),
        Math.floor(height / 2),
        0 + padding,
        width - padding,
        height - padding,
        0 + padding,
      );
    });
  }

  mirrorSprite(sourceSpriteId: number, targetSpriteId: number): void {
    const original = this.spriteRenderers[sourceSpriteId];
    const { width, height } = original.canvas;

    const mirrored = new Renderer(
      document.createElement("canvas"),
      width,
      height,
      original.fps,
    );

    this.spriteRenderers[targetSpriteId] = mirrored;

    mirrored.drawOnce((ctx) => {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(original.canvas, 0, 0, -1 * width, height);
      ctx.restore();
    });
  }

  drawSprite(
    spriteId: number,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    spriteOffsetX = 0,
    spriteOffsetY = 0,
    scale = 1,
  ): void {
    const spriteCanvas = this.spriteRenderers[spriteId].canvas;
    const { width, height } = spriteCanvas;
    const spriteLeftX = x - Math.floor(0.5 * width) + spriteOffsetX;
    const spriteTopY = y - Math.floor(0.5 * height) + spriteOffsetY;
    const finalWidth = Math.floor(width * scale);
    const finalHeight = Math.floor(height * scale);

    ctx.drawImage(
      spriteCanvas,
      0, 0,
      width, height,
      spriteLeftX, spriteTopY,
      finalWidth, finalHeight,
    );
  }
}
