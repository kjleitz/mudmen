import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import { Shoreline, shorelineAt, shorelineHasLand } from "@/rendering/mudstuff/Shoreline";

export default function drawShoreline(
  ctx: CanvasRenderingContext2D,
  map: MudworldMap,
  worldX: number,
  worldY: number,
  drawX: number,
  drawY: number,
  tileSize: number,
  landRed = 0,
  landGreen = 200,
  landBlue = 0,
): void {
  const shoreline = shorelineAt(worldX, worldY, map, tileSize);

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

    if (landBottom) {
      // .--------.
      // |########|
      // |?      ?|
      // |########|
      // '--------'
      ctx.fillRect(tileLeftX, shoreBottomY, tileSize, shoreSize);

      if (landRight || landLeft) {
        if (landRight) ctx.fillRect(tileCenterX, tileTopY, halfTileSize, tileSize);
        if (landLeft) ctx.fillRect(tileLeftX, tileTopY, halfTileSize, tileSize);

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

      landBottomRight ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_RIGHT);
      if (landBottomRight) {
        ctx.beginPath();
        ctx.arc(tileRightX, tileBottomY, shoreSize, Math.PI, -0.5 * Math.PI);
        ctx.lineTo(tileRightX, tileBottomY);
        ctx.closePath();
        ctx.fill();
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
    }
    if (landBottomRight) {
      ctx.beginPath();
      ctx.arc(tileRightX, tileBottomY, shoreSize, Math.PI, -0.5 * Math.PI);
      ctx.lineTo(tileRightX, tileBottomY);
      ctx.closePath();
      ctx.fill();
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

      landTopLeft ??= shorelineHasLand(shoreline, Shoreline.TOP_LEFT);
      if (landTopLeft) {
        ctx.beginPath();
        ctx.arc(tileLeftX, tileTopY, shoreSize, 0, 0.5 * Math.PI);
        ctx.lineTo(tileLeftX, tileTopY);
        ctx.closePath();
        ctx.fill();
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
    }
    if (landTopRight) {
      ctx.beginPath();
      ctx.arc(tileRightX, tileTopY, shoreSize, 0.5 * Math.PI, Math.PI);
      ctx.lineTo(tileRightX, tileTopY);
      ctx.closePath();
      ctx.fill();
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

    if (landRight) {
      // .--------.
      // |#xxxxxx#|
      // |#      #|
      // |#xxxxxx#|
      // '--------'
      ctx.fillRect(shoreRightX, tileTopY, shoreSize, tileSize);

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
    }
    if (landBottomRight) {
      ctx.beginPath();
      ctx.arc(tileRightX, tileBottomY, shoreSize, Math.PI, -0.5 * Math.PI);
      ctx.lineTo(tileRightX, tileBottomY);
      ctx.closePath();
      ctx.fill();
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

    landTopLeft ??= shorelineHasLand(shoreline, Shoreline.TOP_LEFT);
    landBottomLeft ??= shorelineHasLand(shoreline, Shoreline.BOTTOM_LEFT);
    if (landTopLeft) {
      ctx.beginPath();
      ctx.arc(tileLeftX, tileTopY, shoreSize, 0, 0.5 * Math.PI);
      ctx.lineTo(tileLeftX, tileTopY);
      ctx.closePath();
      ctx.fill();
    }
    if (landBottomLeft) {
      ctx.beginPath();
      ctx.arc(tileLeftX, tileBottomY, shoreSize, -0.5 * Math.PI, 0);
      ctx.lineTo(tileLeftX, tileBottomY);
      ctx.closePath();
      ctx.fill();
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
    }
    if (landTopRight) {
      ctx.beginPath();
      ctx.arc(tileRightX, tileTopY, shoreSize, 0.5 * Math.PI, Math.PI);
      ctx.lineTo(tileRightX, tileTopY);
      ctx.closePath();
      ctx.fill();
    }
    if (landBottomRight) {
      ctx.beginPath();
      ctx.arc(tileRightX, tileBottomY, shoreSize, Math.PI, -0.5 * Math.PI);
      ctx.lineTo(tileRightX, tileBottomY);
      ctx.closePath();
      ctx.fill();
    }
    if (landBottomLeft) {
      ctx.beginPath();
      ctx.arc(tileLeftX, tileBottomY, shoreSize, -0.5 * Math.PI, 0);
      ctx.lineTo(tileLeftX, tileBottomY);
      ctx.closePath();
      ctx.fill();
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
