import React from 'react'
import '../assets/d3_circle_ani.scss'
import * as d3 from 'd3'

class D3PieAni extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    // this.draw()
  }

  draw = () => {
    this.svg = d3.select('#d3CircleAni')
      .append('svg')
      .attr('width', 600)
      .attr('height', 600)
    this.addLineGradient()
    this.svg.append('circle')
      .attr("class", 'circle_ani')
      .attr('r', 100)
      .attr('cx', 300)
      .attr('cy', 250)
      .attr('stroke', 'url(#lineGradient)')
      .attr('stroke-width', 2)
      .attr('stroke-miterlimit', 1)
      .style('fill', 'none')
  }

  addLineGradient = () => {
    let linearGradient = this.svg.append('defs')
      .append('linearGradient')
      .attr('id', 'lineGradient')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 1)
      .attr('y2', 1)
    let colorArr = [{
      color: 'rgba(55, 75, 95, 0)',
      offset: '0'
    }, {
      color: '#83C1FA',
      offset: '33.33%'
    }, {
      color: 'rgba(55, 75, 95, 0)',
      offset: '66.66%'
    }, {
      color: '#83C1FA',
      offset: '100%'
    },]
    colorArr.forEach(c => {
      linearGradient.append('stop')
        .attr('offset', c.offset)
        .attr('stop-color', c.color)
    })
  }

  render() {
    return (
      <>
        <div id='d3CircleAni'></div>
        <div className="circle-svg"></div>
      </>
    )
  }
}

export default D3PieAni
