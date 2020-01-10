import * as THREE from 'three';
import { indices, vertices } from '../geometry/pointGeometry';
import vertShaderPoint from '../shader/vertShaderPoint';
import fragShaderPoint from '../shader/fragShaderPoint';
import { labelModes, colorModes } from '../constants';

const material = new THREE.RawShaderMaterial({
  uniforms: {
    labelMode: { value: labelModes.GROUND_TRUTH },
    colorMode: { value: colorModes.LABEL },
    laserTop: { value: 1.0 },
    laserFront: { value: 1.0 },
    laserSideLeft: { value: 1.0 },
    laserSideRight: { value: 1.0 },
    laserRear: { value: 1.0 },
  },
  vertexShader: vertShaderPoint,
  fragmentShader: fragShaderPoint,
  side: THREE.DoubleSide,
  transparent: true,
});

class PointMesh {
  private geometry: THREE.InstancedBufferGeometry;
  private mesh: THREE.Mesh;

  constructor(
    instances: number,
    offsets: number[],
    intensities: number[],
    lasers: number[],
    labels: number[],
    predictedTypes: number[],
  ) {
    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.maxInstancedCount = instances;
    this.geometry.setIndex(indices);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    this.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
    this.geometry.setAttribute('intensity', new THREE.InstancedBufferAttribute(new Float32Array(intensities), 1));
    this.geometry.setAttribute('laser', new THREE.InstancedBufferAttribute(new Float32Array(lasers), 1));
    this.geometry.setAttribute('type', new THREE.InstancedBufferAttribute(new Float32Array(labels), 1));
    this.geometry.setAttribute('predictedType', new THREE.InstancedBufferAttribute(new Float32Array(predictedTypes), 1));
    
    this.mesh = new THREE.Mesh(this.geometry, material);
  }

  getMesh() {
    return this.mesh;
  }
};

export default PointMesh;