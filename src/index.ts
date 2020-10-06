import * as THREE from "three";
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


import "./style.css";

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded
let manager = new ZapparThree.LoadingManager();

// Setup ThreeJS in the usual way
let renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Setup a Zappar camera instead of one of ThreeJS's cameras
let camera = new ZapparThree.Camera();

// The Zappar library needs your WebGL context, so pass it
ZapparThree.glContextSet(renderer.getContext());

// Create a ThreeJS Scene and set its background to be the camera background texture
let scene = new THREE.Scene();
scene.background = camera.backgroundTexture;

// Request the necessary permission from the user
ZapparThree.permissionRequestUI().then(function(granted) {
    if (granted) camera.start(true); // For face tracking let's use the user-facing camera
    else ZapparThree.permissionDeniedUI();
});

// Set up our image tracker group
// Pass our loading manager in to ensure the progress bar works correctly
let tracker = new ZapparThree.FaceTrackerLoader(manager).load();
let trackerGroup = new ZapparThree.FaceAnchorGroup(camera, tracker);
scene.add(trackerGroup);

// Start with the content group invisible
trackerGroup.visible = false;

// We want the user's face to appear in the center of the helmet
// so use ZapparThree.HeadMaskMesh to mask out the back of the helmet.
// In addition to constructing here we'll call mask.updateFromFaceAnchorGroup(...)
// in the frame loop later.
let mask = new ZapparThree.HeadMaskMeshLoader().load();
trackerGroup.add(mask);

// Get the URL of the "masked_helmet.glb" 3D model
const gltfUrl = require("file-loader!../scene.gltf").default;
// Since we're using webpack, we can use the 'file-loader' to make sure it's
// automatically included in our output folder

// Load a 3D model to place within our group (using ThreeJS's GLTF loader)
// Pass our loading manager in to ensure the progress bar works correctly
const gltfLoader = new GLTFLoader(manager);
gltfLoader.load(gltfUrl, (gltf) => {

    // Position the loaded content to overlay user's face
    //gltf.scene.position.set(0.3, -1.3, 0);
    gltf.scene.scale.set(10, 10, 10);

    // Add the scene to the tracker group
    trackerGroup.add(gltf.scene)

}, undefined, () => {
    console.log("An error ocurred loading the GLTF model");
});

// Let's add some lighting, first a directional light above the model pointing down
const directionalLight = new THREE.DirectionalLight("white", 0.8);
directionalLight.position.set(0, 5, 0);
directionalLight.lookAt(0, 0, 0);
scene.add(directionalLight);

// And then a little ambient light to brighten the model up a bit
const ambeintLight = new THREE.AmbientLight("white", 0.4);
scene.add(ambeintLight);

// Hide the 3D content when the face is out of view
trackerGroup.faceTracker.onVisible.bind(() => trackerGroup.visible = true);
trackerGroup.faceTracker.onNotVisible.bind(() => trackerGroup.visible = false);


// Set up our render loop
function render() {
    requestAnimationFrame(render);
    camera.updateFrame(renderer);


    // Update the head mask so it fits the user's head in this frame
    mask.updateFromFaceAnchorGroup(trackerGroup);

    renderer.render(scene, camera);
}

requestAnimationFrame(render);