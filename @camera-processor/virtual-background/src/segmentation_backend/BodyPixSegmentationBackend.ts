import SegmentationBackend from './SegmentationBackend';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

class BodyPixSegmentationBackend extends SegmentationBackend {
  private net: bodyPix.BodyPix = null as unknown as bodyPix.BodyPix;

  public modelSettings = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
  };

  public segmentationSettings = {
    flipHorizontal: false,
    internalResolution: 'medium',
    segmentationThreshold: 0.7,
    maxDetections: 10,
    scoreThreshold: 0.3,
    nmsRadius: 20
  };

  async loadModel(model_settings = this.modelSettings): Promise<void> {
    this.net = await bodyPix.load(model_settings as any);
    this.modelSettings = model_settings;
  }

  async analyze(camera_video: HTMLVideoElement): Promise<Uint8Array | null> {
    if (this.net == null || camera_video.readyState < 2) return null;
    return (await this.net.segmentPerson(camera_video, this.segmentationSettings as any)).data;
  }
}

export default BodyPixSegmentationBackend;
