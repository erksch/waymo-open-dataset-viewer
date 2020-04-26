export default `
  precision highp float;
  
  varying vec3 vPosition;
  varying float vIsGroundTruth;

  void main() {
    float e = 0.05;

    if (
      (
        vPosition.x < (1.0 - e) && vPosition.x > (-1.0 + e)
        && vPosition.z < (1.0 - e) && vPosition.z > (-1.0 + e)
      )
      || 
      (
        vPosition.y < (1.0 - e) && vPosition.y > (-1.0 + e)
        && vPosition.z < (1.0 - e) && vPosition.z > (-1.0 + e)
      )
      || 
      (
        vPosition.y < (1.0 - e) && vPosition.y > (-1.0 + e)
        && vPosition.x < (1.0 - e) && vPosition.x > (-1.0 + e)
      )
    ) {
      discard;
    }

    vec3 color; 
    
    if (vIsGroundTruth == 1.0) {
      color = vec3(0.0, 1.0, 0.0);
    } else {
      color = vec3(1.0, 0.0, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
