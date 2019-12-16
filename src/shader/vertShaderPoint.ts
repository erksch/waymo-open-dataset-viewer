export default `
  precision mediump float;

  attribute vec3 position;
  attribute vec3 offset;
  attribute float type;
  attribute float predictedType;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float labelMode;

  varying float vType;

  void main() {
    float scale = 0.05;

    mat4 translationMatrix;
    translationMatrix[0] = vec4(1.0, 0.0, 0.0, 0.0);
    translationMatrix[1] = vec4(0.0, 1.0, 0.0, 0.0);
    translationMatrix[2] = vec4(0.0, 0.0, 1.0, 0.0);
    translationMatrix[3] = vec4(offset.x, offset.y, offset.z, 1.0);

    mat4 scaleMatrix;
    scaleMatrix[0] = vec4(scale, 0.0, 0.0, 0.0);
    scaleMatrix[1] = vec4(0.0, scale, 0.0, 0.0);
    scaleMatrix[2] = vec4(0.0, 0.0, scale, 0.0);
    scaleMatrix[3] = vec4(0.0, 0.0, 0.0, 1.0);

    mat4 viewMatrix = translationMatrix * scaleMatrix;

    if (labelMode == 1.0) {
      vType = type;
    } else {
      vType = predictedType;
    }

    gl_Position = projectionMatrix * modelViewMatrix * viewMatrix * vec4(position, 1.0);
  }
`;
