import RenderMode from './RenderMode';

// TODO: Implement an easy way to check for WebGL2
class WebGLRenderMode extends RenderMode<WebGL2RenderingContext | WebGLRenderingContext> {
  getContext(): WebGL2RenderingContext | WebGLRenderingContext {
    return (
      this.canvas.getContext('webgl2') ||
      this.canvas.getContext('webgl') ||
      (this.canvas.getContext('experimental-webgl') as WebGLRenderingContext)
    );
  }

  // TODO
  cleanup(): void {}

  // TODO
  copy(source: CanvasImageSource): void {}
}

export default WebGLRenderMode;
