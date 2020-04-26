import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import _ from 'lodash';
import vertShaderBoundingBox from '../shader/vertShaderBoundingBox';
import fragShaderBoundingBox from '../shader/fragShaderBoundingBox';
import { LabelMode, ColorMode } from '../constants';
import { indices, vertices } from '../geometry/cubeGeometry';
import { useConfig, useActiveSegment } from '../state/configReducer';

const material = new THREE.RawShaderMaterial({
  uniforms: {
    labelMode: { value: LabelMode.GROUND_TRUTH },
    colorMode: { value: ColorMode.LABEL },
    laserTop: { value: 1.0 },
    laserFront: { value: 1.0 },
    laserSideLeft: { value: 1.0 },
    laserSideRight: { value: 1.0 },
    laserRear: { value: 1.0 },
  },
  vertexShader: vertShaderBoundingBox,
  fragmentShader: fragShaderBoundingBox,
  side: THREE.DoubleSide,
  transparent: true,
});

const BoundingBoxes: React.FC<{}> = () => {
  const activeSegment = useActiveSegment();
  const config = useConfig();
  const [geometry, setGeometry] = useState<THREE.InstancedBufferGeometry | null>(null);
  const activeFrame = activeSegment && activeSegment.frames[config.activeFrame];

  useEffect(() => {
    if (activeFrame && activeFrame.boundingBoxes) {
      const { boundingBoxes } = activeFrame;
      let { offsets, dimensions, headings } = boundingBoxes;
      let isGroundTruth = _.times(headings.length, _.constant(1));

      if (activeFrame.predictedBoundingBoxes) {
        const { predictedBoundingBoxes } = activeFrame;
        offsets = [...offsets, ...predictedBoundingBoxes.offsets];
        dimensions = [...dimensions, ...predictedBoundingBoxes.dimensions];
        headings = [...headings, ...predictedBoundingBoxes.headings];
        isGroundTruth = [...isGroundTruth, ..._.times(predictedBoundingBoxes.headings.length, _.constant(0))]
      }

      const instancedGeometry = new THREE.InstancedBufferGeometry();
      instancedGeometry.maxInstancedCount = headings.length;
      instancedGeometry.setIndex(indices);
      instancedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      instancedGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
      instancedGeometry.setAttribute('dimension', new THREE.InstancedBufferAttribute(new Float32Array(dimensions), 3));
      instancedGeometry.setAttribute('heading', new THREE.InstancedBufferAttribute(new Float32Array(headings), 1));
      instancedGeometry.setAttribute('isGroundTruth', new THREE.InstancedBufferAttribute(new Float32Array(isGroundTruth), 1));
      
      setGeometry(instancedGeometry);
    }
  }, [activeFrame]);

  if (!geometry || !activeFrame || !activeFrame.boundingBoxes) return null;

  return (
    <mesh
      visible
      position={[0.0, 0.0, 0.0]}
      geometry={geometry}
      material={material}
      scale={[0.2, 0.2, 0.2]}
    />
  )
};

export default BoundingBoxes;
