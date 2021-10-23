export interface Draw {
  (ctx: CanvasRenderingContext2D, timestamp: DOMHighResTimeStamp): void;
}

export default class Renderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public fps: number;

  private lastFrameAt: number = 0;

  constructor(canvasEl: HTMLCanvasElement, width: number, height: number, fps: number = 24) {
    this.canvas = canvasEl;    
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("CanvasRenderingContext2D not supported");
    
    this.setCanvasSize(width, height);
    this.ctx = ctx;
    this.fps = fps;
  }

  get msPerFrame(): number {
    return 1000 / this.fps;
  }

  get nextFrameAt(): number {
    return this.lastFrameAt + this.msPerFrame;
  }

  setCanvasSize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  drawLoop(draw: (ctx: CanvasRenderingContext2D, timestamp: DOMHighResTimeStamp) => void): void {
    const loop = (timestamp: DOMHighResTimeStamp) => {
      requestAnimationFrame(loop);
      if (timestamp < this.nextFrameAt) return;
      
      this.lastFrameAt = timestamp;
      draw(this.ctx, timestamp);
    };

    requestAnimationFrame(loop);
  }

  drawOnce(draw: (ctx: CanvasRenderingContext2D, timestamp: DOMHighResTimeStamp) => void): void {
    requestAnimationFrame((timestamp) => {
      draw(this.ctx, timestamp);
    });
  }
}
