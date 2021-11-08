import Bottle from "@/models/items/containers/Bottle";
import SpriteRenderer from "@/rendering/base/SpriteRenderer";
import { BLUE, WHITE } from "@/rendering/mudstuff/colors";
import { f } from "@/utilities/math";

export const enum BottleSprite {
  EMPTY,
  WATER_FULL,
  WATER_PARTIAL,
}

export default class BottleRenderer extends SpriteRenderer {
  constructor(public tileSize: number) {
    super(tileSize / 2.5, tileSize / 2);

    this.addSprite(BottleSprite.EMPTY, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
      const bottlePath = BottleRenderer.createBottlePath(width, height, centerX, centerY, topY, rightX, bottomY, leftX);

      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.stroke(bottlePath);
    });

    this.addSprite(BottleSprite.WATER_FULL, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
      const bottlePath = BottleRenderer.createBottlePath(width, height, centerX, centerY, topY, rightX, bottomY, leftX);

      ctx.save();

      ctx.clip(bottlePath);
      ctx.fillStyle = BLUE;
      ctx.fillRect(leftX, topY + f(height / 4), width, height);

      ctx.restore();

      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.stroke(bottlePath);
    });

    this.addSprite(BottleSprite.WATER_PARTIAL, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
      const bottlePath = BottleRenderer.createBottlePath(width, height, centerX, centerY, topY, rightX, bottomY, leftX);

      ctx.save();

      ctx.clip(bottlePath);
      ctx.fillStyle = BLUE;
      ctx.fillRect(leftX, bottomY - f(height / 4), width, height);

      ctx.restore();

      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.stroke(bottlePath);
    });
  }

  static createBottlePath(
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    topY: number,
    rightX: number,
    bottomY: number,
    leftX: number,
  ): Path2D {
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
  }

  drawBottle(
    ctx: CanvasRenderingContext2D,
    bottle: Bottle,
    x: number,
    y: number,
    spriteOffsetX?: number,
    spriteOffsetY?: number,
    scale?: number,
  ): void {
    const spriteId = bottle.isEmpty
      ? BottleSprite.EMPTY
      : (bottle.percentFull < 0.67 ? BottleSprite.WATER_PARTIAL : BottleSprite.WATER_FULL);

    this.drawSprite(spriteId, ctx, x, y, spriteOffsetX, spriteOffsetY, scale);
  }
}
