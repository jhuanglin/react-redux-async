import React, { Suspense, lazy } from 'react'
import {BrowserRouter as Router, Route, NavLink, Switch} from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App'
// import TestApp from './TestApp'
// import D3 from './D3_example'
// import D3Data from './D3_data_ex'
// const App = lazy(() => import('./App'))
const TestApp = lazy(() => import('./TestApp'))
const D3 = lazy(() => import('./D3_example'))
const D3Data = lazy(() => import('./D3_data_ex'))

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
              <li>
                <NavLink to="/d3_data">D3_data_example</NavLink>
              </li>
            </ul>
            <Suspense fallback={<div>loading...</div>}>
              <Switch>
                <Route exact path="/" component={App}></Route>
                {/* component={TestApp} */}
                <Route path="/C" render={(props) => <TestApp {...props} />}></Route>
                <Route path="/d3" render={(props) => <D3 {...props} />}></Route>
                <Route path="/d3_data" render={(props) => <D3Data {...props} />}></Route>
                {/* <Route path='/d3' component={D3}></Route> */}
                {/* <Route path='/d3_data' component={D3Data}></Route> */}
              </Switch>
            </Suspense>
          </div>
        </Router>
      </Provider>

    )
  }
}

export default Root
