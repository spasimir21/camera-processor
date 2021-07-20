import WebGLRenderMode from './render_mode/WebGLRenderMode';
import _2DRenderMode from './render_mode/_2DRenderMode';
import RenderMode from './render_mode/RenderMode';
import CameraProcessor from './CameraProcessor';
import FrameRenderer from './FrameRenderer';

enum RENDER_MODE {
  _2D = '_2d',
  WebGL = 'webgl'
}

class CameraRenderer {
  private readonly renderModes: { [key: string]: RenderMode } = {};
  public readonly renderers: FrameRenderer[] = [];

  public canvas: HTMLCanvasElement;
  public ctx: any = null;

  public renderModeId: string;
  public renderMode: RenderMode;

  public width: number = 1;
  public height: number = 1;

  constructor() {
    this.addRenderMode(RENDER_MODE._2D, new _2DRenderMode());
    this.addRenderMode(RENDER_MODE.WebGL, new WebGLRenderMode());
    this.addRenderMode('output', new _2DRenderMode());

    this.use(RENDER_MODE._2D, false);
  }

  setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
    Object.values(this.renderModes).forEach(mode => mode.setDimensions(width, height));
  }

  getStream(): MediaStream {
    return this.renderModes['output'].getStream();
  }

  use(render_mode_id: string, copy: boolean = true): void {
    this.renderModes[render_mode_id].cleanup();

    if (this.renderModeId == render_mode_id) return;
    if (copy) this.renderModes[render_mode_id].copy(this.renderMode.canvas);

    this.renderMode = this.renderModes[render_mode_id];
    this.renderModeId = render_mode_id;

    this.canvas = this.renderMode.canvas;
    this.ctx = this.renderMode.ctx;
  }

  render(
    passthrough: boolean,
    analyzer_data: any,
    camera_video: HTMLVideoElement,
    camera_processor: CameraProcessor
  ): void {
    this.use(RENDER_MODE._2D, false);
    this.ctx.drawImage(camera_video, 0, 0, this.width, this.height);

    if (!passthrough) {
      for (const renderer of this.renderers) {
        renderer.renderFrame(analyzer_data, camera_video, this, camera_processor);
      }
    }

    this.use('output');
  }

  addRenderMode<TRenderMode extends RenderMode>(id: string, render_mode: TRenderMode): TRenderMode {
    this.renderModes[id] = render_mode;
    return render_mode;
  }

  addRenderer<TRenderer extends FrameRenderer>(renderer: TRenderer): TRenderer {
    this.renderers.push(renderer);
    return renderer;
  }

  removeRenderer(idx: number): FrameRenderer {
    return this.renderers.splice(idx, 1)[0];
  }
}

export default CameraRenderer;
export { RENDER_MODE };
