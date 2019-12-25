import * as THREE from 'three';
import axios from 'axios';
import { fromEvent } from 'rxjs';
const OrbitControls = require('three-orbitcontrols');
import { labelModes, colorModes } from './constants';
import DataSocket, { Segment } from './websocket/websocket';

function main() {
  const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 1, -3);
  camera.lookAt(new THREE.Vector3());
  const renderer = new THREE.WebGLRenderer({ alpha: true, canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  
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

  const activeFrameDisplay = document.querySelector<HTMLSpanElement>('#active-frame');
  const framesLoadedDisplay = document.querySelector<HTMLSpanElement>('#frames-loaded');

  const labelModeInputs = document.getElementsByName('label-mode');
  let labelMode = labelModes.GROUND_TRUTH;

  labelModeInputs.forEach((el: HTMLInputElement) => el.addEventListener<'change'>('change', (e: any) => {
    labelMode = labelModes[e.target.value];
  }));

  let colorMode = colorModes.LABEL;
  const colorModeInputs = document.getElementsByName('color-mode');
  colorModeInputs.forEach((el: HTMLInputElement) => el.addEventListener<'change'>('change', (e: any) => {
    colorMode = colorModes[e.target.value];
  }));

  let laserSwitches = {
    TOP: 1.0,
    FRONT: 1.0,
    SIDE_LEFT: 1.0,
    SIDE_RIGHT: 1.0,
    REAR: 1.0,
  };
  const laserInputs = document.getElementsByName('lasers');
  laserInputs.forEach((el: HTMLInputElement) => el.addEventListener<'change'>('change', (e: any) => {
    laserSwitches[el.value] = e.target.checked ? 1.0 : 0.0;
  }));

  let framePointMeshes: THREE.Mesh[] = [];
  let frameBoundingBoxMeshes: THREE.Mesh[] = [];

  document.querySelector('#segment-id-button').addEventListener('click', () => {
    const dropdown = document.querySelector<HTMLDivElement>('#segment-id-dropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
  });

  let activeFrame = Number(frameSelector.value);

  const clearScene = () => {
    while (scene.children.length) {
      scene.remove(scene.children[0]);
    }
  };

  const setActiveFrame = (nextActiveFrame: number) => {
    if (nextActiveFrame > framePointMeshes.length - 1) {
      frameSelector.value = (framePointMeshes.length - 1).toString();
      return;
    }
    activeFrame = nextActiveFrame;
    activeFrameDisplay.innerHTML = activeFrame.toString();

    clearScene();

    if (framePointMeshes[activeFrame])
      scene.add(framePointMeshes[activeFrame]);

    if (frameBoundingBoxMeshes[activeFrame])
      scene.add(frameBoundingBoxMeshes[activeFrame]);
  };

  frameSelector.addEventListener('input', () => {
    setActiveFrame(Number(frameSelector.value));
  });

  /*
  const playButton = document.querySelector<HTMLButtonElement>('#play-button');

  playButton.addEventListener('click', () => {
    setInterval(() => {
      setActiveFrame(activeFrame + 1);
    }, 100);
  });
  */

  const runPredictionButton = document.querySelector<HTMLButtonElement>('#run-prediction');

  runPredictionButton.addEventListener('click', async () => {
    const loading = document.querySelector<HTMLSpanElement>('#loading-prediction');
    loading.style.display = "block";
    runPredictionButton.style.display = "none";
    const { data: labels } = await axios.post('http://localhost:8080/predict', {
      filepath: "/home/erik/Projects/notebooks/pointclouds/segment-15578655130939579324_620_000_640_000/point_clouds3/frame_000_170081.csv",
    });
    loading.style.display = "none";
    runPredictionButton.style.display = "block";

    (framePointMeshes[0] as any).geometry.setAttribute('predictedType', new THREE.InstancedBufferAttribute(new Float32Array(labels), 1));
    (framePointMeshes[0] as any).geometry.attributes.predictedType.needsUpdate = true;
  });

  const handleFrameBoundingBoxesReceived = (index: number, mesh: THREE.Mesh) => {
    frameBoundingBoxMeshes[index] = mesh;

    if (index === 0) {
      scene.add(frameBoundingBoxMeshes[index]);
    }
  }

  const handleFramePointCloudReceived = (index: number, mesh: THREE.Mesh) => {
    framePointMeshes[index] = mesh;

    if (index === 0) {
      scene.add(framePointMeshes[index]);
    }

    const numFrames = framePointMeshes.filter(value => !!value).length;
    framesLoadedDisplay.innerHTML = numFrames.toString();
  };

  const handleSegmentChange = ([segmentId, numFrames]: Segment) => {
    clearScene();
    activeFrame = 0;
    activeFrameDisplay.innerHTML = "0";
    framePointMeshes = [];
    frameBoundingBoxMeshes = [];
    framesLoadedDisplay.innerHTML = "0";
    document.querySelector('#frames-total').innerHTML = numFrames.toString();
    document.querySelector<HTMLInputElement>('#segment-id-input').value = segmentId;
    frameSelector.max = numFrames.toString();
  };

  const handleSegmentsReceived = (segments: Segment[], dataSocket: DataSocket) => {
    const sortedSegments = segments.sort((a, b) => a[0].localeCompare(b[0]));
    const dropdown = document.querySelector("#segment-id-dropdown");
    dataSocket.changeSegment(sortedSegments[0]);
    
    sortedSegments.forEach(([id, numFrames]) => {
      const el = document.createElement("button");
      el.innerHTML = id;
      el.addEventListener('click', () => {
        dataSocket.changeSegment([id, numFrames]);
      });
      dropdown.appendChild(el);
    });
  };

  const socket = new DataSocket(
    handleFramePointCloudReceived, 
    handleFrameBoundingBoxesReceived,
    handleSegmentChange, 
    handleSegmentsReceived,
  );
  socket.start();

  function render() {
    framePointMeshes.forEach((mesh: any) => {
      mesh.material.uniforms.labelMode.value = labelMode;
      mesh.material.uniforms.colorMode.value = colorMode;
      mesh.material.uniforms.laserTop.value = laserSwitches.TOP;
      mesh.material.uniforms.laserFront.value = laserSwitches.FRONT;
      mesh.material.uniforms.laserSideLeft.value = laserSwitches.SIDE_LEFT;
      mesh.material.uniforms.laserSideRight.value = laserSwitches.SIDE_RIGHT;
      mesh.material.uniforms.laserRear.value = laserSwitches.REAR;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

main();
