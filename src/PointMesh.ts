import * as THREE from 'three';
import { indices, vertices } from './geometry/pointGeometry';
import vertShaderPoint from './shader/vertShaderPoint';
import fragShaderPoint from './shader/fragShaderPoint';

class PointMesh {
  private material: THREE.RawShaderMaterial;
  private geometry: THREE.InstancedBufferGeometry;
  private mesh: THREE.Mesh;

  constructor(
    instances: number,
    offsets: number[],
    intensities: number[],
    labels: number[],
    predictedTypes: number[],
    labelMode: number, 
    colorMode: number,
  ) {
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        labelMode: { value: labelMode },
        colorMode: { value: colorMode },
      },
      vertexShader: vertShaderPoint,
      fragmentShader: fragShaderPoint,
      side: THREE.DoubleSide,
      transparent: true,
    });

    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.maxInstancedCount = instances;
    this.geometry.setIndex(indices);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    this.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
    this.geometry.setAttribute('intensity', new THREE.InstancedBufferAttribute(new Float32Array(intensities), 1));
    this.geometry.setAttribute('type', new THREE.InstancedBufferAttribute(new Float32Array(labels), 1));
    this.geometry.setAttribute('predictedType', new THREE.InstancedBufferAttribute(new Float32Array(predictedTypes), 1));
    
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() {
    return this.mesh;
  }
};

export default PointMesh;