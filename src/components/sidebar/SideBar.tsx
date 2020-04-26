import React from 'react';
import LaserSelector from './LaserSelector';
import SegmentsDropdown from './SegmentsDropdown';
import FrameSlider from './FrameSlider';
import Switch from '../utility/Switch';
import { useConfig } from '../../state/configReducer';
import { ColorMode, LabelMode } from '../../constants';
import { Container, Background, ContainerInner, Row, RowTitle } from './SideBar.styled';
import { useDispatch } from 'react-redux';
import ObjectDetectionPrediction from './ObjectDetectionPrediction';
import SegmentationPrediction from './SegmentationPrediction';


const SideBar: React.FC = () => {
  const dispatch = useDispatch();
  const config = useConfig();

  return (
    <Container>
      <Background />
      <ContainerInner>
        <Row>
          <RowTitle>Segment</RowTitle>  
          <SegmentsDropdown />
        </Row>
        <Row>
          <RowTitle>Frames</RowTitle> 
          <FrameSlider />
        </Row>
        <Row>
          <RowTitle>Lasers</RowTitle>
          <LaserSelector />
        </Row>
        <Row>
          <RowTitle>Color by</RowTitle>
          <Switch 
            selected={config.colorMode}
            options={[
              { 
                value: ColorMode.LABEL, 
                caption: 'Label', 
                onChange: () => dispatch({ type: 'SET_COLOR_MODE', mode: ColorMode.LABEL }), 
              },
              { 
                value: ColorMode.INTENSITY, 
                caption: 'Intensity', 
                onChange: () => dispatch({ type: 'SET_COLOR_MODE', mode: ColorMode.INTENSITY }), 
              },
            ]}
          />
        </Row>
        <Row>
          <RowTitle>Color by</RowTitle>
          <Switch 
            selected={config.labelMode}
            options={[
              { 
                value: LabelMode.GROUND_TRUTH, 
                caption: 'Ground truth', 
                onChange: () => dispatch({ type: 'SET_LABEL_MODE', mode: LabelMode.GROUND_TRUTH }),
              },
              { 
                value: LabelMode.PREDICTION, 
                caption: 'Prediction', 
                onChange: () => dispatch({ type: 'SET_LABEL_MODE', mode: LabelMode.PREDICTION }), 
              },
            ]}
          />
        </Row>
        <Row>
          <RowTitle>Object Detection</RowTitle>
          <ObjectDetectionPrediction />
        </Row>
        <Row>
          <RowTitle>Segmentation</RowTitle>
          <SegmentationPrediction />
        </Row>
      </ContainerInner>
    </Container>
  );
};

export default SideBar;
