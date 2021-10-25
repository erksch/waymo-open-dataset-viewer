import * as THREE from "three";
const OrbitControls = require("three-orbitcontrols");

function setupRenderer() {
  const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, -3);
  camera.lookAt(new THREE.Vector3());
  const renderer = new THREE.WebGLRenderer({ alpha: true, canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  camera.position.z = 5;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  const clearScene = () => {
    while (scene.children.length) {
      scene.remove(scene.children[0]);
    }
  };

  return { renderer, scene, camera, clearScene };
}

export default setupRenderer;
