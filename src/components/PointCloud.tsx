import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import vertShaderPoint from '../shader/vertShaderPoint';
import fragShaderPoint from '../shader/fragShaderPoint';
import { LabelMode, ColorMode } from '../constants';
import { indices, vertices } from '../geometry/pointGeometry';
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
  vertexShader: vertShaderPoint,
  fragmentShader: fragShaderPoint,
  side: THREE.DoubleSide,
  transparent: true,
});

const PointCloud: React.FC<{}> = () => {
  const activeSegment = useActiveSegment();
  const config = useConfig();
  const [geometry, setGeometry] = useState<THREE.InstancedBufferGeometry | null>(null);
  const activeFrame = activeSegment && activeSegment.frames[config.activeFrame];

  useEffect(() => {
    if (activeFrame && activeFrame.points) {
      const { points } = activeFrame;
      const { offsets, intensities, lasers, labels, predictedLabels } = points;

      const instancedGeometry = new THREE.InstancedBufferGeometry();
      instancedGeometry.maxInstancedCount = intensities.length;
      instancedGeometry.setIndex(indices);
      instancedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      instancedGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
      instancedGeometry.setAttribute('intensity', new THREE.InstancedBufferAttribute(new Float32Array(intensities), 1));
      instancedGeometry.setAttribute('laser', new THREE.InstancedBufferAttribute(new Float32Array(lasers), 1));
      instancedGeometry.setAttribute('type', new THREE.InstancedBufferAttribute(new Float32Array(labels), 1));
      instancedGeometry.setAttribute('predictedLabel', new THREE.InstancedBufferAttribute(new Float32Array(predictedLabels), 1));
      setGeometry(instancedGeometry);
    }
  }, [activeFrame]);

  if (!geometry || !activeFrame || !activeFrame.points) return null;

  return (
    <mesh
      visible
      position={[0.0, 0.0, 0.0]}
      geometry={geometry}
      material={material}
      material-uniforms-labelMode-value={config.labelMode}
      material-uniforms-colorMode-value={config.colorMode}
      material-uniforms-laserTop-value={config.lasers.TOP ? 1.0 : 0.0}
      material-uniforms-laserFront-value={config.lasers.FRONT ? 1.0 : 0.0}
      material-uniforms-laserSideLeft-value={config.lasers.SIDE_LEFT ? 1.0 : 0.0}
      material-uniforms-laserSideRight-value={config.lasers.SIDE_RIGHT ? 1.0 : 0.0}
      material-uniforms-laserRear-value={config.lasers.REAR ? 1.0 : 0.0}
      scale={[0.2, 0.2, 0.2]}
    />
  )
};

export default PointCloud;
