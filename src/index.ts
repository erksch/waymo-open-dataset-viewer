import * as THREE from 'three';
import { labelModes, colorModes } from './constants';
import DataSocket, { SegmentMetadata } from './websocket/websocket';
import setupRenderer from './setupRenderer';
import runPrediction from './prediction/runPrediction';
import { BufferGeometry, BufferAttribute, Mesh, RawShaderMaterial } from 'three';

function main() {
  const { renderer, scene, camera, clearScene } = setupRenderer();

  const frameSelector = document.querySelector<HTMLInputElement>('#active-frame-input');
  const activeFrameDisplay = document.querySelector<HTMLSpanElement>('#active-frame');
  const framesLoadedDisplay = document.querySelector<HTMLSpanElement>('#frames-loaded');
  const framesTotalDisplay = document.querySelector<HTMLSpanElement>('#frames-total');
  const loadingIndicator = document.querySelector<HTMLSpanElement>('#loading');

  const segmentInput = document.querySelector<HTMLButtonElement>('#segment-id-input');
  const segmentButton = document.querySelector<HTMLButtonElement>('#segment-id-button');
  const segmentDropdown = document.querySelector<HTMLDivElement>('#segment-id-dropdown');

  const runPredictionButton = document.querySelector<HTMLButtonElement>('#run-prediction');
  const loadingPrediction = document.querySelector<HTMLSpanElement>('#loading-prediction');
  
  const labelModeInputs = document.getElementsByName('label-mode');
  const colorModeInputs = document.getElementsByName('color-mode');
  const laserInputs = document.getElementsByName('lasers');
  
  let framePointMeshes: THREE.Mesh[] = [];
  let frameBoundingBoxMeshes: THREE.Mesh[] = [];

  // configuration
  let activeFrame = Number(frameSelector.value);
  let labelMode = labelModes.GROUND_TRUTH;
  let colorMode = colorModes.LABEL;
  let laserSwitches = {
    TOP: 1.0,
    FRONT: 1.0,
    SIDE_LEFT: 1.0,
    SIDE_RIGHT: 1.0,
    REAR: 1.0,
  };

  const setActiveFrame = (nextActiveFrame: number) => {
    if (nextActiveFrame > framePointMeshes.length - 1) {
      frameSelector.value = (framePointMeshes.length - 1).toString();
      return;
    }
    activeFrame = nextActiveFrame;
    activeFrameDisplay.innerHTML = (activeFrame + 1).toString();

    clearScene();

    if (framePointMeshes[activeFrame])
      scene.add(framePointMeshes[activeFrame]);

    if (frameBoundingBoxMeshes[activeFrame])
      scene.add(frameBoundingBoxMeshes[activeFrame]);
  };

  labelModeInputs.forEach((el: HTMLInputElement) => el.addEventListener<'change'>('change', (e: any) => {
    labelMode = labelModes[e.target.value];
  }));

  colorModeInputs.forEach((el: HTMLInputElement) => el.addEventListener<'change'>('change', (e: any) => {
    colorMode = colorModes[e.target.value];
  }));

  laserInputs.forEach((el: HTMLInputElement) => el.addEventListener<'change'>('change', (e: any) => {
    laserSwitches[el.value] = e.target.checked ? 1.0 : 0.0;
  }));

  segmentButton.addEventListener('click', () => {
    segmentDropdown.style.display = segmentDropdown.style.display === 'flex' ? 'none' : 'flex';
  });

  frameSelector.addEventListener('input', () => {
    setActiveFrame(Number(frameSelector.value));
  });
  
  runPredictionButton.addEventListener('click', async () => {
    loadingPrediction.style.display = "block";
    runPredictionButton.style.display = "none";
    const { frameIndex, labels } = await runPrediction();
    loadingPrediction.style.display = "none";
    runPredictionButton.style.display = "block";

    (framePointMeshes[frameIndex].geometry as BufferGeometry).setAttribute('predictedType', new THREE.InstancedBufferAttribute(new Float32Array(labels), 1));
    ((framePointMeshes[frameIndex].geometry as BufferGeometry).attributes.predictedType as BufferAttribute).needsUpdate = true;
  });

  const handleFrameBoundingBoxesReceived = (index: number, mesh: THREE.Mesh) => {
    frameBoundingBoxMeshes[index] = mesh;

    if (index === 0) {
      scene.add(frameBoundingBoxMeshes[index]);
    }
  }

  const handleFramePointCloudReceived = (index: number, mesh: THREE.Mesh) => {
    loadingIndicator.style.display = 'none';
    framePointMeshes[index] = mesh;

    if (index === 0) {
      scene.add(framePointMeshes[index]);
      activeFrameDisplay.innerHTML = "1";
    }

    const numFrames = framePointMeshes.filter(value => !!value).length;
    framesLoadedDisplay.innerHTML = numFrames.toString();
  };

  const handleSegmentChange = (segmentId: string) => {
    clearScene();
    activeFrame = 0;
    activeFrameDisplay.innerHTML = "0";
    framePointMeshes = [];
    frameBoundingBoxMeshes = [];
    framesLoadedDisplay.innerHTML = "0";
    segmentInput.value = segmentId;
  };

  const handleSegmentMetadataReceived = (metadata: SegmentMetadata) => {
    framesTotalDisplay.innerHTML = metadata.size.toString();
    frameSelector.max = metadata.size.toString();
  }

  const handleSegmentsReceived = (segments: string[], dataSocket: DataSocket) => {
    const sortedSegments = segments.sort();
    dataSocket.changeSegment(sortedSegments[0]);
    
    sortedSegments.forEach((segmentId) => {
      const el = document.createElement("button");
      el.innerHTML = segmentId;
      el.addEventListener('click', () => {
        dataSocket.changeSegment(segmentId);
      });
      segmentDropdown.appendChild(el);
    });
  };

  const socket = new DataSocket(
    handleFramePointCloudReceived, 
    handleFrameBoundingBoxesReceived,
    handleSegmentChange, 
    handleSegmentsReceived,
    handleSegmentMetadataReceived,
  );
  socket.start();

  function render() {
    framePointMeshes.forEach((mesh: Mesh) => {
      if (!(mesh.material instanceof RawShaderMaterial)) {
        return;
      }

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
