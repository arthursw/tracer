import paper from "paper";
import * as THREE from "three";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Potrace } from "./potrace";

import * as vertexShader from "./shaders/vertex";
import * as grayscaleShader from "./shaders/grayscale";
import * as contourDistanceShader from "./shaders/contourDistance";
import * as divergenceShader from "./shaders/divergence";
import * as adaptiveThresholdShader from "./shaders/adaptiveThreshold";
import { Plane, PlaneHelper } from "three";

let paperCanvas = document.getElementById('paper') as HTMLCanvasElement;
paper.install(window);
paper.setup(paperCanvas);

//This is all code needed to set up a basic ThreeJS scene
//First we initialize the scene and our camera
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

//We create the WebGL renderer and add it to the document
let canvas = document.createElement("canvas");
let context = canvas.getContext("webgl2");

let renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  context: context,
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBFormat,
  stencilBuffer: true
} as any);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let texture = new THREE.TextureLoader().load( 'dessin.jpg', resizePlane);

let uniforms = {
  time: { type: "f", value: Date.now() },
  resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  tDiffuse: { value: texture },
  C: { value: 0.025 },
  windowSize: { value: 15 },
};

// let material = new THREE.RawShaderMaterial({
//   uniforms: uniforms,
//   vertexShader: vertexShader.shader.trim(),
//   fragmentShader: grayscaleShader.shader.trim()
// });
let material = new THREE.MeshBasicMaterial({ map: texture });

let geometry = new THREE.PlaneGeometry(2, 2);

let sprite = new THREE.Mesh(geometry, material);

scene.add(sprite);
let effectComposer = new EffectComposer(renderer);
let renderPass = new RenderPass(scene, camera);
// renderPass.clear = false;
effectComposer.addPass(renderPass);

let grayscaleShaderPass = new ShaderPass(new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader.shader.trim(), fragmentShader: grayscaleShader.shader.trim() }));
effectComposer.addPass(grayscaleShaderPass);

let adaptiveThresholdShaderPass = new ShaderPass(new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader.shader.trim(), fragmentShader: adaptiveThresholdShader.shader.trim() }));
effectComposer.addPass(adaptiveThresholdShaderPass);

let contourDistanceShaderPass = new ShaderPass(new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader.shader.trim(), fragmentShader: contourDistanceShader.shader.trim() }));
effectComposer.addPass(contourDistanceShaderPass);

let divergenceShaderPass = new ShaderPass(new THREE.RawShaderMaterial({ uniforms: { ...uniforms, alpha: {value: 20}, threshold: {value: 0.8} }, vertexShader: vertexShader.shader.trim(), fragmentShader: divergenceShader.shader.trim() }));
effectComposer.addPass(divergenceShaderPass);

// let adaptiveThresholdShaderPass2 = new ShaderPass(new THREE.RawShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader.shader.trim(), fragmentShader: adaptiveThresholdShader.shader.trim() }));
// effectComposer.addPass(adaptiveThresholdShaderPass2);

let strokes = new paper.Group();
strokes.strokeWidth = 3.5;

function createPaperProject() {

  paper.project.clear();
  paper.project.importSVG(Potrace.getSVG(1));

  paper.project.activeLayer.firstChild.fitBounds(paper.view.bounds.expand(-240));
  (paper.project.view as any).setCenter(paper.project.activeLayer.bounds.center);

  if(!(paper.project.activeLayer.firstChild && 
        paper.project.activeLayer.firstChild.firstChild && 
        paper.project.activeLayer.firstChild.firstChild.children)) {
    return;
  }

  let compoundPath = paper.project.activeLayer.firstChild.firstChild;
  
  paper.project.clear();
  paper.project.activeLayer.addChild(strokes);
  for (let child of compoundPath.children) {
    let stroke = child.clone() as paper.Path;
    stroke.fillColor = null;
    stroke.closed = false;
    stroke.strokeColor = 'blue' as any;
    // stroke.opacity = 0.5;
    strokes.addChild(stroke);
  }

  let background = new paper.Path.Rectangle(paper.view.bounds);
  background.sendToBack();
  background.fillColor = 'white' as any;
}

function onFinishChange() {
  renderer.clear();
  effectComposer.render();
}

function trace() {
  onFinishChange();
  renderer.domElement.toBlob(function(blob) {
    Potrace.loadImageFromFile(blob);
    Potrace.process(createPaperProject);
  });
}

let gui = new GUI();
gui.add({ 'nPasses': 4 }, 'nPasses', 0, 4, 1).onChange(function(value: number) {
  let n = 0;
  for(let pass of effectComposer.passes) {
    pass.enabled = n == 0 || n <= value;
    n++;
  }
}).onFinishChange(onFinishChange);

gui.add((adaptiveThresholdShaderPass.uniforms as any).C, 'value', 0, 0.1, 0.001).name('C1').onFinishChange(onFinishChange);
gui.add((adaptiveThresholdShaderPass.uniforms as any).windowSize, 'value', 0, 25, 1).name('WSize1').onFinishChange(onFinishChange);
gui.add((contourDistanceShaderPass.uniforms as any).windowSize, 'value', 0, 25, 1).name('Contour distance').onFinishChange(onFinishChange);
gui.add((divergenceShaderPass.uniforms as any).alpha, 'value', 0, 150, 1).name('alpha').onFinishChange(onFinishChange);
gui.add((divergenceShaderPass.uniforms as any).threshold, 'value', 0.0, 1, 0.001).name('threshold').onFinishChange(onFinishChange);
gui.add(strokes, 'strokeWidth', 0, 15, 0.1);
// gui.add((adaptiveThresholdShaderPass2.uniforms as any).C, 'value', 0, 0.1, 0.01).name('C2').onFinishChange(onFinishChange);
// gui.add((adaptiveThresholdShaderPass2.uniforms as any).windowSize, 'value', 0, 25, 1).name('WSize2').onFinishChange(onFinishChange);
gui.add({trace: trace}, 'trace');
gui.add({'showVectorized': true}, 'showVectorized').onChange(function(value: boolean) {
  paper.project.activeLayer.visible = value;
});

window.addEventListener("resize", onWindowResize, false);

function resizePlane() {
  if(texture.image && texture.image.naturalWidth > 0 && texture.image.naturalHeight > 0) { // Make sure image is loaded and has dimensions
    // Note: must multiply by two to have real size ; but here we want to get half the size
    let newPlaneGeometry = new THREE.PlaneGeometry(texture.image.naturalWidth / window.innerWidth, texture.image.naturalHeight / window.innerHeight);
    geometry.vertices = newPlaneGeometry.vertices;
    geometry.verticesNeedUpdate = true;
  }
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  effectComposer.setSize(window.innerWidth, window.innerHeight);
  resizePlane();
}

//Render everything!
// function animate(timestamp: number = 0) {
//   requestAnimationFrame(animate);

//   // material.uniforms.image.value = texture;
//   // texture.needsUpdate = true;
//   material.uniforms.time.value = timestamp / 1000;

//   // renderer.render(scene, camera);
//   effectComposer.render();
// }

// animate();
