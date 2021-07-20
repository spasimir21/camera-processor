import CameraProcessor from './CameraProcessor';
import CameraRenderer from './CameraRenderer';

abstract class FrameRenderer {
  public isRunning: boolean = true;

  start(): void {
    this.isRunning = true;
  }

  stop(): void {
    this.isRunning = false;
  }

  renderFrame(
    analyzer_data: any,
    camera_video: HTMLVideoElement,
    renderer: CameraRenderer,
    camera_processor: CameraProcessor
  ): void {
    if (!this.isRunning) return;
    return this.render(analyzer_data, camera_video, renderer, camera_processor);
  }

  abstract render(
    analyzer_data: any,
    camera_video: HTMLVideoElement,
    renderer: CameraRenderer,
    camera_processor: CameraProcessor
  ): void;
}

export default FrameRenderer;
