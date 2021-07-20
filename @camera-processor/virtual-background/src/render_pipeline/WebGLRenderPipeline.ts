import { CameraRenderer } from 'camera-processor';
import { VirtualBackground } from '../shared';
import RenderPipeline from './RenderPipeline';

class WebGLRenderPipeline extends RenderPipeline {
  public renderSettings = { contourFilter: 'blur(4px)' };

  render(
    segmentation: { width: number; height: number; data: any },
    background: VirtualBackground,
    camera_video: HTMLVideoElement,
    renderer: CameraRenderer
  ): void {}
}

export default WebGLRenderPipeline;
