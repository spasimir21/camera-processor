import createTFLiteModel, { TFLiteModel } from 'tflite-helper';
import SegmentationBackend from './SegmentationBackend';

class MLKitSegmentationBackend extends SegmentationBackend {
  private canvas: HTMLCanvasElement = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  private net: TFLiteModel = null as any;

  public modelSettings = {
    modelPath: '/mlkit-selfie.tflite',
    modulePath: '/'
  };

  public segmentationSettings = {};

  private setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  async loadModel(model_settings = this.modelSettings): Promise<void> {
    this.net = await createTFLiteModel(model_settings.modelPath, model_settings.modulePath);
    this.setDimensions(this.net.inputs[0].dimensions[1], this.net.inputs[0].dimensions[2]);
    this.modelSettings = model_settings;
  }

  async analyze(camera_video: HTMLVideoElement): Promise<Float32Array | null> {
    if (this.net == null || camera_video.readyState < 2) return null;

    this.ctx.drawImage(camera_video, 0, 0, this.width as number, this.height as number);
    const image_data = this.ctx.getImageData(0, 0, this.width as number, this.height as number);
    const input_data: Float32Array = this.net.inputs[0].data as Float32Array;

    for (let i = 0; i < image_data.data.length; i++) {
      input_data[i * 3] = image_data.data[i * 4] / 255;
      input_data[i * 3 + 1] = image_data.data[i * 4 + 1] / 255;
      input_data[i * 3 + 2] = image_data.data[i * 4 + 2] / 255;
    }

    this.net.invoke();
    return this.net.outputs[0].data as Float32Array;
  }
}

export default MLKitSegmentationBackend;
