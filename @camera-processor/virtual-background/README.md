# Camera Processor Virtual Background v0.9.10

Simple, Easy-to-use Background Masking Using Camera-Processor.

# Framework

This package uses the [camera-processor](https://npmjs.com/package/camera-processor) framework.

# Preparation (For MLKit Model)

You need to host the **MLKit Selfie Segmentation Model's .tflite** file ([here](https://github.com/google/mediapipe/blob/master/mediapipe/modules/selfie_segmentation/selfie_segmentation.tflite)) somewhere on your server.  
Since this package uses [tflite-helper](https://npmjs.com/package/tflite-helper), you'll also need to do the steps described in that package's **Preparation** section.

# Usage

```javascript
import CameraProcessor from 'camera-processor';
import {
  SegmentationAnalyzer,
  VirtualBackgroundRenderer,
  SEGMENTATION_BACKEND,
  RENDER_PIPELINE,
  VIRTUAL_BACKGROUND_TYPE
} from '@camera-processor/virtual-background';

const camera_processor = new CameraProcessor(); // Instantiate framework object
camera_processor.setCameraStream(camera_stream); // Set the camera stream from somewhere
camera_processor.start(); // Start the camera processor

// Add the segmentation analyzer
const segmentation_analyzer = camera_processor.addAnalyzer(
  'segmentation',
  new SegmentationAnalyzer(SEGMENTATION_BACKEND.MLKit)
);

// Add the virtual background renderer
const background_renderer = camera_processor.addRenderer(new VirtualBackgroundRenderer(RENDER_PIPELINE._2D));

// Set the virtual background settings
const image = new Image();
image.src = '...some image source'; // Stream will freeze if this image is CORS protected
background_renderer.setBackground(VIRTUAL_BACKGROUND_TYPE.Image, image);

// Load the model
// modelPath is the path where you hosted the model's .tflite file
// modulePath is the path where you hosted tflite-helper's module files
segmentation_analyzer.loadModel({
  modelPath: './tflite/models/selfie_segmentation.tflite',
  modulePath: './tflite/'
});

const output_stream = camera_processor.getOutputStream(); // Get the output stream and use it
```

## Segmentation Analyzer

```javascript
// There are two Segmentation Backends:
// BodyPix
// MLKit
const segmentation_analyzer = new SegmentationAnalyzer(SEGMENTATION_BACKEND.MLKit);

// Depending on the Segmentation Backend you're using the settings here are different
// The settings for the BodyPix Backend are here: https://www.npmjs.com/package/@tensorflow-models/body-pix#config-params-in-bodypixload
// And these are the settings for the MLKit Backend
// modelPath is the path where you hosted the model's .tflite file
// modulePath is the path where you hosted tflite-helper's module files
segmentation_analyzer.loadModel({
  modelPath: './tflite/models/selfie_segmentation.tflite',
  modulePath: './tflite/'
});

// Depending on the Segmentation Backend you're using the settings here are different
// The settings for the BodyPix Backend are here (under config): https://www.npmjs.com/package/@tensorflow-models/body-pix#params-in-segmentperson
// And there are no settings for the MLKit Backend
segmentation_analyzer.setSegmentationSettings({});

// You can also dynamically change the Segmentation Backend
segmentation_analyzer.setBackend(SEGMENTATION_BACKEND.BodyPix); // You might have to load the model again
```

## Virtual Background Renderer

```javascript
// There are two Render Pipelines:
// _2D
// WebGL (Unfinished)
const background_renderer = new VirtualBackgroundRenderer(RENDER_PIPELINE._2D);

// The first argument is the type and the second is some data for that type
// There are five Virtual Background Types:
// None - no data - leave the camera alone
// Transparent - no data
// Color - string data (canvas fillStyle)
// Filter - string data (canvas filter)
// Image - Image data (image object)
background_renderer.setBackground(VIRTUAL_BACKGROUND_TYPE.Filter, 'blur(20px)');

// You can also dynamically change the RenderPipeline
background_renderer.setPipeline(RENDER_PIPELINE.WebGL); // WebGL doesn't work right now though

// The contourFilter is the canvas filter to apply to the segmentation mask.
// It's usually blur to smoothen it a bit.
// By default it's 'blur(4px)' which works well for images, but
// 'blur(8px)' works best for a blurred background
background_renderer.setRenderSettings({ contourFilter: 'blur(8px)' });
```

# TODO

- Cache image scaling in the **\_2DRenderPipeline** and support more image options.
- Finish implementing the **WebGLRenderPipeline**. (which I probably won't do for a long time, since it's very compilcated and the performance gain isn't big either)
