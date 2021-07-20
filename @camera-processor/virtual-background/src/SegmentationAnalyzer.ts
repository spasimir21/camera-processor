import BodyPixSegmentationBackend from './segmentation_backend/BodyPixSegmentationBackend';
import MLKitSegmentationBackend from './segmentation_backend/MLKitSegmentationBackend';
import SegmentationBackend from './segmentation_backend/SegmentationBackend';
import CameraProcessor, { FrameAnalyzer } from 'camera-processor';
import { SEGMENTATION_BACKEND } from './shared';

class SegmentationAnalyzer extends FrameAnalyzer {
  private segmentationResult: { width: number; height: number; data: any };
  private readonly backends: { [key: string]: SegmentationBackend } = {};
  public backendId: SEGMENTATION_BACKEND;
  public backend: SegmentationBackend;
  public segmentationSettings: any;
  public modelSettings: any;

  constructor(segmentation_backend: SEGMENTATION_BACKEND) {
    super();
    this.segmentationResult = { width: 1, height: 1, data: null };
    this.addBackend(SEGMENTATION_BACKEND.BodyPix, new BodyPixSegmentationBackend());
    this.addBackend(SEGMENTATION_BACKEND.MLKit, new MLKitSegmentationBackend());
    this.setBackend(segmentation_backend);
  }

  setBackend(backend_id: SEGMENTATION_BACKEND): void {
    this.backendId = backend_id;
    this.backend = this.backends[this.backendId];
    this.modelSettings = this.backend.modelSettings;
    this.segmentationSettings = this.backend.segmentationSettings;
  }

  async loadModel(model_settings: any) {
    await this.backend.loadModel(model_settings);
    this.modelSettings = model_settings;
  }

  setSegmentationSettings(segmentation_settings: any): void {
    this.backend.setSegmentationSettings(segmentation_settings);
    this.segmentationSettings = segmentation_settings;
  }

  async analyze(camera_video: HTMLVideoElement, camera_processor: CameraProcessor): Promise<any> {
    this.segmentationResult.data = await this.backend.analyze(camera_video);
    this.segmentationResult.width = this.backend.width || camera_processor.renderer.width;
    this.segmentationResult.height = this.backend.height || camera_processor.renderer.height;
    return this.segmentationResult;
  }

  // prettier-ignore
  addBackend<TBackend extends SegmentationBackend>(backend_id: SEGMENTATION_BACKEND, backend: TBackend): TBackend {
    this.backends[backend_id] = backend;
    return backend;
  }
}

export default SegmentationAnalyzer;
