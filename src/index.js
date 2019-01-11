import React from 'react'
import ReactDOM from 'react-dom'
import configStore from './store'
import Root from './components/Root'

const store = configStore()

console.log(store.getState())

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
)
