import React from 'react'
import ForceBusiness from './force.business'
import '../assets/d3.scss'
import * as d3 from 'd3'

import { mockGraphData } from '../../mock/mockGraph'

class d3Canvas extends React.Component {
  constructor(props) {
    super(props)

    this.gdata = mockGraphData(20)
    console.log(this.gdata)
  }

  componentDidMount() {
    this.force = new ForceBusiness(this.graphWrapper, {
      canvasShift: [0, 0],  // AUTO 时隐藏侧边栏，不偏移
      data: this.gdata,
      onClickOutside: (b) => this.onClickOutside(b),
      onClickVertex: (v) => this.onClickVertex(v),
      onClickEdge: (e) => this.onClickEdge(e),
      onZoom: (transform) => this.onZoom(transform),
      // transform,
      // theme: this.props.themeCode,
    })
    this.force.init(this.gdata) // this.preGraphGlobalData 布局切换的时候，需要保留旧的一些状态，如图内路径

  }

  onClickOutside = () => {}
  onClickVertex = () => {}
  onClickEdge = () => {}
  onZoom = () => {}

  render () {
    return (
      <div className='draw_wrapper'>
        <canvas className='graph_wrapper' ref={graphWrapper => {this.graphWrapper = graphWrapper}} id='graph' />
      </div>
    )
  }
}

export default d3Canvas
