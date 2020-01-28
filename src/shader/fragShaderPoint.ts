export default `
  precision highp float;
  
  uniform float laserTop;
  uniform float laserFront;
  uniform float laserRear;
  uniform float laserSideLeft;
  uniform float laserSideRight;

  varying float vLaser;
  varying vec3 vColor;
  varying vec3 vPosition;
  varying vec4 vWorldPosition;

  void main() {
    if (vLaser == 0.0 && laserTop == 0.0) discard;
    if (vLaser == 1.0 && laserFront == 0.0) discard;
    if (vLaser == 2.0 && laserSideLeft == 0.0) discard;
    if (vLaser == 3.0 && laserSideRight == 0.0) discard;
    if (vLaser == 4.0 && laserRear == 0.0) discard;
    
    float R = 0.5;
    float dist = sqrt(dot(vPosition.xy, vPosition.xy));
    if (dist >= R) {
      discard;
    }

    gl_FragColor = vec4(vColor, 1.0);
  }
`;
