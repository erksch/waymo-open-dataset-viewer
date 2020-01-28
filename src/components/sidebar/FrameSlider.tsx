import React from 'react';
import styled from 'styled-components';
import { useConfig, useActiveSegment } from '../../state/configReducer';
import { useDispatch } from 'react-redux';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const Row = styled.div`
  display: flex; 
  align-items: center; 
  max-width: 100%; 
`;

const HeadRow = styled(Row)`
  margin-bottom: 10px;
`;

const Col = styled.span`
  flex: 1; 
  text-align: center;
`;

const RangeInput = styled.input`
  flex: 1;
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background-color: hsl(100, 100%, 60%);
  outline: none;
  border-radius: 10px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    transform: translateX(-50%);
    background-color: hsla(0, 0%, 100%, 0.5);
    cursor: pointer;

    &:hover {
      background-color: hsla(0, 0%, 100%, 1.0);
    }
  }
`;

const ArrowButton = styled.button`
  display: flex;
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  outline: none;
  font-size: 20px;

  &:disabled {
    color: hsl(0, 0%, 30%);
  }
`;

const FrameSlider: React.FC = () => {
  const dispatch = useDispatch();
  const { activeFrame: baseActiveFrame } = useConfig();
  const activeSegment = useActiveSegment();

  const activeFrame = baseActiveFrame >= 0 ? baseActiveFrame + 1 : null;
  const loadedFrames = activeSegment ? activeSegment.frames.length : null;
  const totalFrames = activeSegment && activeSegment.metadata ? activeSegment.metadata.size : null;
  const loadedFraction = (totalFrames && loadedFrames) ? loadedFrames / totalFrames : null;
  const frame = activeSegment && activeSegment.frames[baseActiveFrame];

  return (
    <div>
      {frame && frame.timestamp}
      <HeadRow>
        <Col>Active</Col>
        <Col>Loaded</Col>
        <Col>Total</Col>
      </HeadRow>
      <Row>
        <Col>{activeFrame || '-'}</Col>
        <span>/</span>
        <Col>{loadedFrames || '-'}</Col>
        <span>/</span>
        <Col>{totalFrames || '-'}</Col>
      </Row>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
        <ArrowButton 
          onClick={() => activeFrame && dispatch({ type: 'SET_ACTIVE_FRAME', frame: activeFrame - 2 })}
          disabled={activeFrame === null || activeFrame <= 1}
        >
          <FaAngleLeft />
        </ArrowButton>
        <div
          style={{
            position: 'relative',
            width: '100%',
            margin: '0 20px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div 
            style={{ 
              position: 'absolute', 
              height: '4px', 
              width: `calc(100% - 100% * ${loadedFraction || 0})`, 
              backgroundColor: 'gray', 
              borderRadius: '10px', 
              right: '0',
            }} 
          />
          <RangeInput 
            type="range" 
            min={0}
            max={totalFrames || 0}
            value={activeFrame || 0}
            onChange={(e) => {
              const nextIndex = Number(e.target.value);
              if (!loadedFrames || nextIndex > loadedFrames) return;
              dispatch({ type: 'SET_ACTIVE_FRAME', frame: nextIndex });
            }}
          />
        </div>
        <ArrowButton 
          onClick={() => activeFrame && dispatch({ type: 'SET_ACTIVE_FRAME', frame: activeFrame })}
          disabled={activeFrame === null || totalFrames === null || activeFrame >= totalFrames}
        >
          <FaAngleRight />
        </ArrowButton>
      </div>
    </div>
  );
};

export default FrameSlider;
