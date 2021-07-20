abstract class RenderMode<TContext extends RenderingContext = any> {
  public readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  public ctx: TContext;

  public width: number = 1;
  public height: number = 1;

  constructor() {
    this.ctx = this.getContext();
  }

  abstract getContext(): TContext;

  setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  abstract copy(source: CanvasImageSource): void;

  abstract cleanup(): void;

  getStream(): MediaStream {
    // @ts-ignore (captureStream is not defined in HTMLCanvasElement)
    return this.canvas.captureStream();
  }
}

export default RenderMode;
