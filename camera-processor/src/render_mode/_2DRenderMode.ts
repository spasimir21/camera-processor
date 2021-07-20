import RenderMode from './RenderMode';

class _2DRenderMode extends RenderMode<CanvasRenderingContext2D> {
  getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  cleanup() {
    this.ctx.globalCompositeOperation = 'copy';
    this.ctx.filter = 'none';
  }

  copy(source: CanvasImageSource): void {
    this.ctx.drawImage(source, 0, 0, this.width, this.height);
  }
}

export default _2DRenderMode;
