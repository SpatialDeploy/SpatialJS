# Spatial Video Player
This project is capable of decoding and displaying a voxel-based `spatial` (4D video, `.splv`) on the web. The player is packaged as a web component so it can easily be included in your project.

![spatial_video](https://github.com/user-attachments/assets/aa2ee0e5-fe17-488b-8ec9-cbd7a599c965)


The decoder is written in C++ and compiled to WASM, and the player is written in JavaScript using WebGPU for efficient rendering.

## What Are Spatials?
Spatials are an emerging video format that captures not just two-dimensional frames over time, but three-dimensional voxel data that changes over time, a 4D sequence. 

This allows for:
- 3D perspective shifts: Viewers can move around or rotate the scene.
- Depth-based effects: The video contains volumetric data for more immersive rendering.
- Web-based 3D experiences: Interact with 3D/4D content in a standard browser.

The `splv` file format encapsulates voxel data (position and color) for each frame. Our SPLV Player decodes and displays this data using modern browser capabilities such as WebGPU, enabling real-time rendering directly in the browser.


# Installation
To include the spatial player in your own project, you can simply install the npm package:
```bash
npm install spatial-player
```

# Usage
To include an SPLV player component in your project, simply use an `splv-player` component in your HTML. For example:
```html
<div style="width: 100%; height: 100%; display: flex;">
	<splv-player src="videos/my_spatial.splv"></splv-player>
</div>
```
You can specify which spatial you want to play with the `src` attribute. To define the `splv-player` component, you must first include the installed `npm` module:
```html
<script type="module">
	import 'spatial-player';
</script>
```
This will make the web component available. The following attributes are available to customize the player:
- `video-controls`: controls how when to display the play button and video scrubber. `"show"` forces them to always be visible, `"hide"` forces them to be hidden, and `"hover"` makes them only visible when the user's cursor is over the player. The default is `"show"`.
- `bounding-box`: controls whether to display the bounding box of the spatial, useful for debugging. `"show"` shows it and `"hide"` hides it. The default is `"hide"`.
- `top-color` and `bot-color`: control the color of the background gradient of the spatial. The background color linearly interpolates between the two. They must be given in the form `"r g b a"`, where each component is an integer in the range `[0, 255]`. The default for each is `"0 0 0 0"`, making the background completely transparent.
- `allow-pausing`: Can be either `"true"` or `"false"`. Controls whether the user is able to manually paue/play the spatial. The default is `"true"`.
- `allow-scrubbing`: Can be either `"true"` or `"false"`. Controls whether the user is able to manually set the play position of the spatial. The default is `"true"`.
- `update-scrubber-position`: Can be either `"true"` or `"false"`. Controls whether the visual position of the playhead is automatically updated. The default is `"true"`.

If you wish to add some functionality when the spatial is loaded and begins playing, you can listen for the `spatial-loaded` event, which is dispatched as soon as the spatial is ready to play. You can also query the metadata of the spatial with the `get_metadata()` function:
```js
const spatialComponent = document.querySelector('splv-player');
spatialComponent.addEventListener('spatial-loaded', (e) => {
    const metadata = spatialComponent.get_metadata();
    console.log("video loaded with metadata:");
    console.log(metadata);
});
```

If you wish to set the currently playing spatial programatically, you can use the `set_spatial(spatial)` function:
```js
const spatialComponent = document.querySelector('splv-player');

const response = await fetch("my_spatial.splv");
const spatial = await response.arrayBuffer();
spatialComponent.set_spatial(spatial);
```

If you wish to set properties of the currently playing spatial, such as the current time or whether it is paused, the following member functions are available:
- `SPLVPlayer.set_playing(value: bool)`: controls whether the spatial is playing.
- `SPLVPlayer.set_scrubbing(value: bool)`: same as `set_playing`, but doesn't update the visual pause/play button. Useful for if you want to implement a scrubber yourself.
- `SPLVPlayer.set_scrubber_position(value: Number)`: sets the position of the visual playhead, does NOT affect the actual spatial. `value` must be in the range `[0, 100]`.
- `SPLVPlayer.set_time(value: Number)`: sets the current time within the spatial to play from, updating the scrubber position if the `update-scrubber-position` attribute is `"true"`.

You can also set callbacks at various important events in the playing of a spatial, here is an example of each of them:
```js
const spatialComponent = document.querySelector('splv-player');

spatialComponent.set_callback_pause_play((v) => {
    console.log("playing: " + v);
});

spatialComponent.set_callback_is_scrubbing((v) => {
    console.log("is scrubbing: " + v);
});

spatialComponent.set_callback_scrubber_position((v) => {
    console.log("scrubber position: " + v);
});

spatialComponent.set_callback_time_set((v) => {
    console.log("time set to: " + v);
});

spatialComponent.set_callback_frame_decoded((f, t) => {
    console.log("decoded frame " + f + " at time " + t);
});

spatialComponent.set_callback_render((t) => {
    console.log("rendered at time " + t);
});

spatialComponent.set_callback_dropped_frames((d, t) => {
    console.warn("dropped frames " + d + " at time " + t);
});
```

## React
```js
import React, { useEffect } from 'react';

export function SpatialPlayer({ spatialUrl }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Import the player script dynamically after component mounts
            import('spatial-player/src/index.js');
        }
    }, []);

    return (
        <div>
            <splv-player src={spatialUrl}></splv-player>
        </div>
    );
}
```

# Building (Decoder)
The decoder is precompiled to WASM, and thus the player is able to be used right out of the box. However, you may wish to compile the `splv` decoder manually. It is written in C++ and must be compiled to WASM using Emscripten, the following dependencies are required:
- `cmake`
- `emscripten`
- `GnuWin32` (to run `make` on Windows)

To build the decoder, run the following commands from the `decoder/` directory:
```bash
mkdir build
cd build
emcmake cmake ..
make
```
This should generate the file `spl_decoder.js`, containing the WASM as well as code for loading it. You can manually copy this into `spatial-player/src`, or you can call:
```bash
make install_decoder
```
This will build the decoder and copy it automatically.
