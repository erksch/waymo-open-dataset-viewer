export default `
  precision mediump float;

  attribute vec3 position;
  attribute vec3 offset;
  attribute float type;
  attribute float predictedType;

  uniform mat4 viewMatrix;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float labelMode;

  varying float vType;
  varying vec3 vPosition;
  varying float vZ;

  void main() {
    float scale = 0.08;

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

    // mat4 viewMatrix = translationMatrix * scaleMatrix;

    if (labelMode == 1.0) {
      vType = type;
    } else {
      vType = predictedType;
    }

    vPosition = position;
    vZ = offset.z;


    vec3 cameraRight = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
    vec3 cameraUp = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);
    vec3 pos = (cameraRight * position.x * scale) + (cameraUp * position.y * scale);
  
    gl_Position = projectionMatrix * modelViewMatrix * translationMatrix * vec4(pos, 1.0);
  }
`;
