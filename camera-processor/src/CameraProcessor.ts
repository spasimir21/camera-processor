import CameraAnalyzer from './CameraAnalyzer';
import CameraRenderer from './CameraRenderer';
import FrameAnalyzer from './FrameAnalyzer';
import FrameRenderer from './FrameRenderer';
import TimeWorker from 'time-worker';

const TIME_WORKER_INSTANCE = new TimeWorker();

interface CameraProcessorPerformanceOptions {
  useTimeWorker: boolean;
  everyNFrames: number;
  useIdle: boolean;
  idealFPS: number;
}

class CameraProcessor<TAnalyzerData = any> {
  public readonly analyzer: CameraAnalyzer<TAnalyzerData> = new CameraAnalyzer();
  public readonly renderer: CameraRenderer = new CameraRenderer();

  protected outputTracks: Set<MediaStreamTrack> = new Set();
  protected nextCallback: number | string | null = null;

  protected readonly cameraVideo: HTMLVideoElement = document.createElement('video');
  public cameraStream: MediaStream | null;

  protected _performanceOptions: CameraProcessorPerformanceOptions = {
    everyNFrames: 1,
    useIdle: false,
    idealFPS: 30,
    useTimeWorker: true
  };
  protected _nthFrame: number = 0;

  public readonly performance = { fps: NaN, frameTime: { analyze: NaN, render: NaN, total: NaN } };
  public passthrough: boolean = false;
  public isRunning: boolean = false;

  constructor() {
    this.cameraVideo.muted = true;
    this.processFrame = this.processFrame.bind(this); // For callback purposes
  }

  freeCameraStream(destroy: boolean = false): void {
    if (destroy && this.cameraStream != null) {
      this.cameraStream.getTracks().forEach(track => {
        this.cameraStream?.removeTrack(track);
        track.stop();
      });
    }
    this.cameraStream = null;
  }

  get performanceOptions(): CameraProcessorPerformanceOptions {
    return this._performanceOptions;
  }

  setPerformanceOptions(options: Partial<CameraProcessorPerformanceOptions>) {
    this._performanceOptions.useTimeWorker = options.useTimeWorker ?? this._performanceOptions.useTimeWorker;
    this._performanceOptions.everyNFrames = options.everyNFrames ?? this._performanceOptions.everyNFrames;
    this._performanceOptions.idealFPS = options.idealFPS ?? this._performanceOptions.idealFPS;
    this._performanceOptions.useIdle = options.useIdle ?? this._performanceOptions.useIdle;
  }

  schedule(): void {
    if (this._performanceOptions.useTimeWorker) {
      this.nextCallback = TIME_WORKER_INSTANCE.setTimeout(this.processFrame, 1000 / this._performanceOptions.idealFPS);
      // @ts-ignore
    } else if (this._performanceOptions.useIdle && window.requestIdleCallback) {
      // @ts-ignore
      requestIdleCallback(this.processFrame);
    } else {
      requestAnimationFrame(this.processFrame);
    }
  }

  cancelScheduled() {
    if (this.nextCallback == null) return;
    if (typeof this.nextCallback === 'string') {
      TIME_WORKER_INSTANCE.clearTimeout(this.nextCallback);
    } else {
      // @ts-ignore
      if (window.cancelIdleCallback) cancelIdleCallback(this.nextCallback);
      cancelAnimationFrame(this.nextCallback);
    }
    this.nextCallback = null;
  }

  async start(): Promise<void> {
    await (this.cameraVideo.play() || Promise.resolve());
    this.isRunning = true;
    if (this.nextCallback == null) this.schedule();
  }

  stop(): void {
    this.isRunning = false;
    this.cameraVideo.pause();
    if (this.nextCallback != null) this.cancelScheduled();
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

  protected async processFrame(): Promise<void> {
    this._nthFrame = this._nthFrame % this._performanceOptions.everyNFrames;
    if (this._nthFrame != 0 || this.cameraStream == null || this.outputTracks.size == 0) {
      if (this.isRunning) this.schedule();
      this._nthFrame++;
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
    if (this.isRunning) this.schedule();
    this._nthFrame++;
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

export { CameraProcessorPerformanceOptions };
export default CameraProcessor;
