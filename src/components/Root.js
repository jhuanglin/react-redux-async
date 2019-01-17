import React from 'react'
import {BrowserRouter as Router, Route, NavLink} from 'react-router-dom'
import App from './App'
import { Provider } from 'react-redux'
import TestApp from './TestApp'
import D3 from './D3_example'

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
          <li>
            <NavLink to="/d3">D3_example</NavLink>
          </li>
        </ul>
        <Route exact path="/" component={App}></Route>
        <Route path="/C" component={TestApp}></Route>
        <Route path='/d3' component={D3}></Route>
      </div>
    </Router>
  </Provider>
)

export default Root
