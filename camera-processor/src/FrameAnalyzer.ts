import CameraProcessor from './CameraProcessor';

abstract class FrameAnalyzer {
  public isRunning: boolean = true;

  start(): void {
    this.isRunning = true;
  }

  stop(): void {
    this.isRunning = false;
  }

  analyzeFrame(camera_video: HTMLVideoElement, camera_processor: CameraProcessor): Promise<any> {
    if (!this.isRunning) return Promise.resolve(null);
    return this.analyze(camera_video, camera_processor);
  }

  abstract analyze(camera_video: HTMLVideoElement, camera_processor: CameraProcessor): Promise<any>;
}

export default FrameAnalyzer;
