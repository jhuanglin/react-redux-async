import React from 'react'
import { NavLink } from "react-router-dom";

class Home extends React.Component{
  render() {
    return (
      <div>
        <ul>
          <li>
            <NavLink to="/app">Home</NavLink>
          </li>
          <li>
            <NavLink to="/C">component</NavLink>
          </li>
          <li>
            <NavLink to="/d3">D3_example</NavLink>
          </li>
        </ul>
      </div>
    )
  }
}

export default Home
