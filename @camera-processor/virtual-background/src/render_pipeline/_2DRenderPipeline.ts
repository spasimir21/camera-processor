import { CameraRenderer, RENDER_MODE } from 'camera-processor';
import { VIRTUAL_BACKGROUND_TYPE, VirtualBackground } from '../shared';
import RenderPipeline from './RenderPipeline';
import * as scaling from './scaling';

class _2DRenderPipeline extends RenderPipeline {
  private readonly maskCanvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly maskCtx: CanvasRenderingContext2D = this.maskCanvas.getContext('2d') as CanvasRenderingContext2D;
  private maskData: ImageData = this.maskCtx.createImageData(1, 1);
  public renderSettings = { contourFilter: 'blur(4px)' };

  private renderMask(segmentation: Uint8Array | Float32Array, width: number, height: number): void {
    if (this.maskCanvas.width != width || this.maskCanvas.height != height) {
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
      this.maskData = this.maskCtx.createImageData(width, height);
    }

    for (let i = 0; i < segmentation.length; i++) {
      this.maskData.data[i * 4 + 3] = segmentation[i] * 255;
    }

    this.maskCtx.putImageData(this.maskData, 0, 0);
  }

  render(
    segmentation: { width: number; height: number; data: any },
    background: VirtualBackground,
    camera_video: HTMLVideoElement,
    renderer: CameraRenderer
  ): void {
    if (background.type == VIRTUAL_BACKGROUND_TYPE.None) return;
    renderer.use(RENDER_MODE._2D);

    this.renderMask(segmentation.data, segmentation.width, segmentation.height);

    renderer.ctx.globalCompositeOperation = 'copy';
    renderer.ctx.filter = this.renderSettings.contourFilter;
    renderer.ctx.drawImage(this.maskCanvas, 0, 0, renderer.width, renderer.height);

    renderer.ctx.filter = 'none';
    renderer.ctx.globalCompositeOperation = 'source-in';
    renderer.ctx.drawImage(camera_video, 0, 0);

    if (background.type == VIRTUAL_BACKGROUND_TYPE.Transparent) return;

    renderer.ctx.globalCompositeOperation = 'destination-over';

    if (background.type == VIRTUAL_BACKGROUND_TYPE.Color) {
      renderer.ctx.fillStyle = background.data;
      renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
      return;
    }

    if (background.type == VIRTUAL_BACKGROUND_TYPE.Filter) {
      renderer.ctx.filter = background.data;
      renderer.ctx.drawImage(camera_video, 0, 0);
      return;
    }

    const img = background.data;
    if (!img.complete) {
      renderer.ctx.drawImage(camera_video, 0, 0);
      return;
    }

    const [width, height] = scaling.imageCover(img.width, img.height, renderer.width, renderer.height);
    const [x_offset, y_offset] = scaling.imageCenter(width, height, renderer.width, renderer.height);
    renderer.ctx.drawImage(img, x_offset, y_offset, width, height);
  }
}

export default _2DRenderPipeline;
