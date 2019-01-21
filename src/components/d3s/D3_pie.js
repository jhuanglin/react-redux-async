import React from 'react'
let d3 = require('d3')

class D3Pie extends React.Component{
  constructor(props) {
    super(props)
    this.svg = null
  }

  componentDidMount() {
    this.drawPie()
  }

  drawPie() {
    const width = 400
    const height = 400

    const dataset = [40, 20, 16, 2, 55]

    const iR = 0
    const oR = 100

    let svg = d3.select('#d3')
      .append('svg')
      .attr('widtg', width)
      .attr('height', height)

    let pie = d3.pie()
    let pieData = pie(dataset)
    console.log(pieData)

    let arc = d3.arc()
      .innerRadius(iR)
      .outerRadius(oR)
    console.log(arc)

    console.log(d3.schemeCategory10)
    let arcs = svg.selectAll('g')
      .data(pieData)
      .enter()
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    arcs.append('path')
      .attr('fill', (d, i) => {
        return d3.schemeAccent[i]
      })
      .attr('d', (d) => arc(d))

    arcs.append('text')
      .attr('transform', (d, i) => {
        return `translate(${arc.centroid(d)})`
      })
      .attr('text-anchor', 'middle')
      .text(d => d.data)

  }

  render() {
    return (
      <div id="d3">
      </div>
    )
  }
}

export default D3Pie
