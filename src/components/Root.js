import React, { Suspense, lazy } from 'react'
import {BrowserRouter as Router, Route, NavLink, Switch} from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App'
import TestApp from './TestApp'
import D3 from './D3_example'
import Home from './Home'
// import D3Data from './D3_data_ex'

// const Root = ({store}) => (
class Root extends React.Component {
  constructor(props) {
    console.log(props)
    super(props)
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <Router>
          <div>
            <Route exact path='/' component={Home}></Route>
            <Route path="/app" component={App}></Route>
            <Route path='/C' component={TestApp}></Route>
            <Route path='/d3' component={D3}></Route>
            <NavLink to='/'>回到首页</NavLink>
          </div>
        </Router>
      </Provider>

    )
  }
}

export default Root
