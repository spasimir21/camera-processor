import CameraAnalyzer from './CameraAnalyzer';
import CameraRenderer from './CameraRenderer';
import FrameAnalyzer from './FrameAnalyzer';
import FrameRenderer from './FrameRenderer';

class CameraProcessor<TAnalyzerData = any> {
  public readonly analyzer: CameraAnalyzer<TAnalyzerData> = new CameraAnalyzer();
  public readonly renderer: CameraRenderer = new CameraRenderer();

  private readonly cameraVideo: HTMLVideoElement = document.createElement('video');
  public cameraStream: MediaStream;

  public readonly performance = { fps: NaN, frameTime: { analyze: NaN, render: NaN, total: NaN } };
  public passthrough: boolean = false;
  public isRunning: boolean = false;


  async start(): Promise<void> {
    await this.cameraVideo.play();
    this.isRunning = true;
    await this.processFrame();
  }

  stop(): void {
    this.isRunning = false;
    this.cameraVideo.pause();
  }

  setCameraStream(stream: MediaStream): void {
    this.cameraStream = stream;
    this.cameraVideo.srcObject = this.cameraStream;

    const stream_settings = this.cameraStream.getVideoTracks()[0].getSettings();
    this.renderer.setDimensions(stream_settings.width ?? 1, stream_settings.height ?? 1);
  }

  getOutputStream(): MediaStream {
    return this.renderer.getStream();
  }

  private async processFrame(): Promise<void> {
    if (!this.cameraStream) {
      if (this.isRunning) requestAnimationFrame(_ => this.processFrame());
      return;
    }

    const time_start = Date.now();

    if (!this.passthrough) await this.analyzer.analyze(this.cameraVideo, this);
    const time_analyze = Date.now();

    this.renderer.render(this.passthrough, this.analyzer.data, this.cameraVideo, this);
    const time_render = Date.now();

    this.performance.frameTime.analyze = time_analyze - time_start;
    this.performance.frameTime.render = time_render - time_analyze;
    this.performance.frameTime.total = time_render - time_start;

    // Time precision of Date.now() is not up to a millisecond for security reasons, so we may end up having zero frame time.
    // More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#reduced_time_precision
    this.performance.fps = this.performance.frameTime.total > 0 ? this.performance.frameTime.total * 0.001 : 1000;

    if (this.isRunning) requestAnimationFrame(_ => this.processFrame());
  }

  addAnalyzer<TAnalyzer extends FrameAnalyzer>(name: string, analyzer: TAnalyzer): TAnalyzer {
    return this.analyzer.addAnalyzer(name, analyzer);
  }

  removeAnalyzer(name: string): FrameAnalyzer {
    return this.analyzer.removeAnalyzer(name);
  }

  addRenderer<TRenderer extends FrameRenderer>(renderer: TRenderer): TRenderer {
    return this.renderer.addRenderer(renderer);
  }

  removeRenderer(idx: number): FrameRenderer {
    return this.renderer.removeRenderer(idx);
  }
}

export default CameraProcessor;
