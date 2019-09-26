import React from 'react'

// 参考：
// https://serverless-stack.com/chapters/code-splitting-in-create-react-app.html
// http://www.wukai.me/2017/09/25/react-router-v4-code-splitting/
export default function asyncComponent(importComponent) {
  class AsyncComponent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        component: null
      }
    }

    async componentDidMount () {
      const { default: component } = await importComponent()

      this.setState({
        component
      })
    }

    render () {
      const C = this.state.component
      // 当C未被加载的时候，显示null或者可以显示一个加载中组件
      return C ? <C {...this.props}/> : null
    }
  }
  return AsyncComponent
}
