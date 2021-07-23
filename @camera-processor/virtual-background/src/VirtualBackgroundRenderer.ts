import { RENDER_PIPELINE, VIRTUAL_BACKGROUND_TYPE, VirtualBackground } from './shared';
import _2DRenderPipeline from './render_pipeline/_2DRenderPipeline';
import WebGLRenderPipeline from './render_pipeline/WebGLRenderPipeline';
import { FrameRenderer, CameraRenderer } from 'camera-processor';
import RenderPipeline from './render_pipeline/RenderPipeline';

class VirtualBackgroundRenderer extends FrameRenderer {
  public readonly background: VirtualBackground = { type: VIRTUAL_BACKGROUND_TYPE.None, data: null };
  private readonly pipelines: { [key: string]: RenderPipeline } = {
    [RENDER_PIPELINE._2D]: new _2DRenderPipeline(),
    [RENDER_PIPELINE.WebGL]: new WebGLRenderPipeline()
  };
  private pipelineId: RENDER_PIPELINE;
  private pipeline: RenderPipeline;

  constructor(render_pipeline: RENDER_PIPELINE) {
    super();
    this.setPipeline(render_pipeline);
  }

  get renderSettings(): any {
    return this.pipeline.renderSettings;
  }

  setBackground(type: VIRTUAL_BACKGROUND_TYPE, data: any = null) {
    this.background.type = type;
    this.background.data = data;
  }

  setPipeline(pipeline_id: RENDER_PIPELINE): void {
    if (this.pipelines[pipeline_id] == null) {
      throw new Error(`RenderPipeline does not exist! (${pipeline_id})`);
    }

    this.pipelineId = pipeline_id;
    this.pipeline = this.pipelines[this.pipelineId];
  }

  setRenderSettings(render_settings: any): void {
    this.pipeline.setRenderSettings(render_settings);
  }

  render(analyzer_data: any, camera_video: HTMLVideoElement, renderer: CameraRenderer): void {
    if (analyzer_data.segmentation?.data == null) return;
    this.pipeline.render(analyzer_data.segmentation, this.background, camera_video, renderer);
  }
}

export default VirtualBackgroundRenderer;
