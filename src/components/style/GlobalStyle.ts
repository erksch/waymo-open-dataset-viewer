import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Segoe UI", Helvetica, sans-serif;
    color: white;
    font-size: 16px;
  }
  
  button {
    font: inherit;
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  #root {
    height: 100%;
  }
`;

export default GlobalStyle;