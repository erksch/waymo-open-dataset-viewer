export default `
  precision mediump float;

  attribute vec3 position;
  attribute vec3 offset;
  attribute float type;
  attribute float predictedLabel;
  attribute float intensity;
  attribute float laser;

  uniform mat4 viewMatrix;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  uniform float labelMode;
  uniform float colorMode;

  varying vec3 vColor;
  varying vec3 vPosition;
  varying float vLaser;
  varying vec4 vWorldPosition;

  vec3 getColorForLabel(float label) {
    vec3 labelColor;
    vec3 notLabeledColor = vec3(0.2, 0.2, 0.2);

    if (label == 0.0) {
      labelColor = vec3(1.0, 1.0, 1.0);
    } else if (label == 1.0) {
      labelColor = vec3(1.0, 0.0, 0.0);
    } else if (label == 2.0) {
      labelColor = vec3(1.0, 1.0, 0.0);
    } else if (label == 3.0) {
      labelColor = vec3(0.0, 1.0, 0.0);
    } else if (label == 4.0) {
      labelColor = vec3(0.0, 0.0, 1.0);
    } else {
      labelColor = notLabeledColor;
    }

    return labelColor;
  }

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
    
    if (colorMode == 0.0) {
      float label;

      if (labelMode == 1.0) {
        label = type;
      } else {
        label = predictedLabel;
      }

      vColor = getColorForLabel(label);
    } else if (colorMode == 1.0) {
      vColor = vec3(intensity, intensity, intensity);
    }

    vPosition = position;
    vLaser = laser;


    vec3 cameraRight = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
    vec3 cameraUp = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);
    vec3 pos = (cameraRight * position.x * scale) + (cameraUp * position.y * scale);
  
    vWorldPosition = translationMatrix * vec4(pos, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * translationMatrix * vec4(pos, 1.0);
  }
`;
