import BodyPixSegmentationBackend from './segmentation_backend/BodyPixSegmentationBackend';
import MLKitSegmentationBackend from './segmentation_backend/MLKitSegmentationBackend';
import SegmentationBackend from './segmentation_backend/SegmentationBackend';
import CameraProcessor, { FrameAnalyzer } from 'camera-processor';
import { SEGMENTATION_BACKEND } from './shared';

class SegmentationAnalyzer extends FrameAnalyzer {
  private readonly backends: { [key: string]: SegmentationBackend } = {};
  private backendId: SEGMENTATION_BACKEND;
  private backend: SegmentationBackend;

  constructor(segmentation_backend: SEGMENTATION_BACKEND) {
    super();
    this.backends = {
      [SEGMENTATION_BACKEND.BodyPix]: new BodyPixSegmentationBackend(),
      [SEGMENTATION_BACKEND.MLKit]: new MLKitSegmentationBackend()
    };

    this.setBackend(segmentation_backend);
  }

  setBackend(backend_id: SEGMENTATION_BACKEND): void {
    if (!(backend_id in this.backends)) {
      throw new Error(`"${backend_id}" SegmentationBackend does not exist.`);
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
