import SpriteRenderer from "@/rendering/base/SpriteRenderer";
import { f, rand } from "@/utilities/math";
import { weightLow } from "@/utilities/weight";

export const enum FlameSprite {
  FLAME_1,
  FLAME_2,
  FLAME_3,
  FLAME_4,
  FLAME_5,
  FLAME_6,
  FLAME_7,
  FLAME_8,
}

export const FLAME_SPRITES = [
  FlameSprite.FLAME_1,
  FlameSprite.FLAME_2,
  FlameSprite.FLAME_3,
  FlameSprite.FLAME_4,
  FlameSprite.FLAME_5,
  FlameSprite.FLAME_6,
  FlameSprite.FLAME_7,
  FlameSprite.FLAME_8,
];

export default class FlameRenderer extends SpriteRenderer {
  constructor(public tileSize: number) {
    super(tileSize, tileSize * 2);

    FLAME_SPRITES.forEach((sprite) => {
      this.addSprite(sprite, 0, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
        const flameCenterY = centerY - f(height / 16);
        FlameRenderer.drawRandomFlameComponent(ctx, width, centerX, flameCenterY, "red");
        FlameRenderer.drawRandomFlameComponent(ctx, width, centerX, flameCenterY, "yellow");
        FlameRenderer.drawRandomFlameComponent(ctx, width, centerX, flameCenterY, "orange");
        FlameRenderer.drawRandomFlameComponent(ctx, width / 2, centerX, flameCenterY - f(0.25 * rand() * height), "red");
        FlameRenderer.drawRandomFlameComponent(ctx, width / 2, centerX, flameCenterY - f(0.25 * rand() * height), "red");
      });
    });
  }

  static drawRandomFlameComponent(
    ctx: CanvasRenderingContext2D,
    width: number,
    centerX: number,
    centerY: number,
    color: string,
  ): void {
    const size = f((0.1 * width) + (0.25 * rand() * width));
    const halfSize = f(size / 2);
    const xJitter = (rand() - 0.5) * size;
    const yJitter = (weightLow(rand()) - 0.5) * size;
    const angle = rand() * (2 * Math.PI);
    const x = f(centerX - halfSize + xJitter);
    const y = f(centerY - halfSize + yJitter);

    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.translate(-1 * centerX, -1 * centerY);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.25 + (0.75 * rand());
    ctx.fillRect(x, y, size, size);

    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawAnimated(
    ctx: CanvasRenderingContext2D,
    timestamp: number,
    x: number,
    y: number,
    spriteOffsetX?: number,
    spriteOffsetY?: number,
    scale?: number,
  ): void {
    const flameSprite = FLAME_SPRITES[f(FLAME_SPRITES.length * ((timestamp % 2000) / 2000))];
    this.drawSprite(flameSprite, ctx, x, y, spriteOffsetX, spriteOffsetY, scale);
  }
}
