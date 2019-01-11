import React from 'react'
import {BrowserRouter as Router, Route, NavLink} from 'react-router-dom'
import App from './App'
import { Provider } from 'react-redux'
import TestApp from './TestApp'

const Root = ({store}) => (
  <Provider store={store}>
    <Router>
      <div>
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/C">component</NavLink>
          </li>
        </ul>
        <Route exact path="/" component={App}></Route>
        <Route path="/C" component={TestApp}></Route>
      </div>
    </Router>
  </Provider>
)

export default Root
