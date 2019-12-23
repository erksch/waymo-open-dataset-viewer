export default `
  precision highp float;
  
  varying vec3 vColor;
  varying vec3 vPosition;

  void main() {
    float R = 0.5;
    float dist = sqrt(dot(vPosition.xy, vPosition.xy));
    if (dist >= R) {
      discard;
    }

    gl_FragColor = vec4(vColor, 1.0);
  }
`;