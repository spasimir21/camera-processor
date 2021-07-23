import BodyPixSegmentationBackend from './segmentation_backend/BodyPixSegmentationBackend';
import MLKitSegmentationBackend from './segmentation_backend/MLKitSegmentationBackend';
import SegmentationBackend from './segmentation_backend/SegmentationBackend';
import CameraProcessor, { FrameAnalyzer } from 'camera-processor';
import { SEGMENTATION_BACKEND } from './shared';

class SegmentationAnalyzer extends FrameAnalyzer {
  private readonly backends: { [key: string]: SegmentationBackend } = {
    [SEGMENTATION_BACKEND.BodyPix]: new BodyPixSegmentationBackend(),
    [SEGMENTATION_BACKEND.MLKit]: new MLKitSegmentationBackend()
  };
  private backendId: SEGMENTATION_BACKEND;
  private backend: SegmentationBackend;

  constructor(segmentation_backend: SEGMENTATION_BACKEND) {
    super();
    this.setBackend(segmentation_backend);
  }

  get modelSettings(): any {
    return this.backend.modelSettings;
  }

  get segmentationSettings(): any {
    return this.backend.segmentationSettings;
  }

  setBackend(backend_id: SEGMENTATION_BACKEND): void {
    if (this.backends[backend_id] == null) {
      throw new Error(`SegmentationBackend does not exist! (${backend_id})`);
    }

    this.backendId = backend_id;
    this.backend = this.backends[this.backendId];
  }

  loadModel(model_settings: any): Promise<void> {
    return this.backend.loadModel(model_settings);
  }

  setSegmentationSettings(segmentation_settings: any): void {
    this.backend.setSegmentationSettings(segmentation_settings);
  }

  async analyze(camera_video: HTMLVideoElement, camera_processor: CameraProcessor): Promise<any> {
    return {
      data: await this.backend.analyze(camera_video),
      width: this.backend.width || camera_processor.renderer.width,
      height: this.backend.height || camera_processor.renderer.height
    };
  }
}

export default SegmentationAnalyzer;
