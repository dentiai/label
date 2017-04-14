import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { HashRouter as Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
import App from './containers/App';
import './index.css';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

const store = createStoreWithMiddleware(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const appHistory = createBrowserHistory({
  basename: '/d-pan'
});
ReactDOM.render(
  <Provider store={store}>
    <Router history={appHistory}>
      <Route path="/:photoId?" component={App} />
    </Router>
  </Provider>,
  document.getElementById('root')
);
