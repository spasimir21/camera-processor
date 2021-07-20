import { CameraRenderer } from 'camera-processor';
import { VirtualBackground } from '../shared';

abstract class RenderPipeline {
  public abstract renderSettings: any = {};

  setRenderSettings(render_settings: any): void {
    this.renderSettings = render_settings;
  }

  abstract render(
    segmentation: { width: number; height: number; data: any },
    background: VirtualBackground,
    camera_video: HTMLVideoElement,
    renderer: CameraRenderer
  ): void;
}

export default RenderPipeline;
