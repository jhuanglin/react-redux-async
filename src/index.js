import React from 'react'
import ReactDOM from 'react-dom'
import configStore from './store'
import Root from './components/Root'
// import * as d3 from 'd3'

// window.d3 = require('d3')
// console.log(window.d3)

const store = configStore()

console.log(store.getState())

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
)
