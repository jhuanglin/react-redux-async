import React from 'react'
import {BrowserRouter as Router, Route, NavLink, Switch} from 'react-router-dom'
import D3Line from './d3s/D3_line'
import D3Pie from './d3s/D3_pie'
import D3Circle from './d3s/D3_circle'
import D3force from './d3s/D3_force'
import D3forcecanvas from './d3s/D3_force_canvas'
import D3AddNode from './d3s/D3_force_add_node'

class D3 extends React.Component{

  render() {
    return (
      <Router>
        <div>
          <ul>
            <li>
              <NavLink to="/d3/d3_line">line</NavLink>
            </li>
            <li>
              <NavLink to="/d3/d3_pie">pie</NavLink>
            </li>
            <li>
              <NavLink to="/d3/d3_circle">circle</NavLink>
            </li>
            <li>
              <NavLink to="/d3/d3_force">force</NavLink>
            </li>
            <li>
              <NavLink to="/d3/d3_force_canvas">force_by canvas</NavLink>
            </li>
            <li>
              <NavLink to="/d3/d3_force_add_node">force_添加节点</NavLink>
            </li>
          </ul>
          <Route path="/d3/d3_line" component={D3Line}></Route>
          <Route path="/d3/d3_pie" component={D3Pie}></Route>
          <Route path="/d3/d3_circle" component={D3Circle}></Route>
          <Route path="/d3/d3_force" component={D3force}></Route>
          <Route path="/d3/d3_force_canvas" component={D3forcecanvas}></Route>
          <Route path="/d3/d3_force_add_node" component={D3AddNode}></Route>
        </div>
      </Router>
    )
  }
}

export default D3
