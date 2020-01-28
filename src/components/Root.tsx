import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import rootReducer from '../state/rootReducer';
import { Provider } from 'react-redux';
import App from './App';

const store = createStore(rootReducer, applyMiddleware(logger));

const Root: React.FC = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default Root;