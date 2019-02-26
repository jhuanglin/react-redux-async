import React from 'react'
let d3 = require('d3')

class D3Pie extends React.Component{
  constructor(props) {
    super(props)
    this.svg = null
  }

  componentDidMount() {
    this.drawPie()
    this.drawPie1()
  }

  drawPie() {
    const width = 400
    const height = 400

    const dataset = [40, 20, 16, 2, 55]

    const iR = 0
    const oR = 100

    let svg = d3.select('#d3')
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    let pie = d3.pie()
    let pieData = pie(dataset)
    // console.log(peData)

    let arc = d3.arc()
      .innerRadius(iR)
      .outerRadius(oR)
    // console.log(arc)

    // console.log(d3.schemeCategory10)
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

  drawPie1() {
    const width = 400
    const height = 400

    const dataset = [40, 60]

    const iR = 40
    const oR = 45

    let svg = d3.select('#d3')
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    let pie = d3.pie().startAngle(2 * Math.PI).endAngle(0)
    let pieData = pie(dataset)
    // console.log(peData)

    let arc = d3.arc()
      .innerRadius(iR)
      .outerRadius(oR)
    // console.log(arc)

    // console.log(d3.schemeCategory10)
    let colors = ['#e67574', '#fceaea']
    let arcs = svg.selectAll('g')
      .data(pieData)
      .enter()
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    arcs.append('path')
      .attr('fill', (d, i) => {
        return colors[i]
      })
      .attr('d', (d) => arc(d))

    let circle = svg
      .append('circle')
      .attr('r', 35)
      .attr('cx', width/2)
      .attr('cy', height/2)
      .attr('fill', '#fceaea')

    svg.append('text')
      .text('99.99%')
      .attr('fill', '#e67574')
      .attr('font-size', 15)
      .attr('transform', `translate(${width / 2}, ${height / 2})`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
    // arcs.append('text')
    //   .attr('transform', (d, i) => {
    //     return `translate(${arc.centroid(d)})`
    //   })
    //   .attr('text-anchor', 'middle')
    //   .text(d => d.data)
  }

  render() {
    return (
      <div id="d3">
      </div>
    )
  }
}

export default D3Pie
