import React, { CSSProperties } from 'react';
import styled, { css } from 'styled-components';

interface Props {
  selected: number;
  options: Array<{
    value: number;
    caption: string;
    onChange: () => void;
  }>;
  style?: CSSProperties;
  optionStyle?: CSSProperties;
}

const Switch: React.FC<Props> = ({
  selected,
  options,
  style = {},
  optionStyle = {},
}) => {
  return (
    <Container style={style}>
      {options.map((option) => (
        <Option
          key={option.value}
          checked={selected === option.value}
          style={optionStyle}
        >
          <input
            type="radio"
            value={option.value}
            checked={selected === option.value}
            onChange={option.onChange}
          />
          {option.caption}
        </Option>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  border-radius: 40px;
  border: 1px solid hsl(0, 0%, 20%);
  background-color: black;
`;

const Option = styled.label`
  flex: 1;
  cursor: pointer;
  display: block;
  padding: 10px;
  text-align: center;

  ${(props: { checked: boolean }) =>
    props.checked &&
    css`
      background-color: white;
      color: black;
      border-radius: 40px;
    `}

  input {
    display: none;
  }
`;

export default Switch;
