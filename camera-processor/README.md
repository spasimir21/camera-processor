# Camera Processor v0.9.2

A Simple to Use Webcam Filter Framework.

# Installation

```
$ npm install camera-processor
```

# Extra Packages

- [@camera-processor/virtual-background](https://www.npmjs.com/package/@camera-processor/virtual-background) - Easy-to-use background masking.

- _More coming in the future..._

# Basic Concepts

## Frame Analyzers

**Frame Analyzers** take frames from your camera and asynchronously give back some information about them that your app and **Frame Renderers** can use.

## Frame Renderers

**Frame Renderers** take the information given to them by the **Frame Analyzers** and use **Render Modes** to draw things on top of the camera.

## Render Modes

**Render Modes** give you a canvas and a canvas context that **Frame Renderers** can use to draw. There are 2 **Render Modes** that come with this library - **\_2DRenderMode** and **WebGLRenderMode** (_Unfinished_).

## Camera Processor

The **Camera Processor** is the main component of this library. It combines the **Frame Analyzers** with the **Frame Renderers** and a frame loop.

# Usage

## A Simple Mock Example

```javascript
import CameraProcessor from 'camera-processor';

const camera_processor = new CameraProcessor();
camera_processor.setCameraStream(camera_stream); // Set the camera stream from somewhere
camera_processor.start(); // You have to explicitly start it after setCameraStream

// Add some analyzer (the first argument is the name and it's very important)
const some_analyzer = camera_processor.addAnalyzer('some_analyzer', new SomeAnalyzer());
// Add some renderer that might or might not use data from the analyzers
const some_renderer = camera_processor.addRenderer(new SomeRenderer());

const output_stream = camera_processor.getOutputStream(); // Get the output stream and use it
```

## Accessing Data From the Analyzers

```javascript
// Get the data for the last frame from all analyzers
const analyzer_data = camera_processor.analyzer.data;

// This object has a key for every name you used with addAnalyzer
// And the value of this key is the data for the last frame returned by that analyzer
console.log(analyzer_data);
// > { some_analyzer: ... }
```

## Checking Performance

```javascript
console.log(camera_processor.performance);
// > {
//     fps: ...,
//     frameTime: {
//       analyze: ...,
//       render: ...,
//       total: ...
//     }
//   }
```

## Passthrough Mode

```javascript
// Stop all analyzers and renderers and just pass the camera stream through the output stream
camera_processor.passthrough = true;
```

## Start/Stop

```javascript
camera_processor.start(); // Start/Resume (has to be called explicitly in the beginning)
camera_processor.stop(); // Stop/Pause (also freezes the camera through the output stream)
// Use passthrough mode if you just want to stop all renderers and analyzers

// All analyzers and renderers have the same start/stop methods
// to start and stop them individually but unlike the CameraProcessor
// they're are started by default
some_analyzer.start();
some_renderer.stop();

// Check if the CameraProcessor or any analyzer/renderer is running
console.log(camera_processor.isRunning);
console.log(some_analyzer.isRunning);
```

## Typescript Tip

```typescript
type AnalyzerData = { some_analyzer: SomeType };

// This will give you special typing for the camera_processor.analyzer.data
const camera_processor = new CameraProcessor<AnalyzerData>();
```

## A Note On Streams And Tracks

**CameraProcessor** will automatically _pause_ (_not stop_) to save performance when there are no output tracks active. Restrain from using **stream.clone()** or **track.clone()** because the new cloned tracks can't and won't count as active.

# Extending Library Functionality

## Writing Frame Analyzers

```javascript
import { FrameAnalyzer } from 'camera-processor';

class SomeAnalyzer extends FrameAnalyzer {
  async analyze(camera_video, camera_processor) {
    // Do something with camera_video
    return some_data;
  }
}

// camera_processor.addAnalyzer('some_analyzer', new SomeAnalyzer());
```

## Writing Frame Renderers

```javascript
import { FrameRenderer, RENDER_MODE } from 'camera-processor';

// Check 'Using The Camera Renderer' below for more details on 'renderer' and 'RENDER_MODE'
class SomeRenderer extends FrameRenderer {
  render(analyzer_data, camera_video, renderer, camera_processor) {
    renderer.use(RENDER_MODE._2D); // Switch to the specified Render Mode (always do this at the start)

    renderer.ctx.fillStyle = 'green';
    renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
  }
}

// camera_processor.addRenderer(new SomeRenderer());
```

### Using The Camera Renderer

```javascript
// In the render method of a FrameRenderer you have access to the CameraRenderer (renderer)
renderer.use(RENDER_MODE._2D); // Switch to that canvas and canvas context

// Note: A FrameRenderer can use multiple different RenderModes one after another and the image will
// be copied from the previous one to the next so that you can make incremental changes to the image
// by rendering transparent things on top of it.

renderer.canvas; // Access the current RenderMode's canvas
renderer.ctx; // Access the current RenderMode's canvas context

renderer.width; // Access the camera's width
renderer.height; // Access the camera's height
```

**RENDER_MODE** is an enum that allows you to specify what kind of canvas context you want to use.  
**RENDER_MODE.\_2D** will use a 2d canvas.  
**RENDER_MODE.WebGL** will use a webgl2/webgl canvas. (_Unfinished_)

# TODO

- Fix the output stream freezing when the page is hidden. (using [time-worker](https://www.npmjs.com/package/time-worker) and OffscreenCanvas)
- Implement some kind of API for resizing CanvasSources and getting their ImageData back. (Will be useful for FrameAnalyzers and FrameRenderers)
- Finish implementing WebGLRenderMode to allow rendering with WebGL.
