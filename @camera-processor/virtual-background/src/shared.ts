type VirtualBackground = {
  type: VIRTUAL_BACKGROUND_TYPE;
  data: any;
};

enum SEGMENTATION_BACKEND {
  BodyPix,
  MLKit
}

enum RENDER_PIPELINE {
  _2D,
  WebGL
}

enum VIRTUAL_BACKGROUND_TYPE {
  None,
  Transparent,
  Color,
  Filter,
  Image
}

export { SEGMENTATION_BACKEND, RENDER_PIPELINE, VIRTUAL_BACKGROUND_TYPE, VirtualBackground };
