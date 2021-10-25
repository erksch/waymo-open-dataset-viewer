import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../state/rootReducer';
import { Laser } from '../../state/configReducer';

const Border = styled.div`
  border-radius: 20px;
  border: 3px solid white;
  position: relative;
  width: 160px;
  height: 70px;
  align-self: center;
`;

const Point = styled.label`
  cursor: pointer;
  position: absolute;
  background-color: ${(props: { checked: boolean }) =>
    props.checked ? 'hsl(100, 100%, 60%)' : 'gray'};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: translate(-50%, -50%);

  input {
    display: none;
  }
`;

const LaserSelector = () => {
  const dispatch = useDispatch();
  const laserStatus = useSelector((state: AppState) => state.config.lasers);
  const lasers: Laser[] = ['TOP', 'FRONT', 'SIDE_LEFT', 'SIDE_RIGHT', 'REAR'];
  const styles = {
    TOP: {
      left: '50%',
      top: '50%',
      width: '30px',
      height: '30px',
    },
    FRONT: {
      left: '100%',
      top: '50%',
    },
    SIDE_LEFT: {
      right: '10%',
      top: '0%',
    },
    SIDE_RIGHT: {
      right: '10%',
      top: '100%',
    },
    REAR: {
      left: '0%',
      top: '50%',
    },
  };

  return (
    <Border>
      {lasers.map((laser: Laser) => (
        <Point key={laser} checked={laserStatus[laser]} style={styles[laser]}>
          <input
            type="checkbox"
            value={laser}
            checked={laserStatus[laser]}
            onChange={() => dispatch({ type: 'TOGGLE_LASER', laser })}
          />
        </Point>
      ))}
    </Border>
  );
};

export default LaserSelector;
