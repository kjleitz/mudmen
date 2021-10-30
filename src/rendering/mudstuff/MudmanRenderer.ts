import Mudman from "@/models/Mudman";
import Renderer from "@/rendering/base/Renderer";
import SpriteRenderer from "@/rendering/base/SpriteRenderer";
import { BROWN, DARK_BROWN, DARK_SLATE_GRAY, RED, SADDLE_BROWN, SANDY_BROWN } from "@/rendering/mudstuff/colors";

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

const f = (val: number): number => Math.floor(val);

export default class MudmanRenderer {
  public spriteRenderer: SpriteRenderer;

  constructor(public mudmanSize = 20, fps = 24) {
    this.mudmanSize = f(mudmanSize);
    this.spriteRenderer = new SpriteRenderer(this.canvasWidth, this.canvasHeight, fps);

    this.addStandingSprites();
    this.addSittingSprites();
    this.addWalkingSprites();
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
    ctx.strokeStyle = DARK_SLATE_GRAY;
    ctx.beginPath();
    ctx.arc(leftLegCenterX, legsBottomY, footRadius, -0.25 * Math.PI, -0.75 * Math.PI, true);
    ctx.stroke();

    // right leg
    ctx.fillRect(rightLegLeftX, legsTopY, legWidth, legHeight);

    // right foot bottom
    ctx.beginPath();
    ctx.arc(rightLegCenterX, legsBottomY, footRadius, 0, Math.PI);
    ctx.fill();

    // right foot top
    ctx.strokeStyle = DARK_SLATE_GRAY;
    ctx.beginPath();
    ctx.arc(rightLegCenterX, legsBottomY, footRadius, -0.25 * Math.PI, -0.75 * Math.PI, true);
    ctx.stroke();

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
    this.spriteRenderer.addSprite(MudmanSprite.STANDING_BACK, (ctx) => {
      this.drawStanding(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.STANDING_FRONT, (ctx) => {
      this.drawStanding(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.STANDING_RIGHT_BACK, (ctx) => {
      this.drawStandingRight(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.STANDING_RIGHT_FRONT, (ctx) => {
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
    this.spriteRenderer.addSprite(MudmanSprite.SITTING_BACK, (ctx) => {
      this.drawSitting(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.SITTING_FRONT, (ctx) => {
      this.drawSitting(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.SITTING_RIGHT_BACK, (ctx) => {
      this.drawSittingRight(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.SITTING_RIGHT_FRONT, (ctx) => {
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
    this.spriteRenderer.addSprite(MudmanSprite.WALKING_1_BACK, (ctx) => {
      this.drawWalking1(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_2_BACK, (ctx) => {
      this.drawWalking2(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_3_BACK, (ctx) => {
      this.drawWalking3(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_4_BACK, (ctx) => {
      this.drawWalking4(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_1_FRONT, (ctx) => {
      this.drawWalking1(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_2_FRONT, (ctx) => {
      this.drawWalking2(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_3_FRONT, (ctx) => {
      this.drawWalking3(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_4_FRONT, (ctx) => {
      this.drawWalking4(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_1_BACK, (ctx) => {
      this.drawWalkingRight1(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_2_BACK, (ctx) => {
      this.drawWalkingRight2(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_3_BACK, (ctx) => {
      this.drawWalkingRight3(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_4_BACK, (ctx) => {
      this.drawWalkingRight4(ctx, false);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_1_FRONT, (ctx) => {
      this.drawWalkingRight1(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_2_FRONT, (ctx) => {
      this.drawWalkingRight2(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_3_FRONT, (ctx) => {
      this.drawWalkingRight3(ctx, true);
    });

    this.spriteRenderer.addSprite(MudmanSprite.WALKING_RIGHT_4_FRONT, (ctx) => {
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
}

// export default class MudmanRenderer {
//   public standingRenderer: Renderer;
//   public standingRendererReversed: Renderer;
//   public walkingRenderers: Renderer[];
//   public walkingRenderersReversed: Renderer[];

//   private walking1Renderer: Renderer;
//   private walking2Renderer: Renderer;
//   private walking3Renderer: Renderer;
//   private walking4Renderer: Renderer;
//   private _mudmanSize!: number;
//   private canvasWidth!: number;
//   private canvasHeight!: number;
//   private bodyCenterX!: number;
//   private bodyCenterY!: number;
//   private bodyTopY!: number;
//   private bodyBottomY!: number;
//   private bodyLeftX!: number;
//   private bodyRightX!: number;
//   private bodyWidth!: number;
//   private bodyHeight!: number;
//   private buttRadius!: number;
//   private buttBottomY!: number;
//   private buttLeftInnerX!: number;
//   private legWidth!: number;
//   private legHeight!: number;

//   constructor(mudmanSize = 20, fps = 24) {
//     this.walkingRenderers = [];
//     this.walkingRenderersReversed = [];
//     this.mudmanSize = mudmanSize;

//     this.standingRenderer = new Renderer(
//       document.createElement("canvas"),
//       this.canvasWidth,
//       this.canvasHeight,
//       fps,
//     );
//     this.drawStanding();
//     this.standingRendererReversed = this.mirrorRenderer(this.standingRenderer);

//     this.walking1Renderer = new Renderer(
//       document.createElement("canvas"),
//       this.canvasWidth,
//       this.canvasHeight,
//       fps,
//     );
//     this.drawWalking1();
//     this.walkingRenderers.push(this.walking1Renderer);
//     this.walkingRenderersReversed.push(this.mirrorRenderer(this.walking1Renderer));

//     this.walking2Renderer = new Renderer(
//       document.createElement("canvas"),
//       this.canvasWidth,
//       this.canvasHeight,
//       fps,
//     );
//     this.drawWalking2();
//     this.walkingRenderers.push(this.walking2Renderer);
//     this.walkingRenderersReversed.push(this.mirrorRenderer(this.walking2Renderer));

//     this.walking3Renderer = new Renderer(
//       document.createElement("canvas"),
//       this.canvasWidth,
//       this.canvasHeight,
//       fps,
//     );
//     this.drawWalking3();
//     this.walkingRenderers.push(this.walking3Renderer);
//     this.walkingRenderersReversed.push(this.mirrorRenderer(this.walking3Renderer));

//     this.walking4Renderer = new Renderer(
//       document.createElement("canvas"),
//       this.canvasWidth,
//       this.canvasHeight,
//       fps,
//     );
//     this.drawWalking4();
//     this.walkingRenderers.push(this.walking4Renderer);
//     this.walkingRenderersReversed.push(this.mirrorRenderer(this.walking4Renderer));
//   }

//   get mudmanSize(): number { return this._mudmanSize }
//   set mudmanSize(size: number) {
//     this._mudmanSize = size;

//     this.canvasWidth = size;
//     this.canvasHeight = size * 2;
//     this.walkingRenderers.forEach((renderer) => {
//       renderer.setCanvasSize(this.canvasWidth, this.canvasHeight);
//     });
//     this.walkingRenderersReversed.forEach((renderer) => {
//       renderer.setCanvasSize(this.canvasWidth, this.canvasHeight);
//     });

//     this.bodyWidth = size;
//     this.bodyHeight = f(size / 2);
//     this.bodyCenterX = f(this.canvasWidth / 2);
//     this.bodyCenterY = f(this.canvasHeight / 2);
//     this.bodyTopY = f(this.bodyCenterY - (this.bodyHeight / 2));
//     this.bodyBottomY = this.bodyTopY + this.bodyHeight;
//     this.bodyLeftX = f(this.bodyCenterX - (this.bodyWidth / 2));
//     this.bodyRightX = this.bodyLeftX + this.bodyWidth;
//     this.buttRadius = f(size / 4);
//     this.buttBottomY = this.bodyBottomY + this.buttRadius;
//     this.buttLeftInnerX = this.bodyLeftX + this.buttRadius;
//     this.legWidth = f(size / 4);
//     this.legHeight = f(size / 2);
//   }

//   mirrorRenderer(original: Renderer): Renderer {
//     const { canvasWidth, canvasHeight } = this;

//     const mirrored = new Renderer(
//       document.createElement("canvas"),
//       canvasWidth,
//       canvasHeight,
//       original.fps,
//     );

//     mirrored.drawOnce((ctx) => {
//       ctx.save();
//       ctx.scale(-1, 1);
//       ctx.drawImage(original.canvas, 0, 0, -1 * canvasWidth, canvasHeight);
//       ctx.restore();
//     });

//     return mirrored;
//   }

//   drawUpperBody(ctx: CanvasRenderingContext2D): void {
//     const {
//       bodyWidth,
//       bodyCenterX,
//       bodyTopY,
//       bodyBottomY,
//       bodyLeftX,
//       bodyRightX,
//       buttRadius,
//       buttBottomY,
//       buttLeftInnerX,
//     } = this;

//     ctx.fillStyle = BROWN;
//     ctx.beginPath();

//     // head
//     ctx.arc(bodyCenterX, bodyTopY, bodyWidth / 2, 0, Math.PI, true);

//     // left side of body
//     ctx.lineTo(bodyLeftX, bodyBottomY);

//     // butt
//     ctx.arcTo(bodyLeftX, buttBottomY, buttLeftInnerX, buttBottomY, buttRadius);
//     ctx.lineTo(buttLeftInnerX, buttBottomY);

//     // bottom
//     ctx.lineTo(bodyRightX, buttBottomY);

//     // right side of body
//     ctx.lineTo(bodyRightX, bodyTopY);

//     // finish; back at right side of head
//     ctx.closePath();
//     ctx.fill();
//   }

//   drawFace(ctx: CanvasRenderingContext2D): void {
//     const {
//       bodyWidth,
//       bodyTopY,
//       bodyRightX,
//     } = this;

//     const faceRadius = f(0.33 * bodyWidth);
//     const eyeballRadius = f(0.3 * faceRadius);
//     const faceOffsetX = f((bodyWidth - faceRadius) / 6);

//     const faceCenterX = bodyRightX - faceRadius - faceOffsetX;
//     const faceCenterY = bodyTopY;
//     const faceRightX = faceCenterX + faceRadius;
//     const faceLeftX = faceCenterX - faceRadius;

//     const leftEyeCenterX = faceLeftX + (2 * eyeballRadius);
//     const rightEyeCenterX = faceRightX - f(1.5 * eyeballRadius);

//     ctx.fillStyle = SANDY_BROWN;

//     // face circle
//     ctx.beginPath();
//     ctx.arc(faceCenterX, faceCenterY, faceRadius, 0, 2 * Math.PI);
//     ctx.fill();

//     ctx.fillStyle = BROWN;

//     // bangs
//     ctx.beginPath();
//     ctx.arc(faceCenterX, faceCenterY, faceRadius + 1, -0.2 * Math.PI, -0.8 * Math.PI, true);
//     ctx.closePath();
//     ctx.fill();

//     ctx.fillStyle = DARK_SLATE_GRAY;

//     // left eye
//     ctx.beginPath();
//     ctx.arc(leftEyeCenterX, faceCenterY, eyeballRadius, 0, 2 * Math.PI);
//     ctx.fill();

//     // right eye
//     ctx.beginPath();
//     ctx.arc(rightEyeCenterX, faceCenterY, eyeballRadius, 0, 2 * Math.PI);
//     ctx.fill();


//     if (bodyWidth > 24) {
//       const eyebrowWidth = rightEyeCenterX - leftEyeCenterX + (2 * eyeballRadius);
//       const eyebrowHeight = eyeballRadius;
//       const eyebrowLeftX = leftEyeCenterX - eyeballRadius;
//       const eyebrowTopY = faceCenterY - f(0.75 * eyeballRadius) - eyebrowHeight;

//       const mouthWidth = rightEyeCenterX - leftEyeCenterX - (3 * eyeballRadius);
//       const mouthHeight = eyeballRadius;
//       const mouthLeftX = faceCenterX - f(0.5 * mouthWidth);
//       const mouthTopY = faceCenterY + f(1.5 * eyeballRadius);

//       ctx.fillStyle = BROWN;

//       // eyebrow
//       ctx.fillRect(eyebrowLeftX, eyebrowTopY, eyebrowWidth, eyebrowHeight);

//       ctx.fillStyle = RED;

//       // mouth
//       ctx.fillRect(mouthLeftX, mouthTopY, mouthWidth, mouthHeight);
//     }
//   }

//   drawSimpleFace(ctx: CanvasRenderingContext2D): void {
//     const {
//       bodyWidth,
//       bodyTopY,
//       bodyRightX,
//     } = this;

//     const faceRadius = f(0.33 * bodyWidth);
//     const eyeballRadius = f(0.3 * faceRadius);
//     const faceOffsetX = f((bodyWidth - faceRadius) / 6);

//     const faceCenterX = bodyRightX - faceRadius - faceOffsetX;
//     const faceCenterY = bodyTopY;
//     const faceRightX = faceCenterX + faceRadius;
//     const faceLeftX = faceCenterX - faceRadius;

//     const leftEyeCenterX = faceLeftX + (2 * eyeballRadius);
//     const rightEyeCenterX = faceRightX - f(1.5 * eyeballRadius);

//     // ctx.fillStyle = SANDY_BROWN;
//     ctx.fillStyle = DARK_SLATE_GRAY;

//     // left eye
//     ctx.beginPath();
//     ctx.arc(leftEyeCenterX, faceCenterY, eyeballRadius, 0, 2 * Math.PI);
//     ctx.fill();

//     // right eye
//     ctx.beginPath();
//     ctx.arc(rightEyeCenterX, faceCenterY, eyeballRadius, 0, 2 * Math.PI);
//     ctx.fill();
//   }

//   drawStanding(): void {
//     this.standingRenderer.drawOnce((ctx, _timestamp) => {
//       this.drawUpperBody(ctx);
//       this.drawSimpleFace(ctx);

//       const { bodyRightX, buttLeftInnerX, buttBottomY, legWidth, legHeight } = this;
//       ctx.fillStyle = BROWN;

//       // left leg
//       ctx.fillRect(buttLeftInnerX, buttBottomY, legWidth, legHeight);

//       // right leg
//       ctx.fillRect(bodyRightX - legWidth, buttBottomY, legWidth, legHeight);
//     });
//   }

//   drawWalking1(): void {
//     this.walking1Renderer.drawOnce((ctx, _timestamp) => {
//       this.drawUpperBody(ctx);
//       this.drawSimpleFace(ctx);

//       const { bodyRightX, buttLeftInnerX, buttBottomY, legWidth, legHeight } = this;
//       ctx.fillStyle = BROWN;

//       // left leg
//       ctx.fillRect(buttLeftInnerX, buttBottomY - f(legHeight / 2), legWidth, legHeight);

//       // right leg
//       ctx.fillRect(bodyRightX - legWidth, buttBottomY, legWidth, legHeight);
//     });
//   }

//   drawWalking2(): void {
//     this.walking2Renderer.drawOnce((ctx, _timestamp) => {
//       this.drawUpperBody(ctx);
//       this.drawSimpleFace(ctx);

//       const { buttLeftInnerX, bodyCenterX, buttBottomY, legWidth, legHeight } = this;
//       ctx.fillStyle = BROWN;

//       // left leg
//       ctx.fillRect(buttLeftInnerX + f(legWidth / 2), buttBottomY - f(legHeight * 0.75), legWidth, legHeight);

//       // right leg
//       ctx.fillRect(bodyCenterX + f(legWidth * 0.25), buttBottomY, legWidth, legHeight);
//     });
//   }

//   drawWalking3(): void {
//     this.walking3Renderer.drawOnce((ctx, _timestamp) => {
//       this.drawUpperBody(ctx);
//       this.drawSimpleFace(ctx);

//       // const { bodyRightX, bodyCenterX, buttBottomY, legWidth, legHeight } = this;
//       const { buttLeftInnerX, bodyCenterX, buttBottomY, legWidth, legHeight } = this;
//       ctx.fillStyle = BROWN;

//       // left leg
//       ctx.fillRect(bodyCenterX + f(legWidth * 0.25), buttBottomY - f(legHeight * 0.75), legWidth, legHeight);

//       // right leg
//       ctx.fillRect(buttLeftInnerX + f(legWidth / 2), buttBottomY, legWidth, legHeight);
//     });
//   }

//   drawWalking4(): void {
//     this.walking4Renderer.drawOnce((ctx, _timestamp) => {
//       this.drawUpperBody(ctx);
//       this.drawSimpleFace(ctx);

//       const { bodyRightX, buttLeftInnerX, buttBottomY, legWidth, legHeight } = this;
//       ctx.fillStyle = BROWN;

//       // left leg
//       ctx.fillRect(buttLeftInnerX, buttBottomY, legWidth, legHeight);

//       // right leg
//       ctx.fillRect(bodyRightX - legWidth, buttBottomY - f(legHeight / 2), legWidth, legHeight);
//     });
//   }

//   drawMudman(ctx: CanvasRenderingContext2D, mudman: Mudman, x: number, y: number, timestamp: DOMHighResTimeStamp): void {
//     const { canvasWidth, canvasHeight } = this;

//     let canvas: HTMLCanvasElement;
//     const { facingRight } = mudman.local.data;

//     if (mudman.local.hasPath) {
//       const cycleMs = 200;
//       // const cycleMs = 250;
//       // const cycleMs = 300;
//       // const cycleMs = 500;
//       // const cycleMs = 2500;
//       const cyclePosition = f(4 * (timestamp % cycleMs) / cycleMs);
//       const renderers = facingRight ? this.walkingRenderers : this.walkingRenderersReversed;
//       canvas = renderers[cyclePosition].canvas;
//     } else {
//       canvas = (facingRight ? this.standingRenderer :  this.standingRendererReversed).canvas;
//     }

//     ctx.drawImage(
//       canvas,
//       0, 0,
//       canvasWidth, canvasHeight,
//       x - f(0.5 * canvasWidth), y - f(0.75 * canvasHeight),
//       canvasWidth, canvasHeight,
//     );
//   }
// }
