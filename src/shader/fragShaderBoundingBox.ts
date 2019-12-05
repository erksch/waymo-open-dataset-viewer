export default `
  precision highp float;
  
  varying vec3 vPosition;

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

    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  }
`;