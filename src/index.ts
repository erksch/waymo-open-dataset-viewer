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

  const pointsFileInput = document.querySelector<HTMLInputElement>('#pointsFileInput');

  pointsFileInput.addEventListener('change', () => {
    const file = pointsFileInput.files[0];
    const reader = new FileReader();

    reader.onload = (progressEvent) => {
      const text = progressEvent.target.result;
      if (typeof text !== 'string') return;

      const lines = text.split(/\r\n|\n/);
      const numPoints = Number(lines[0]);
      const points = [];
      
      lines.slice(2).forEach((line) => {
        if (line === '') return;
        const [x, y, z] = line.split(' ').slice(1).map(i => Number(i));
        points.push(x, y, z);
      });

      const geometry = new THREE.InstancedBufferGeometry();
      geometry.maxInstancedCount = numPoints;
      geometry.setIndex(pointIndices);
			geometry.setAttribute( 'position', new THREE.BufferAttribute(new Float32Array(pointVertices), 3));
      geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(points), 3 ));
      
      const material = new THREE.RawShaderMaterial({
        vertexShader: vertShaderPoint,
        fragmentShader: fragShaderPoint,
        side: THREE.DoubleSide,
				transparent: true,
      });
    
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.x = 0.2;
      mesh.scale.y = 0.2;
      mesh.scale.z = 0.2;

      scene.add(mesh);
    };

    reader.readAsText(file);
  });

  const labelsFileInput = document.querySelector<HTMLInputElement>('#labelsFileInput');

  labelsFileInput.addEventListener('change', () => {
    const file = labelsFileInput.files[0];
    const reader = new FileReader();

    reader.onload = (progressEvent) => {
      const text = progressEvent.target.result;
      if (typeof text !== 'string') return;
      const data = JSON.parse(text);
      
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
      
      const material = new THREE.RawShaderMaterial({
        vertexShader: vertShaderBoundingBox,
        fragmentShader: fragShaderBoundingBox,
        side: THREE.DoubleSide,
				transparent: true,
      });
    
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.x = 0.2;
      mesh.scale.y = 0.2;
      mesh.scale.z = 0.2;

      scene.add(mesh);
    };

    reader.readAsText(file);
  });

  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

main();