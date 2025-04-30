# imgly-cropper-demo (Angular)

This Angular demo project reproduces several issues encountered when integrating the [@cesdk/cesdk-js](https://www.npmjs.com/package/@cesdk/cesdk-js) SDK (`^1.47.0`) with cropping functionality, remote media, and template handling.

> 🔗 **Live Demo**: [https://olyurchenko.github.io/imgly-cropper-demo/](https://olyurchenko.github.io/imgly-cropper-demo/)

---

## 🧩 Technologies

- Angular
- CreativeEditor SDK v1.47.0
- Deployment via GitHub Pages

---

## ❗ Issues to Investigate

### 🖼️ 1. Image Templates with Cropper

When applying an image template with cropping logic via:

cdk.engine.scene.applyTemplateFromURL(asset.meta.uri);


The following runtime error appears in the browser console:

Uncaught Error: Target block has no fill

📷 Screenshot:

https://sl-chat-video-development.s3.amazonaws.com/170a6452-2167-470f-868a-9577a094bee7.mp4


🧪 Reproduction Steps:
  - Open the demo in Google Chrome.
  - Click on the attach button.
  - Select some image.
  - Wait for the editor to fully load.
  - Click the Templates tab on the left sidebar.
  - Select any available template.

✅ Expected: Template is loaded and image is applied inside the placeholder.

❌ Actual: A placeholder appears without an image.


The browser console logs the error: Uncaught Error: Target block has no fill


### 🖼️ 2. Video cropping

When applying a cropping to video:

📷 Screenshot:

https://sl-chat-video-development.s3.amazonaws.com/ca535a10-5829-4d9b-b03e-f449e903f132.mp4


🧪 Reproduction Steps:
  - Open the demo in Google Chrome.
  - Click on the attach button.
  - Select some video.
  - Wait for the editor to fully load.
  - Click the Crop tab on the left sidebar.
  - Select any available cropping option.

✅ Expected: Video cropping is acting similar to image cropping.

❌ Actual: It works differently.


The browser console logs the error: Error: Component ubq/designblocks/ImageFill is not set on entity 3.




### 🖼️ Questions

Is there any examples of grouping remote media sources under 1 tab like this 
📷 Screenshot:

https://sl-chat-image-development.s3.amazonaws.com/144dc610-7faf-4a09-9544-fc2838361270.png

Does the NodeJs CE.SDK ("@cesdk/node": "^1.48.1") currently support exporting video? 
Because I get this - Exporting video is currently not supported on Node.JS
