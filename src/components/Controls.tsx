import React, { useRef } from 'react';
import { useThree, useFrame } from 'react-three-fiber';

const Controls: React.FC = () => {
  const controls = useRef<any>();
  const { gl, camera } = useThree();
  useFrame(() => (controls.current ? controls.current.update() : null));
  
  if (!camera) return null;
  
  return (
    <orbitControls
      ref={controls}
      args={[camera, gl.domElement]}
    />
  );
};

export default Controls;
