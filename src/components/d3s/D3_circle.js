import React from 'react'
let d3 = require('d3')

class D3Circle extends React.Component{
  constructor(props) {
    super(props)
    this.svg = null
  }

  componentDidMount() {
    this.drawCircles()
  }

  drawCircles() {
    let svg = d3.select('#d3')
      .append('svg')
      .attr('width', 600)
      .attr('height', 600)
    let [circle1, circle2, circle3] = d3.range(3).map(i => {
      return svg.append('circle')
        .attr('cx', 100)
        .attr('cy', (i + 1) * 100)
        .attr('r', 45)
        .attr('fill', 'green')
    })

    circle1.transition()
      .duration(1000)
      .attr('cx', 300)

    circle2.transition()
      .duration(1500)
      .attr('cx', 300)
      .attr('fill', 'red')

    circle3
      .transition()
      .delay(2000)
      .duration(3000)
      .ease(d3.easeBounce)
      .attr('cx', 300)
      .attr('fill', 'red')
      .attr('r', 25)

  }

  render() {
    return (
      <div id="d3">
      </div>
    )
  }
}

export default D3Circle
