# spatial-player
A web component for playing spatials (3D videos). Capable of rendering voxel-based spatials (`.splv`) in 3D, allowing the user to pan the camera around. Can be easily integrated into any project.

## Installation
```bash
npm install spatial-player
```

## Usage
```html
<script type="module">
	import 'spatial-player';
</script>

<splv-player src="my_spatial.splv"></splv-player>
```
`src` specifies the spatial to play.

Note that this project requires WebGPU support, which may need to be enabled on certain browsers. Additionally, this project utilizes [SharedArrayBuffers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), which require the site to be [cross-origin isolated](https://web.dev/articles/coop-coep), so you must set the HTML headers:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```