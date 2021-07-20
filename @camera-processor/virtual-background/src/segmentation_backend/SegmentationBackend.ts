abstract class SegmentationBackend {
  public abstract segmentationSettings = {};
  public abstract modelSettings = {};
  public width: number | null = null;
  public height: number | null = null;

  async loadModel(model_settings = this.modelSettings): Promise<void> {
    this.modelSettings = model_settings;
  }

  setSegmentationSettings(segmentation_settings: any): void {
    this.segmentationSettings = segmentation_settings;
  }

  abstract analyze(camera_video: HTMLVideoElement): Promise<any>;
}

export default SegmentationBackend;
