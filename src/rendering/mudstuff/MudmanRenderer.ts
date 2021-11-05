import Mudman from "@/models/Mudman";
import Renderer from "@/rendering/base/Renderer";
import SpriteRenderer, { DrawSprite } from "@/rendering/base/SpriteRenderer";
import { BLACK, BROWN, DARK_BROWN, DARK_SLATE_GRAY, GRAY_DARK, GRAY_MEDIUM, RED, SADDLE_BROWN, SANDY_BROWN, WHITE } from "@/rendering/mudstuff/colors";
import { c, f } from "@/utilities/math";

export const enum MudmanSprite {
  // standing

  // facing up/down
  STANDING_FRONT,
  STANDING_BACK,
  // facing right
  STANDING_RIGHT_FRONT,
  STANDING_RIGHT_BACK,
  // facing left
  STANDING_LEFT_FRONT,
  STANDING_LEFT_BACK,

  // sitting

  // facing up/down
  SITTING_FRONT,
  SITTING_BACK,
  // facing right
  SITTING_RIGHT_FRONT,
  SITTING_RIGHT_BACK,
  // facing left
  SITTING_LEFT_FRONT,
  SITTING_LEFT_BACK,

  // walking

  // facing up/down
  WALKING_1_FRONT,
  WALKING_2_FRONT,
  WALKING_3_FRONT,
  WALKING_4_FRONT,
  WALKING_1_BACK,
  WALKING_2_BACK,
  WALKING_3_BACK,
  WALKING_4_BACK,
  // facing right
  WALKING_RIGHT_1_FRONT,
  WALKING_RIGHT_2_FRONT,
  WALKING_RIGHT_3_FRONT,
  WALKING_RIGHT_4_FRONT,
  WALKING_RIGHT_1_BACK,
  WALKING_RIGHT_2_BACK,
  WALKING_RIGHT_3_BACK,
  WALKING_RIGHT_4_BACK,
  // facing left
  WALKING_LEFT_1_FRONT,
  WALKING_LEFT_2_FRONT,
  WALKING_LEFT_3_FRONT,
  WALKING_LEFT_4_FRONT,
  WALKING_LEFT_1_BACK,
  WALKING_LEFT_2_BACK,
  WALKING_LEFT_3_BACK,
  WALKING_LEFT_4_BACK,
}

const WALKING_SPRITES_FRONT = [
  MudmanSprite.WALKING_1_FRONT,
  MudmanSprite.WALKING_2_FRONT,
  MudmanSprite.WALKING_3_FRONT,
  MudmanSprite.WALKING_4_FRONT,
];

const WALKING_SPRITES_BACK = [
  MudmanSprite.WALKING_1_BACK,
  MudmanSprite.WALKING_2_BACK,
  MudmanSprite.WALKING_3_BACK,
  MudmanSprite.WALKING_4_BACK,
];

const WALKING_RIGHT_SPRITES_FRONT = [
  MudmanSprite.WALKING_RIGHT_1_FRONT,
  MudmanSprite.WALKING_RIGHT_2_FRONT,
  MudmanSprite.WALKING_RIGHT_3_FRONT,
  MudmanSprite.WALKING_RIGHT_4_FRONT,
];

const WALKING_RIGHT_SPRITES_BACK = [
  MudmanSprite.WALKING_RIGHT_1_BACK,
  MudmanSprite.WALKING_RIGHT_2_BACK,
  MudmanSprite.WALKING_RIGHT_3_BACK,
  MudmanSprite.WALKING_RIGHT_4_BACK,
];

const WALKING_LEFT_SPRITES_FRONT = [
  MudmanSprite.WALKING_LEFT_1_FRONT,
  MudmanSprite.WALKING_LEFT_2_FRONT,
  MudmanSprite.WALKING_LEFT_3_FRONT,
  MudmanSprite.WALKING_LEFT_4_FRONT,
];

const WALKING_LEFT_SPRITES_BACK = [
  MudmanSprite.WALKING_LEFT_1_BACK,
  MudmanSprite.WALKING_LEFT_2_BACK,
  MudmanSprite.WALKING_LEFT_3_BACK,
  MudmanSprite.WALKING_LEFT_4_BACK,
];

export const enum ConvoSprite {
  BLANK,
  TALKING_1,
  TALKING_2,
  TALKING_3,
  TALKING_4,
  TALKING_5,
  TALKING_6,
  TALKING_7,
  TALKING_8,
  TALKING_9,
  TALKING_10,
  TALKING_11,
  TALKING_12,
}

const TALKING_SPRITES = [
  ConvoSprite.TALKING_1,
  ConvoSprite.TALKING_2,
  ConvoSprite.TALKING_3,
  ConvoSprite.TALKING_4,
  ConvoSprite.TALKING_5,
  ConvoSprite.TALKING_6,
  ConvoSprite.TALKING_7,
  ConvoSprite.TALKING_8,
  ConvoSprite.TALKING_9,
  ConvoSprite.TALKING_10,
  ConvoSprite.TALKING_11,
  ConvoSprite.TALKING_12,
];

export default class MudmanRenderer {
  public spriteRenderer: SpriteRenderer;
  public convoRenderer: SpriteRenderer;

  constructor(public mudmanSize = 20, fps = 24) {
    this.mudmanSize = f(mudmanSize);
    this.spriteRenderer = new SpriteRenderer(this.canvasWidth, this.canvasHeight, fps);
    this.convoRenderer = new SpriteRenderer(f(this.canvasWidth / 2), f(this.canvasHeight / 3), fps);

    this.addStandingSprites();
    this.addSittingSprites();
    this.addWalkingSprites();
    this.addConvoSprites();
  }

  get canvasWidth(): number { return this.mudmanSize * 2 }
  get canvasHeight(): number { return this.mudmanSize * 3 }
  get bodyCenterX(): number { return f(this.canvasWidth / 2) }
  get bodyCenterY(): number { return f(this.canvasHeight / 2) }
  get bodyTopY(): number { return f(this.bodyCenterY - (this.bodyHeight / 2)) }
  get bodyBottomY(): number { return this.bodyTopY + this.bodyHeight }
  get bodyLeftX(): number { return f(this.bodyCenterX - (this.bodyWidth / 2)) }
  get bodyRightX(): number { return this.bodyLeftX + this.bodyWidth }
  get bodyWidth(): number { return this.mudmanSize }
  get bodyHeight(): number { return f(this.mudmanSize / 2) }
  get buttRadius(): number { return f(this.mudmanSize / 4) }
  get buttBottomY(): number { return this.bodyBottomY + this.buttRadius }
  get buttLeftInnerX(): number { return this.bodyLeftX + this.buttRadius }
  get buttRightInnerX(): number { return this.bodyRightX - this.buttRadius }
  get legWidth(): number { return f(this.mudmanSize / 4) }
  get legHeight(): number { return f(this.mudmanSize / 2) }

  drawUpperBody(ctx: CanvasRenderingContext2D, facingRight: boolean): void {
    const {
      bodyWidth,
      bodyCenterX,
      bodyTopY,
      bodyBottomY,
      bodyLeftX,
      bodyRightX,
      buttRadius,
      buttBottomY,
      buttLeftInnerX,
      buttRightInnerX,
    } = this;

    ctx.fillStyle = BROWN;
    ctx.beginPath();

    // head
    ctx.arc(bodyCenterX, bodyTopY, f(bodyWidth / 2), 0, Math.PI, true);

    // left side of body
    ctx.lineTo(bodyLeftX, bodyBottomY);

    // left-side butt
    ctx.arcTo(bodyLeftX, buttBottomY, buttLeftInnerX, buttBottomY, buttRadius);
    ctx.lineTo(buttLeftInnerX, buttBottomY);

    // when facing right, the bottom right of the body is a sharp corner, but
    // when facing up/down there's a butt on both sides
    if (facingRight) {
      // bottom
      ctx.lineTo(bodyRightX, buttBottomY);
    } else {
      // bottom and right-side butt
      ctx.lineTo(buttRightInnerX, buttBottomY);
      ctx.arcTo(bodyRightX, buttBottomY, bodyRightX, bodyBottomY, buttRadius);
      ctx.lineTo(bodyRightX, bodyBottomY);
    }

    // right side of body
    ctx.lineTo(bodyRightX, bodyTopY);

    // finish; back at right side of head
    ctx.closePath();
    ctx.fill();
  }

  drawFace(ctx: CanvasRenderingContext2D): void {
    const {
      bodyWidth,
      bodyTopY,
      bodyRightX,
    } = this;

    const faceRadius = f(0.33 * bodyWidth);
    const eyeballRadius = f(0.3 * faceRadius);
    const faceOffsetX = f((bodyWidth - faceRadius) / 6);

    const faceCenterX = bodyRightX - faceRadius - faceOffsetX;
    const faceCenterY = bodyTopY;
    const faceRightX = faceCenterX + faceRadius;
    const faceLeftX = faceCenterX - faceRadius;

    const leftEyeCenterX = faceLeftX + (2 * eyeballRadius);
    const rightEyeCenterX = faceRightX - f(1.5 * eyeballRadius);

    ctx.fillStyle = SANDY_BROWN;

    // face circle
    ctx.beginPath();
    ctx.arc(faceCenterX, faceCenterY, faceRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = BROWN;

    // bangs
    ctx.beginPath();
    ctx.arc(faceCenterX, faceCenterY, faceRadius + 1, -0.2 * Math.PI, -0.8 * Math.PI, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = DARK_SLATE_GRAY;

    // left eye
    ctx.beginPath();
    ctx.arc(leftEyeCenterX, faceCenterY, eyeballRadius, 0, 2 * Math.PI);
    ctx.fill();

    // right eye
    ctx.beginPath();
    ctx.arc(rightEyeCenterX, faceCenterY, eyeballRadius, 0, 2 * Math.PI);
    ctx.fill();


    if (bodyWidth > 24) {
      const eyebrowWidth = rightEyeCenterX - leftEyeCenterX + (2 * eyeballRadius);
      const eyebrowHeight = eyeballRadius;
      const eyebrowLeftX = leftEyeCenterX - eyeballRadius;
      const eyebrowTopY = faceCenterY - f(0.75 * eyeballRadius) - eyebrowHeight;

      const mouthWidth = rightEyeCenterX - leftEyeCenterX - (3 * eyeballRadius);
      const mouthHeight = eyeballRadius;
      const mouthLeftX = faceCenterX - f(0.5 * mouthWidth);
      const mouthTopY = faceCenterY + f(1.5 * eyeballRadius);

      ctx.fillStyle = BROWN;

      // eyebrow
      ctx.fillRect(eyebrowLeftX, eyebrowTopY, eyebrowWidth, eyebrowHeight);

      ctx.fillStyle = RED;

      // mouth
      ctx.fillRect(mouthLeftX, mouthTopY, mouthWidth, mouthHeight);
    }
  }

  drawSimpleFace(ctx: CanvasRenderingContext2D, facingRight: boolean): void {
    const {
      bodyWidth,
      bodyTopY,
      bodyRightX,
      bodyCenterX,
    } = this;

    const faceRadius = f(0.33 * bodyWidth);
    const eyeballRadius = f(0.3 * faceRadius);
    const faceCenterY = bodyTopY;
    let faceCenterX: number;

    if (facingRight) {
      faceCenterX = bodyRightX - faceRadius;
    } else {
      faceCenterX = bodyCenterX;
    }

    const faceLeftX = faceCenterX - faceRadius;
    const faceRightX = faceCenterX + faceRadius;

    // let leftEyeCenterX: number;
    // let rightEyeCenterX: number;
    // if (facingRight) {
    //   leftEyeCenterX = faceLeftX + f(faceRadius / 2);
    //   rightEyeCenterX = faceRightX - f(faceRadius / 3);
    // } else {
    //   leftEyeCenterX = faceLeftX + f(faceRadius / 2);
    //   rightEyeCenterX = faceRightX - f(faceRadius / 2);
    // }

    const leftEyeCenterX = faceLeftX + f(faceRadius / 2);
    const rightEyeCenterX = faceRightX - f(faceRadius / 2);

    // ctx.fillStyle = SANDY_BROWN;
    ctx.fillStyle = DARK_SLATE_GRAY;

    // left eye
    ctx.beginPath();
    ctx.arc(leftEyeCenterX, faceCenterY, eyeballRadius, 0, 2 * Math.PI);
    ctx.fill();

    // right eye
    ctx.beginPath();
    ctx.arc(rightEyeCenterX, faceCenterY, eyeballRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawStanding(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    this.drawUpperBody(ctx, false);
    if (facingFront) this.drawSimpleFace(ctx, false);

    const {
      buttLeftInnerX,
      buttRightInnerX,
      buttRadius,
      bodyBottomY,
      legWidth,
      legHeight,
    } = this;

    ctx.fillStyle = BROWN;

    // left leg
    ctx.fillRect(buttLeftInnerX - f(legWidth / 2), bodyBottomY, legWidth, legHeight + buttRadius);

    // right leg
    ctx.fillRect(buttRightInnerX - f(legWidth / 2), bodyBottomY, legWidth, legHeight + buttRadius);
  }

  drawStandingRight(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    this.drawUpperBody(ctx, true);
    if (facingFront) this.drawSimpleFace(ctx, true);

    const { bodyRightX, buttLeftInnerX, buttBottomY, legWidth, legHeight } = this;
    ctx.fillStyle = BROWN;

    // left leg
    ctx.fillRect(buttLeftInnerX, buttBottomY, legWidth, legHeight);

    // right leg
    ctx.fillRect(bodyRightX - legWidth, buttBottomY, legWidth, legHeight);
  }

  drawSitting(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const {
      buttLeftInnerX,
      buttRightInnerX,
      buttBottomY,
      legWidth,
      legHeight,
    } = this;

    ctx.save();
    ctx.translate(0, legHeight);

    this.drawUpperBody(ctx, false);
    if (!facingFront) return;

    this.drawSimpleFace(ctx, false);

    ctx.fillStyle = BROWN;

    const leftLegLeftX = buttLeftInnerX - f(legWidth / 2);
    const leftLegCenterX = buttLeftInnerX;
    const rightLegLeftX = buttRightInnerX - f(legWidth / 2);
    const rightLegCenterX = buttRightInnerX;
    // const legsTopY = buttBottomY - f(legHeight / 2);
    const legsTopY = buttBottomY - f(0.75 * legHeight);
    const legsBottomY = legsTopY + legHeight;
    const footRadius = f(legWidth / 2);

    // left leg
    ctx.fillRect(leftLegLeftX, legsTopY, legWidth, legHeight);

    // left foot bottom
    ctx.beginPath();
    ctx.arc(leftLegCenterX, legsBottomY, footRadius, 0, Math.PI);
    ctx.fill();

    // left foot top
    ctx.fillStyle = DARK_BROWN;
    ctx.beginPath();
    ctx.arc(leftLegCenterX, legsBottomY, footRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = BROWN;

    // right leg
    ctx.fillRect(rightLegLeftX, legsTopY, legWidth, legHeight);

    // right foot bottom
    ctx.beginPath();
    ctx.arc(rightLegCenterX, legsBottomY, footRadius, 0, Math.PI);
    ctx.fill();

    // right foot top
    ctx.fillStyle = DARK_BROWN;
    ctx.beginPath();
    ctx.arc(rightLegCenterX, legsBottomY, footRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  drawSittingRight(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const {
      bodyCenterX,
      bodyRightX,
      buttBottomY,
      legWidth,
      legHeight,
    } = this;

    ctx.save();
    ctx.translate(0, legHeight);

    this.drawUpperBody(ctx, true);
    if (facingFront) this.drawSimpleFace(ctx, true);

    ctx.fillStyle = BROWN;

    const footRadius = f(legWidth / 2);
    const rightLegLeftX = bodyRightX - f(legHeight / 2);
    const rightLegRightX = rightLegLeftX + legHeight;
    const rightLegTopY = buttBottomY - legWidth;
    const rightLegBottomY = buttBottomY;
    const rightFootCenterX = rightLegRightX;

    // right leg stickin' out to the right
    ctx.fillRect(rightLegLeftX, buttBottomY - legWidth, legHeight, legWidth);

    // right foot top
    ctx.beginPath();
    ctx.arc(rightFootCenterX, rightLegTopY, footRadius, Math.PI, 0);
    ctx.lineTo(rightFootCenterX + footRadius, rightLegBottomY - footRadius);
    ctx.arc(rightFootCenterX, rightLegBottomY - footRadius, footRadius, 0, 0.5 * Math.PI);
    ctx.fill();

    if (!facingFront) {
      ctx.fillStyle = DARK_BROWN;

      // left foot (above right leg/foot)
      ctx.beginPath();
      ctx.arc(bodyRightX, rightLegTopY - footRadius, footRadius, 0.5 * Math.PI, 0, true);
      ctx.lineTo(bodyRightX + footRadius, rightLegTopY - legWidth);
      ctx.arc(bodyRightX, rightLegTopY - legWidth, footRadius, 0, -0.5 * Math.PI, true);
      ctx.fill();

      return;
    }

    const leftLegWidth = f(1.5 * legWidth);
    const leftFootRadius = f(leftLegWidth / 2);
    const leftLegLeftX = bodyCenterX - f(leftLegWidth / 2);
    const leftLegCenterX = bodyCenterX;
    const leftLegRightX = leftLegCenterX + f(leftLegWidth / 2);
    const legsTopY = buttBottomY - f(0.75 * legHeight);
    const legsBottomY = legsTopY + legHeight;

    // left leg straight down
    ctx.fillRect(leftLegLeftX, legsTopY, leftLegWidth, legHeight);

    // left foot bottom
    ctx.beginPath();
    ctx.arc(leftLegCenterX, legsBottomY, leftFootRadius, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = DARK_BROWN;

    // left foot top and kinda bottom
    ctx.beginPath();
    ctx.arc(leftLegRightX - footRadius, legsBottomY + leftFootRadius - footRadius, footRadius, Math.PI, 0, true);
    ctx.lineTo(leftLegRightX, legsBottomY - f(0.25 * legWidth));
    ctx.arc(leftLegRightX - footRadius, legsBottomY - f(0.25 * legWidth), footRadius, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
  }

  drawWalking1(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const {
      buttLeftInnerX,
      buttRightInnerX,
      buttRadius,
      bodyBottomY,
      legWidth,
      legHeight,
    } = this;

    // left leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(buttLeftInnerX - f(legWidth / 2), bodyBottomY, legWidth, legHeight + buttRadius);

    // right leg
    ctx.fillStyle = DARK_BROWN;
    ctx.fillRect(buttRightInnerX - f(legWidth / 2), bodyBottomY - f(0.75 * legHeight), legWidth, legHeight + buttRadius);

    this.drawUpperBody(ctx, false);
    if (facingFront) this.drawSimpleFace(ctx, false);
  }

  drawWalking2(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const {
      buttLeftInnerX,
      buttRightInnerX,
      buttRadius,
      bodyBottomY,
      legWidth,
      legHeight,
    } = this;

    // left leg
    ctx.fillStyle = DARK_BROWN;
    ctx.fillRect(buttLeftInnerX - f(legWidth / 2), bodyBottomY - f(0.5 * legHeight), legWidth, legHeight + buttRadius);

    // right leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(buttRightInnerX - f(legWidth / 2), bodyBottomY - f(0.5 * legHeight), legWidth, legHeight + buttRadius);

    this.drawUpperBody(ctx, false);
    if (facingFront) this.drawSimpleFace(ctx, false);
  }

  drawWalking3(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const {
      buttLeftInnerX,
      buttRightInnerX,
      buttRadius,
      bodyBottomY,
      legWidth,
      legHeight,
    } = this;

    // left leg
    ctx.fillStyle = DARK_BROWN;
    ctx.fillRect(buttLeftInnerX - f(legWidth / 2), bodyBottomY - f(0.75 * legHeight), legWidth, legHeight + buttRadius);

    // right leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(buttRightInnerX - f(legWidth / 2), bodyBottomY, legWidth, legHeight + buttRadius);

    this.drawUpperBody(ctx, false);
    if (facingFront) this.drawSimpleFace(ctx, false);
  }

  drawWalking4(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const {
      buttLeftInnerX,
      buttRightInnerX,
      buttRadius,
      bodyBottomY,
      legWidth,
      legHeight,
    } = this;

    // left leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(buttLeftInnerX - f(legWidth / 2), bodyBottomY - f(0.5 * legHeight), legWidth, legHeight + buttRadius);

    // right leg
    ctx.fillStyle = DARK_BROWN;
    ctx.fillRect(buttRightInnerX - f(legWidth / 2), bodyBottomY - f(0.5 * legHeight), legWidth, legHeight + buttRadius);

    this.drawUpperBody(ctx, false);
    if (facingFront) this.drawSimpleFace(ctx, false);
  }

  drawWalkingRight1(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const { bodyRightX, buttLeftInnerX, buttBottomY, legWidth, legHeight } = this;

    // left leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(buttLeftInnerX, buttBottomY - f(legHeight / 2), legWidth, legHeight);

    // right leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(bodyRightX - legWidth, buttBottomY, legWidth, legHeight);

    this.drawUpperBody(ctx, true);
    if (facingFront) this.drawSimpleFace(ctx, true);
  }

  drawWalkingRight2(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const { buttLeftInnerX, bodyCenterX, buttBottomY, legWidth, legHeight } = this;

    // left leg
    ctx.fillStyle = DARK_BROWN;
    ctx.fillRect(buttLeftInnerX + f(legWidth / 2), buttBottomY - f(legHeight * 0.75), legWidth, legHeight);

    // right leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(bodyCenterX + f(legWidth * 0.25), buttBottomY, legWidth, legHeight);

    this.drawUpperBody(ctx, true);
    if (facingFront) this.drawSimpleFace(ctx, true);
  }

  drawWalkingRight3(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const { buttLeftInnerX, bodyCenterX, buttBottomY, legWidth, legHeight } = this;

    // left leg
    ctx.fillStyle = DARK_BROWN;
    ctx.fillRect(bodyCenterX + f(legWidth * 0.25), buttBottomY - f(legHeight * 0.75), legWidth, legHeight);

    // right leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(buttLeftInnerX + f(legWidth / 2), buttBottomY, legWidth, legHeight);

    this.drawUpperBody(ctx, true);
    if (facingFront) this.drawSimpleFace(ctx, true);
  }

  drawWalkingRight4(ctx: CanvasRenderingContext2D, facingFront: boolean): void {
    const { bodyRightX, buttLeftInnerX, buttBottomY, legWidth, legHeight } = this;

    // left leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(buttLeftInnerX, buttBottomY, legWidth, legHeight);

    // right leg
    ctx.fillStyle = BROWN;
    ctx.fillRect(bodyRightX - legWidth, buttBottomY - f(legHeight / 2), legWidth, legHeight);

    this.drawUpperBody(ctx, true);
    if (facingFront) this.drawSimpleFace(ctx, true);
  }

  addStandingSprites(): void {
    this.spriteRenderer.addSprite(MudmanSprite.STANDING_BACK, 0, (ctx) => {
      this.drawStanding(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.STANDING_FRONT, 0, (ctx) => {
      this.drawStanding(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.STANDING_RIGHT_BACK, 0, (ctx) => {
      this.drawStandingRight(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.STANDING_RIGHT_FRONT, 0, (ctx) => {
      this.drawStandingRight(ctx, true);
    });

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.STANDING_RIGHT_BACK,
      MudmanSprite.STANDING_LEFT_BACK,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.STANDING_RIGHT_FRONT,
      MudmanSprite.STANDING_LEFT_FRONT,
    );
  }

  addSittingSprites(): void {
    this.spriteRenderer.addSprite(MudmanSprite.SITTING_BACK, 0, (ctx) => {
      this.drawSitting(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.SITTING_FRONT, 0, (ctx) => {
      this.drawSitting(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.SITTING_RIGHT_BACK, 0, (ctx) => {
      this.drawSittingRight(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.SITTING_RIGHT_FRONT, 0, (ctx) => {
      this.drawSittingRight(ctx, true);
    });

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.SITTING_RIGHT_BACK,
      MudmanSprite.SITTING_LEFT_BACK,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.SITTING_RIGHT_FRONT,
      MudmanSprite.SITTING_LEFT_FRONT,
    );
  }

  addWalkingSprites(): void {
    this.spriteRenderer.addSprite(MudmanSprite.WALKING_1_BACK, 0, (ctx) => {
      this.drawWalking1(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_2_BACK, 0, (ctx) => {
      this.drawWalking2(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_3_BACK, 0, (ctx) => {
      this.drawWalking3(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_4_BACK, 0, (ctx) => {
      this.drawWalking4(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_1_FRONT, 0, (ctx) => {
      this.drawWalking1(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_2_FRONT, 0, (ctx) => {
      this.drawWalking2(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_3_FRONT, 0, (ctx) => {
      this.drawWalking3(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_4_FRONT, 0, (ctx) => {
      this.drawWalking4(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_1_BACK, 0, (ctx) => {
      this.drawWalkingRight1(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_2_BACK, 0, (ctx) => {
      this.drawWalkingRight2(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_3_BACK, 0, (ctx) => {
      this.drawWalkingRight3(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_4_BACK, 0, (ctx) => {
      this.drawWalkingRight4(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_1_FRONT, 0, (ctx) => {
      this.drawWalkingRight1(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_2_FRONT, 0, (ctx) => {
      this.drawWalkingRight2(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_3_FRONT, 0, (ctx) => {
      this.drawWalkingRight3(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_4_FRONT, 0, (ctx) => {
      this.drawWalkingRight4(ctx, true);
    });

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.WALKING_RIGHT_1_BACK,
      MudmanSprite.WALKING_LEFT_1_BACK,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.WALKING_RIGHT_2_BACK,
      MudmanSprite.WALKING_LEFT_2_BACK,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.WALKING_RIGHT_3_BACK,
      MudmanSprite.WALKING_LEFT_3_BACK,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.WALKING_RIGHT_4_BACK,
      MudmanSprite.WALKING_LEFT_4_BACK,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.WALKING_RIGHT_1_FRONT,
      MudmanSprite.WALKING_LEFT_1_FRONT,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.WALKING_RIGHT_2_FRONT,
      MudmanSprite.WALKING_LEFT_2_FRONT,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.WALKING_RIGHT_3_FRONT,
      MudmanSprite.WALKING_LEFT_3_FRONT,
    );

    this.spriteRenderer.mirrorSprite(
      MudmanSprite.WALKING_RIGHT_4_FRONT,
      MudmanSprite.WALKING_LEFT_4_FRONT,
    );
  }

  addConvoSprites(): void {
    const drawBubble: DrawSprite = (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
      const bubbleRadius = f(width / 6);
      const tailHeight = 2 * bubbleRadius;
      const tailBottomY = bottomY;
      const tailLeftX = leftX + bubbleRadius;
      const bubbleBottomY = tailBottomY - tailHeight;

      ctx.fillStyle = WHITE;
      ctx.strokeStyle = GRAY_DARK;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(tailLeftX, bubbleBottomY);
      ctx.arc(leftX + bubbleRadius, bubbleBottomY - bubbleRadius, bubbleRadius, 0.5 * Math.PI, Math.PI);
      ctx.lineTo(leftX, topY + bubbleRadius);
      ctx.arc(leftX + bubbleRadius, topY + bubbleRadius, bubbleRadius, Math.PI, -0.5 * Math.PI);
      ctx.lineTo(rightX - bubbleRadius, topY);
      ctx.arc(rightX - bubbleRadius, topY + bubbleRadius, bubbleRadius, -0.5 * Math.PI, 0);
      ctx.lineTo(rightX, bubbleBottomY - bubbleRadius);
      ctx.arc(rightX - bubbleRadius, bubbleBottomY - bubbleRadius, bubbleRadius, 0, 0.5 * Math.PI);
      ctx.lineTo(tailLeftX, tailBottomY);
      ctx.arc(tailLeftX, tailBottomY - bubbleRadius, bubbleRadius, 0.5 * Math.PI, -0.5 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    this.convoRenderer.addSprite(ConvoSprite.BLANK, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
      drawBubble(ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX);
    });

    TALKING_SPRITES.forEach((sprite) => {
      this.convoRenderer.addSprite(sprite, 1, (ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX) => {
        drawBubble(ctx, width, height, centerX, centerY, topY, rightX, bottomY, leftX);

        const bubbleRadius = f(width / 6);
        const tailHeight = 2 * bubbleRadius;
        const printableTopY = topY + bubbleRadius;
        const printableLeftX = leftX + bubbleRadius;
        const printableHeight = height - tailHeight - (2 * bubbleRadius) - 2;
        const printableWidth = width - (2 * bubbleRadius) - 2;

        const lineCount = f(Math.random() * 3) + 1;
        const lineWidth = c(printableHeight / 8);
        for (let i = 0; i < lineCount; i++) {
          const lineHeight = f(printableHeight / lineCount);
          const lineCenterY = printableTopY + (i * lineHeight) + f(lineHeight / 2);
          const lineTopY = lineCenterY - f(lineWidth / 2);
          ctx.fillStyle = BLACK;
          ctx.fillRect(printableLeftX, lineTopY, printableWidth, lineWidth);

          const breakCount = f(Math.random() * 3);
          for (let i = 0; i < breakCount; i++) {
            const breakLeftX = printableLeftX + Math.max(2, f(Math.random() * (printableWidth - 2)));
            ctx.fillStyle = WHITE;
            ctx.fillRect(breakLeftX, lineTopY, 2, lineWidth);
          }
        }
      });
    });
  }

  mirrorRenderer(original: Renderer): Renderer {
    const { canvasWidth, canvasHeight } = this;

    const mirrored = new Renderer(
      document.createElement("canvas"),
      canvasWidth,
      canvasHeight,
      original.fps,
    );

    mirrored.drawOnce((ctx) => {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(original.canvas, 0, 0, -1 * canvasWidth, canvasHeight);
      ctx.restore();
    });

    return mirrored;
  }

  drawMudman(ctx: CanvasRenderingContext2D, mudman: Mudman, x: number, y: number, timestamp: DOMHighResTimeStamp): void {
    let spriteId: number;
    const { xDirection, yDirection } = mudman.local.data;

    if (mudman.local.hasPath) {
      const cycleMs = 200;
      const cyclePosition = f(4 * (timestamp % cycleMs) / cycleMs);
      let spriteIds: number[];

      if (xDirection === 0) {
        spriteIds = yDirection < 0 ? WALKING_SPRITES_BACK : WALKING_SPRITES_FRONT;
      } else if (xDirection < 0) {
        spriteIds = yDirection < 0 ? WALKING_LEFT_SPRITES_BACK : WALKING_LEFT_SPRITES_FRONT;
      } else {
        spriteIds = yDirection < 0 ? WALKING_RIGHT_SPRITES_BACK : WALKING_RIGHT_SPRITES_FRONT;
      }

      spriteId = spriteIds[cyclePosition];
    } else if (mudman.local.data.sitting) {
      if (xDirection === 0) {
        spriteId = yDirection < 0 ? MudmanSprite.SITTING_BACK : MudmanSprite.SITTING_FRONT;
      } else if (xDirection < 0) {
        spriteId = yDirection < 0 ? MudmanSprite.SITTING_LEFT_BACK : MudmanSprite.SITTING_LEFT_FRONT;
      } else {
        spriteId = yDirection < 0 ? MudmanSprite.SITTING_RIGHT_BACK : MudmanSprite.SITTING_RIGHT_FRONT;
      }
    } else {
      if (xDirection === 0) {
        spriteId = yDirection < 0 ? MudmanSprite.STANDING_BACK : MudmanSprite.STANDING_FRONT;
      } else if (xDirection < 0) {
        spriteId = yDirection < 0 ? MudmanSprite.STANDING_LEFT_BACK : MudmanSprite.STANDING_LEFT_FRONT;
      } else {
        spriteId = yDirection < 0 ? MudmanSprite.STANDING_RIGHT_BACK : MudmanSprite.STANDING_RIGHT_FRONT;
      }
    }

    this.spriteRenderer.drawSprite(spriteId, ctx, x, y, 0, -0.25 * this.mudmanSize);
  }

  drawConvo(ctx: CanvasRenderingContext2D, mudman: Mudman, x: number, y: number, timestamp: DOMHighResTimeStamp): void {
    const { talkingTo } = mudman.local.data;

    // if you're talking to somebody and they're not going somewhere...
    if (talkingTo && !talkingTo.local.hasPath) {
      const cycleMs = 4000;
      const cyclePosition = f(TALKING_SPRITES.length * (timestamp % cycleMs) / cycleMs);
      const talkingSprite = TALKING_SPRITES[(mudman.id + cyclePosition) % TALKING_SPRITES.length];
      this.convoRenderer.drawSprite(talkingSprite, ctx, x, y, 1 * this.mudmanSize, -1 * this.mudmanSize);
    }
  }
}
