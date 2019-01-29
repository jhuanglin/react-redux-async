import React from 'react'
import {BrowserRouter as Router, Route, NavLink, Switch} from 'react-router-dom'
import './assets/d3_main.scss'

import D3Line from './d3s/D3_line'
import D3Pie from './d3s/D3_pie'
import D3Circle from './d3s/D3_circle'
import D3force from './d3s/D3_force'
import D3forcecanvas from './d3s/D3_force_canvas'
import D3AddNode from './d3s/D3_force_add_node'
import D3Tree from './d3s/D3_tree'
import D3Cluster from './d3s/D3_cluster';

const routes = [
  {
    path: '/d3/d3_line',
    component: D3Line,
    name: 'line'
  },{
    path: '/d3/d3_pie',
    component: D3Pie,
    name: 'pie'
  },{
    path: '/d3/d3_circle',
    component: D3Circle,
    name: 'circle'
  },{
    path: '/d3/d3_force',
    component: D3force,
    name: 'force'
  },{
    path: '/d3/d3_by_canvas',
    component: D3forcecanvas,
    name: 'force_bycanvas'
  },{
    path: '/d3/d3_force_add_node',
    component: D3AddNode,
    name: 'force_add_node'
  },{
    path: '/d3/d3_tree',
    component: D3Tree,
    name: 'tree'
  },{
    path: '/d3/d3_cluster',
    component: D3Cluster,
    name: 'cluster'
  }
]

class D3 extends React.Component{

  render() {
    return (
      <Router>
        <div>
          <ul className='nav'>
            {
              routes.map((route, i) => (
                <li key={i}>
                  <NavLink className='normal' activeClassName="active" to={route.path}>{ route.name }</NavLink>
                </li>
              ))
            }
          </ul>
          {routes.map((route, i) => (
            <RoutesWithConfig key={i} {...route}></RoutesWithConfig>
          ))}
        </div>
      </Router>
    )
  }
}

function RoutesWithConfig (route) {
  return (
    <Route
      path = {route.path}
      component = {route.component}
    ></Route>
  )
}

export default D3
