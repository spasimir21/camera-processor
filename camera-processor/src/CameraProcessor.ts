import CameraAnalyzer from './CameraAnalyzer';
import CameraRenderer from './CameraRenderer';
import FrameAnalyzer from './FrameAnalyzer';
import FrameRenderer from './FrameRenderer';

class CameraProcessor<TAnalyzerData = any> {
  public readonly analyzer: CameraAnalyzer<TAnalyzerData> = new CameraAnalyzer();
  public readonly renderer: CameraRenderer = new CameraRenderer();

  private outputTracks: Set<MediaStreamTrack> = new Set();
  private nextAnimationFrame: number = -1;

  private readonly cameraVideo: HTMLVideoElement = document.createElement('video');
  public cameraStream: MediaStream;

  public readonly performance = { fps: NaN, frameTime: { analyze: NaN, render: NaN, total: NaN } };
  public passthrough: boolean = false;
  public isRunning: boolean = false;

  constructor() {
    this.cameraVideo.muted = true;
    this.processFrame = this.processFrame.bind(this); // For callback purposes
  }

  async start(): Promise<void> {
    await (this.cameraVideo.play() || Promise.resolve());
    this.isRunning = true;
    if (this.nextAnimationFrame == -1) this.nextAnimationFrame = requestAnimationFrame(this.processFrame);
  }

  stop(): void {
    this.isRunning = false;
    this.cameraVideo.pause();
    if (this.nextAnimationFrame != -1) cancelAnimationFrame(this.nextAnimationFrame);
    this.nextAnimationFrame = -1;
  }

  setCameraStream(stream: MediaStream): void {
    this.cameraStream = stream;
    this.cameraVideo.srcObject = this.cameraStream;

    const stream_settings = this.cameraStream.getVideoTracks()[0].getSettings();
    this.renderer.setDimensions(stream_settings.width ?? 1, stream_settings.height ?? 1);
  }

  getOutputStream(): MediaStream {
    const stream = this.renderer.getStream();
    stream.getVideoTracks().map(track => {
      this.outputTracks.add(track);
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/onended
      // https://stackoverflow.com/questions/55953038/why-is-the-ended-event-not-firing-for-this-mediastreamtrack
      // We want the event since the track can be ended for multiple different reasons
      track.addEventListener('ended', () => this.outputTracks.delete(track), { once: true });
      const trackStop = track.stop; // .stop() doesn't trigger the event, so we have to monkey patch it
      track.stop = function () {
        trackStop.call(this);
        this.dispatchEvent(new Event('ended'));
      };
    });
    return stream;
  }

  private async processFrame(): Promise<void> {
    if (this.cameraStream == null || this.outputTracks.size == 0) {
      if (this.isRunning) this.nextAnimationFrame = requestAnimationFrame(this.processFrame);
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
    this.performance.fps = this.performance.frameTime.total > 0 ? 1000 / this.performance.frameTime.total : 1000;
    if (this.isRunning) this.nextAnimationFrame = requestAnimationFrame(this.processFrame);
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
