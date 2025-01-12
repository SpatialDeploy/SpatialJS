# SPLV Player
This project is capable of decoding and displaying a voxel-based spatial (4D video, `.splv`) on the web. The player is packaged as a web component so it can easily be included in your project.

![spatial_video](https://github.com/user-attachments/assets/aa2ee0e5-fe17-488b-8ec9-cbd7a599c965)


The decoder is written in C++ and compiled to WASM, and the player is written in JavaScript using WebGPU for efficient rendering.

# Installation
To include this player in your own project, you can simply install the npm package:
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
This will make the web component available.

# Building (Decoder)
Most of this project is written in JavaScript/WGSL, and so doesn't require compilation. The decoder, however, is written in C++ and must be built. The decoder must be compiled to WASM using Emscripten. It has the following dependencies:
- `cmake`
- `emscripten`

To build the decoder, run the following commands from the `decoder/` directory:
```bash
mkdir build
cd build
emcmake cmake ..
make
```
This should generate the file `spl_decoder.js`, containing the WASM as well as code for loading it. You can manually copy this into `player/src`, or you can call:
```bash
make install_decoder
```
This will build the decoder and copy it automatically.
