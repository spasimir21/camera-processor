import { RENDER_PIPELINE, VIRTUAL_BACKGROUND_TYPE, VirtualBackground } from './shared';
import _2DRenderPipeline from './render_pipeline/_2DRenderPipeline';
import WebGLRenderPipeline from './render_pipeline/WebGLRenderPipeline';
import { FrameRenderer, CameraRenderer } from 'camera-processor';
import RenderPipeline from './render_pipeline/RenderPipeline';

class VirtualBackgroundRenderer extends FrameRenderer {
  public readonly background: VirtualBackground = { type: VIRTUAL_BACKGROUND_TYPE.None, data: null };
  private readonly pipelines: { [key: string]: RenderPipeline } = {};
  public pipelineId: RENDER_PIPELINE;
  public pipeline: RenderPipeline;
  public renderSettings: any;

  constructor(render_pipeline: RENDER_PIPELINE) {
    super();
    this.addPipeline(RENDER_PIPELINE._2D, new _2DRenderPipeline());
    this.addPipeline(RENDER_PIPELINE.WebGL, new WebGLRenderPipeline());
    this.setPipeline(render_pipeline);
  }

  setBackground(type: VIRTUAL_BACKGROUND_TYPE, data: any = null) {
    this.background.type = type;
    this.background.data = data;
  }

  setPipeline(pipeline_id: RENDER_PIPELINE): void {
    this.pipelineId = pipeline_id;
    this.pipeline = this.pipelines[this.pipelineId];
    this.renderSettings = this.pipeline.renderSettings;
  }

  setRenderSettings(render_settings: any): void {
    this.pipeline.setRenderSettings(render_settings);
    this.renderSettings = render_settings;
  }

  render(analyzer_data: any, camera_video: HTMLVideoElement, renderer: CameraRenderer): void {
    if (analyzer_data.segmentation?.data == null) return;
    this.pipeline.render(analyzer_data.segmentation, this.background, camera_video, renderer);
  }

  // prettier-ignore
  addPipeline<TPipeline extends RenderPipeline>(pipeline_id: RENDER_PIPELINE, pipeline: TPipeline): TPipeline {
    this.pipelines[pipeline_id] = pipeline;
    return pipeline;
  }
}

export default VirtualBackgroundRenderer;
