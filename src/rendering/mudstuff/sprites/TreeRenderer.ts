import SpriteRenderer from "@/rendering/base/SpriteRenderer";
import { DARK_BROWN, DARK_GREEN, FOREST_GREEN, PERU_BROWN, SANDY_BROWN } from "@/rendering/mudstuff/colors";
import { f, rand } from "@/utilities/math";

export const enum TreeSprite {
  STUMP,
  BOUGHS_1,
  BOUGHS_2,
  BOUGHS_3,
  BOUGHS_4,
}

export const BOUGH_SPRITES = [
  TreeSprite.BOUGHS_1,
  TreeSprite.BOUGHS_2,
  TreeSprite.BOUGHS_3,
  TreeSprite.BOUGHS_4,
];

export default class TreeRenderer extends SpriteRenderer {
  constructor(public tileSize: number) {
    super(tileSize * 4, tileSize * 4);

    this.addSprite(
      TreeSprite.STUMP,
      1,
      tileSize,
      tileSize,
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

    BOUGH_SPRITES.forEach((sprite) => {
      const { tileSize } = this;
      this.addSprite(sprite, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
        const roughStumpCenterY = centerY - f(tileSize / 8);
        const roughStumpRadius = f(tileSize / 3);

        // kind of just like a base green central bough so they all have some
        // shit at the center
        TreeRenderer.drawRandomBoughComponent(
          ctx,
          centerX,
          roughStumpCenterY,
          roughStumpRadius,
          roughStumpRadius,
          1,
          1,
          DARK_GREEN,
          0,
        );

        // some bigger, darker, more opaque, green guys
        for (let i = 0; i < 5; i++) {
          TreeRenderer.drawRandomBoughComponent(
            ctx,
            centerX,
            roughStumpCenterY - roughStumpRadius,
            f(tileSize / 2),
            f(tileSize / 1.5),
            0.5,
            1,
            DARK_GREEN,
            1,
          );
        }

        // some smaller, lighter, less opaque, green guys (with wider ranges)
        for (let i = 0; i < 5; i++) {
          TreeRenderer.drawRandomBoughComponent(
            ctx,
            centerX,
            roughStumpCenterY - roughStumpRadius,
            f(tileSize / 16),
            f(tileSize / 2),
            0.1,
            0.5,
            FOREST_GREEN,
            3,
          );
        }
      });
    });
  }

  static drawRandomBoughComponent(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    minRadius: number,
    maxRadius: number,
    minOpacity: number,
    maxOpacity: number,
    color: string,
    spread: number,
  ): void {
    const baseRadius = f(minRadius + (rand() * (maxRadius - minRadius)));
    const avgRadius = (maxRadius + minRadius) / 2;
    const xJitter = f((rand() - 0.5) * avgRadius * spread);
    const yJitter = f((-0.5 * rand()) * avgRadius * spread);
    const opacity = minOpacity + (rand() * (maxOpacity - minOpacity));

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
  }
}
