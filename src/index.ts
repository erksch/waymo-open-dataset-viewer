import * as THREE from 'three';
import io from 'socket.io-client';
import axios from 'axios';
const OrbitControls = require('three-orbitcontrols');
import { indices as pointIndices, vertices as pointVertices } from './geometry/pointGeometry';
import { indices as cubeIndices, vertices as cubeVertices } from './geometry/cubeGeometry';
import vertShaderPoint from './shader/vertShaderPoint';
import fragShaderPoint from './shader/fragShaderPoint';
import vertShaderBoundingBox from './shader/vertShaderBoundingBox';
import fragShaderBoundingBox from './shader/fragShaderBoundingBox';

function main() {
  const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000 );
  camera.position.set(0, 1, -3)
  camera.lookAt(new THREE.Vector3());
  const renderer = new THREE.WebGLRenderer({ alpha: true, canvas });

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
  const labelModeInputs = document.getElementsByName('label-mode');
  let labelMode = 'ground_truth';

  labelModeInputs.forEach((el: HTMLInputElement) => el.addEventListener<'change'>('change', (e: any) => {
    labelMode = e.target.value;
  }));

  const framePointMeshes: THREE.Mesh[] = [];
  const frameLabelMeshes: THREE.Mesh[] = [];

  const pointMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      labelMode: { value: 1.0 }
    },
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

  /*
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
  */
  /*
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
  */

  let activeFrame = Number(frameSelector.value);

  frameSelector.addEventListener('change', () => {
    activeFrame = Number(frameSelector.value);

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

  const runPredictionButton = document.querySelector<HTMLButtonElement>('#run-prediction');

  runPredictionButton.addEventListener('click', async () => {
    const loading = document.querySelector<HTMLSpanElement>('#loading-prediction');
    loading.style.display = "block";
    runPredictionButton.style.display = "none";
    const { data: labels } = await axios.post('http://localhost:8080/predict', {
      filepath: "/home/erik/Projects/notebooks/pointclouds/segment-15578655130939579324_620_000_640_000/point_clouds2/frame_000_170081.csv",
    });
    loading.style.display = "none";
    runPredictionButton.style.display = "block";

    console.log(labels.length);

    (framePointMeshes[0] as any).geometry.setAttribute('predictedType', new THREE.InstancedBufferAttribute(new Float32Array(labels), 1));
    (framePointMeshes[0] as any).geometry.attributes.predictedType.needsUpdate = true;
  });

  console.log('Receiving frame');

  let index = 0;
  const websocket = new WebSocket('ws://localhost:9000');
  websocket.binaryType = 'arraybuffer';
  websocket.onopen = () => {
    console.log('Websocket open');
    websocket.send('transmit_0');
  };
  websocket.onclose = () => {
    console.log('Websocket closed');
  };
  websocket.onerror = () => {
    console.log('Websocket error');
  };
  websocket.onmessage = (event) => {
    index++;
    if (index < 199) {
      websocket.send('transmit_' + index);
    }
    const data = new Float32Array(event.data); 
  
    const offsets = [];
    const intensities = [];
    const labels = [];
    const predictedTypes = [];

    data.forEach((x, index) => {
      if ([0, 1, 2].includes(index % 5)) offsets.push(x);
      else if (index % 5 === 3) intensities.push(x);
      else if (index % 5 === 4) labels.push(x);
      if (index % 5 === 0) predictedTypes.push(-1);
    });

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.maxInstancedCount = intensities.length;
    geometry.setIndex(pointIndices);
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pointVertices), 3));
    geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3 ));
    geometry.setAttribute('type', new THREE.InstancedBufferAttribute(new Float32Array(labels), 1));
    geometry.setAttribute('predictedType', new THREE.InstancedBufferAttribute(new Float32Array(predictedTypes), 1));
    
    const mesh = new THREE.Mesh(geometry, pointMaterial);
    mesh.scale.x = 0.2;
    mesh.scale.y = 0.2;
    mesh.scale.z = 0.2;

    framePointMeshes[index - 1] = mesh;

    if (index - 1 === 0) {
      scene.add(framePointMeshes[0]);
    }
    pointFilesLoaded.innerHTML = (Number(pointFilesLoaded.innerHTML) + 1).toString();
  };

  
  function render() {
    framePointMeshes.forEach((mesh: any) => {
      mesh.material.uniforms.labelMode.value = labelMode === 'ground_truth' ? 1.0 : 0.0;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

main();