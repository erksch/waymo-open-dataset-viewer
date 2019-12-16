export default `
  precision highp float;
  
  varying float vType;

  void main() {
    vec3 labelColors[5];
    vec3 notLabeledColor = vec3(0.2, 0.2, 0.2);

    labelColors[0] = vec3(1.0, 1.0, 1.0);
    labelColors[1] = vec3(1.0, 0.0, 0.0);
    labelColors[2] = vec3(1.0, 1.0, 0.0);
    labelColors[3] = vec3(0.0, 1.0, 0.0);
    labelColors[4] = vec3(0.0, 0.0, 1.0);

    vec3 labelColor = labelColors[0];

    if (vType == 1.0) {
      labelColor = labelColors[1];
    } else if (vType == 2.0) {
      labelColor = labelColors[2];
    } else if (vType == 3.0) {
      labelColor = labelColors[3];
    } else if (vType == 4.0) {
      labelColor = labelColors[4];
    } else if (vType == -1.0) {
      labelColor = notLabeledColor;
    }

    gl_FragColor = vec4(labelColor, 1.0);
  }
`;