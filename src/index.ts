import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols');
import { indices as pointIndices, vertices as pointVertices } from './geometry/pointGeometry';
import { indices as cubeIndices, vertices as cubeVertices } from './geometry/cubeGeometry';
import vertShaderPoint from './shader/vertShaderPoint';
import fragShaderPoint from './shader/fragShaderPoint';
import vertShaderBoundingBox from './shader/vertShaderBoundingBox';
import fragShaderBoundingBox from './shader/fragShaderBoundingBox';

function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 1, -3)
  camera.lookAt(new THREE.Vector3());
  const renderer = new THREE.WebGLRenderer({ alpha: true });

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild(renderer.domElement);
  
	if (renderer.extensions.get('ANGLE_instanced_arrays') === null) {
		return;
  }

  camera.position.z = 5;
  
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  const frameSelector = document.querySelector<HTMLInputElement>('#active-frame-input');

  const labelFilesInput = document.querySelector<HTMLInputElement>('#label-files-input');
  const labelFilesLoaded = document.querySelector<HTMLSpanElement>('#label-files-loaded');
  const labelFilesTotal = document.querySelector<HTMLSpanElement>('#label-files-total');

  const pointFilesInput = document.querySelector<HTMLInputElement>('#point-files-input');
  const pointFilesLoaded = document.querySelector<HTMLSpanElement>('#point-files-loaded');
  const pointFilesTotal = document.querySelector<HTMLSpanElement>('#point-files-total');

  const framePointMeshes = [];
  const frameLabelMeshes = [];

  const pointMaterial = new THREE.RawShaderMaterial({
    vertexShader: vertShaderPoint,
    fragmentShader: fragShaderPoint,
    side: THREE.DoubleSide,
    transparent: true,
  });

  const boundingBoxMaterial = new THREE.RawShaderMaterial({
    vertexShader: vertShaderBoundingBox,
    fragmentShader: fragShaderBoundingBox,
    side: THREE.DoubleSide,
    transparent: true,
  });

  const handlePointFileRead = (fileName: string) => (progressEvent) => {
    const text = progressEvent.target.result;
    if (typeof text !== 'string') return;

    const frameIndex = Number(fileName.match(/\d+/));
    const lines = text.split(/\r\n|\n/);
    const numPoints = Number(lines[0]);
    const points = [];
    const labels = [];

    lines.slice(2).forEach((line) => {
      if (line === '') return;
      const [label, x, y, z] = line.split(' ').map(i => Number(i));
      points.push(x, y, z);
      labels.push(label);
    });

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.maxInstancedCount = numPoints;
    geometry.setIndex(pointIndices);
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pointVertices), 3));
    geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(points), 3 ));
    geometry.setAttribute('type', new THREE.InstancedBufferAttribute(new Float32Array(labels), 1));
    
    const mesh = new THREE.Mesh(geometry, pointMaterial);
    mesh.scale.x = 0.2;
    mesh.scale.y = 0.2;
    mesh.scale.z = 0.2;

    framePointMeshes[frameIndex] = mesh;

    if (frameIndex === 0) {
      scene.add(mesh);
    }

    pointFilesLoaded.innerHTML = (Number(pointFilesLoaded.innerHTML) + 1).toString();
    console.log(`Loaded points for frame ${frameIndex}.`);
  };

  pointFilesInput.addEventListener('change', () => {
    const { files } = pointFilesInput;
    pointFilesTotal.innerHTML = files.length.toString();

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = handlePointFileRead(files[i].name);
      const file = files.item(i);
      reader.readAsText(file);
    }
  });

  const handleLabelFileRead = (fileName: string) => (progressEvent) => {
    const text = progressEvent.target.result;
    if (typeof text !== 'string') return;
    const data = JSON.parse(text);
    
    const frameIndex = Number(fileName.match(/\d+/));
    const numBoundingBoxes = data.length;
    const offsets = [];
    const dimensions = [];
    const headings = [];

    data.forEach((label) => {
      offsets.push(label.box.center_x, label.box.center_y, label.box.center_z);
      dimensions.push(label.box.width, label.box.length, label.box.height);
      headings.push(label.box.heading);
    });

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.maxInstancedCount = numBoundingBoxes;
    geometry.setIndex(cubeIndices);
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cubeVertices), 3));
    geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
    geometry.setAttribute('dimension', new THREE.InstancedBufferAttribute(new Float32Array(dimensions), 3));
    geometry.setAttribute('heading', new THREE.InstancedBufferAttribute(new Float32Array(headings), 1));
    
    const mesh = new THREE.Mesh(geometry, boundingBoxMaterial);
    mesh.scale.x = 0.2;
    mesh.scale.y = 0.2;
    mesh.scale.z = 0.2;

    frameLabelMeshes[frameIndex] = mesh;

    if (frameIndex === 0) {
      scene.add(mesh);
    }
    
    labelFilesLoaded.innerHTML = (Number(labelFilesLoaded.innerHTML) + 1).toString();
    console.log(`Loaded labels for frame ${frameIndex}.`);
  };

  labelFilesInput.addEventListener('change', () => {
    const { files } = labelFilesInput;
    labelFilesTotal.innerHTML = files.length.toString();

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = handleLabelFileRead(files[i].name);
      const file = files.item(i);
      reader.readAsText(file);
    }
  });

  frameSelector.addEventListener('change', () => {
    const activeFrame = Number(frameSelector.value);

    if (activeFrame > framePointMeshes.length - 1) {
      frameSelector.value = (framePointMeshes.length - 1).toString();
      return;
    }

    scene.children.forEach((child) => {
      scene.remove(child);
    });

    if (framePointMeshes[activeFrame])
      scene.add(framePointMeshes[activeFrame]);

    if (frameLabelMeshes[activeFrame])
      scene.add(frameLabelMeshes[activeFrame]);
  });

  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

main();