import axios from 'axios';

async function runPrediction() {
  const { data: labels } = await axios.post('http://localhost:8080/predict', {
    filepath: "/home/erik/Projects/notebooks/pointclouds/segment-15578655130939579324_620_000_640_000/point_clouds3/frame_000_170081.csv",
  });

  return {  
    frameIndex: 0,
    labels,
  };
}

export default runPrediction;