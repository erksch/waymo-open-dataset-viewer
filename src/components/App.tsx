import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Canvas, extend } from 'react-three-fiber';
import PointCloud from './PointCloud';
import GlobalStyle from './style/GlobalStyle';
import useWebsocket from '../hooks/useWebsocket';
import { ReactReduxContext, Provider } from 'react-redux';
import Controls from './Controls';
import SideBar from './sidebar/SideBar';
import OrbitControls from './OrbitControls';
import BoundingBoxes from './BoundingBoxes';
import ErrorMessage from './utility/ErrorMessage';
import { Spinner } from 'react-activity';

extend({ OrbitControls });

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const StyledApp = styled.div`
  height: 100%;
  background-color: black;
`;

const StatusContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatusText = styled.div`
  margin-top: 20px;
  animation: ${pulse} 2s infinite;
`;

const App: React.FC = () => {
  const { isLoading, error, retry, status } = useWebsocket();

  return (
    <StyledApp>
      <GlobalStyle />
      <StatusContainer>
        {error && <ErrorMessage message={error} retry={retry} />}
        {isLoading && <Spinner color="white" size={24} />}
        <StatusText>{status}</StatusText>
      </StatusContainer>
      <SideBar />
      <ReactReduxContext.Consumer>
        {({ store }) => (
          <Canvas>
            <Controls />
            <Provider store={store}>
              <PointCloud />
              <BoundingBoxes />
            </Provider>
          </Canvas>
        )}
      </ReactReduxContext.Consumer>
    </StyledApp>
  );
};

export default App;
