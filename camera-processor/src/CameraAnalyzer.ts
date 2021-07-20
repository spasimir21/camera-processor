import CameraProcessor from './CameraProcessor';
import FrameAnalyzer from './FrameAnalyzer';

class CameraAnalyzer<TData extends Record<string, any> = Record<string, any>> {
  public readonly analyzers: { [key: string]: FrameAnalyzer } = {};
  public readonly data: TData = {} as any;

  addAnalyzer<TAnalyzer extends FrameAnalyzer>(name: string, analyzer: TAnalyzer): TAnalyzer {
    this.analyzers[name] = analyzer;
    return analyzer;
  }

  removeAnalyzer(name: string): FrameAnalyzer {
    const analyzer = this.analyzers[name];
    delete this.analyzers[name];
    return analyzer;
  }

  async analyze(camera_video: HTMLVideoElement, camera_processor: CameraProcessor): Promise<TData> {
    for (const analyzer_name in this.analyzers) {
      const analyzer = this.analyzers[analyzer_name];
      (this.data as any)[analyzer_name] = await analyzer.analyzeFrame(camera_video, camera_processor);
    }

    return this.data;
  }
}

export default CameraAnalyzer;
