import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './index.css';
import App from './App';
import EndReviewPage from './EndReviewPage';
import ReviewPage from './ReviewPage';

import { initGrammar } from './db';

initGrammar();

ReactDOM.render(
  <React.StrictMode>
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact>
            <App />
          </Route>
          <Route path="/review" exact>
            <ReviewPage />
          </Route>
          <Route path="/review-end">
            <EndReviewPage />
          </Route>
        </Switch>
      </Router>{' '}
    </div>
  </React.StrictMode>,
  document.getElementById('root'),
);
