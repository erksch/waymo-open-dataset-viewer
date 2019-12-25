export default `
  #define PI 3.1415926538
  precision mediump float;

  attribute vec3 position;
  attribute vec3 offset;
  attribute vec3 dimension;
  attribute float heading;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  varying vec3 vPosition;

  void main() {
    float theta = PI / 2.0 - heading;

    mat4 rotationMatrix;
    rotationMatrix[0] = vec4(cos(theta), -sin(theta), 0.0, 0.0);
    rotationMatrix[1] = vec4(sin(theta), cos(theta), 0.0, 0.0);
    rotationMatrix[2] = vec4(0.0, 0.0, 1.0, 0.0);
    rotationMatrix[3] = vec4(offset.x, offset.y, offset.z, 1.0);

    mat4 scaleMatrix;
    scaleMatrix[0] = vec4(dimension.x, 0.0, 0.0, 0.0);
    scaleMatrix[1] = vec4(0.0, dimension.z, 0.0, 0.0);
    scaleMatrix[2] = vec4(0.0, 0.0, dimension.y, 0.0);
    scaleMatrix[3] = vec4(0.0, 0.0, 0.0, 1.0);

    mat4 modelMatrix = rotationMatrix * scaleMatrix;

    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * modelMatrix * vec4(position / 2.0, 1.0);
  }
`;
