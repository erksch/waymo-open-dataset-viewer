import React, { Fragment } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 20px;
  z-index: 1000;
  text-align: center;
`;

const Message = styled.span`
  color: red;
  line-height: 1.5;
`;

const Button = styled.button`
  border: 2px solid white;
  color: white;
  border-radius: 100px;
  padding: 10px 20px;
  align-self: center;
  margin-top: 40px;
  outline: none;
`;

interface Props {
  message: string;
  retry: () => void;
}

const ErrorMessage: React.FC<Props> = ({ message, retry }) => {
  return (
    <Container>
      <Message>
        {message.split('\n').map((item, key) => (
          <Fragment key={key}>{item}<br/></Fragment>
        ))} 
      </Message>
      <Button onClick={retry}>
        Retry
      </Button>
    </Container>
  );
};

export default ErrorMessage;