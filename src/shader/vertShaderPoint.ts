export default `
  precision mediump float;

  attribute vec3 position;
  attribute vec3 offset;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  void main() {
    float scale = 0.05;

    mat4 translationMatrix;
    translationMatrix[0] = vec4(scale, 0.0, 0.0, 0.0);
    translationMatrix[1] = vec4(0.0, scale, 0.0, 0.0);
    translationMatrix[2] = vec4(0.0, 0.0, scale, 0.0);
    translationMatrix[3] = vec4(offset.x, offset.y, offset.z, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * translationMatrix * vec4(position, 1.0);
  }
`;
