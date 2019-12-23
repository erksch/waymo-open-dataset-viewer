import * as THREE from 'three';
import { indices, vertices } from './geometry/cubeGeometry';
import vertShaderBoundingBox from './shader/vertShaderBoundingBox';
import fragShaderBoundingBox from './shader/fragShaderBoundingBox';

class BoundingBoxMesh {
  private material: THREE.RawShaderMaterial;
  private geometry: THREE.InstancedBufferGeometry;
  private mesh: THREE.Mesh;

  constructor(
    instances: number,
    offsets: number[],
    dimensions: number[],
    headings: number[],
  ) { 
    this.material = new THREE.RawShaderMaterial({
      vertexShader: vertShaderBoundingBox,
      fragmentShader: fragShaderBoundingBox,
      side: THREE.DoubleSide,
      transparent: true,
    });

    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.maxInstancedCount = instances;
    this.geometry.setIndex(indices);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    this.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
    this.geometry.setAttribute('dimension', new THREE.InstancedBufferAttribute(new Float32Array(dimensions), 3));
    this.geometry.setAttribute('heading', new THREE.InstancedBufferAttribute(new Float32Array(headings), 1));
        
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  getMesh() {
    return this.mesh;
  }
};

export default BoundingBoxMesh;