import styled from 'styled-components';

export const Container = styled.aside``;

export const ContainerInner = styled.div`
  position: absolute;
  overflow-y: scroll;
  width: 300px;
  height: 100%;
  padding: 30px;
  z-index: 100;
  background-color: hsla(0, 0%, 0%, 0.3);

  &::-webkit-scrollbar { 
    display: none; 
  }
`;

export const Background = styled.div`
  backdrop-filter: blur(5px);
  content: "";
  display: flex;
  z-index: 1;
  top: 0;
  position: absolute;
  width: 300px;
  height: 100%;
`;

export const RowTitle = styled.h3`
  margin-top: 0;
  font-size: 14px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 2px;
`;


export const Row = styled.div`
  z-index: 1000;
  display: flex;
  flex-direction: column;

  & + & {
    padding-top: 30px;
  }
`;

