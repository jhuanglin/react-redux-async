import React from 'react'
let d3 = require('d3')

class D3Line extends React.Component {
  constructor(props) {
    super(props)
    this.svg = null
  }


  componentDidMount() {
    this.drawS()
    this.drawV()
  }

  drawS() {
    const dataset = ['10', '20', '30', '40']
    const width = 300
    const height = 300
    const rectHeight = 25
    const paddingLeft = 25

    let linearScale = d3.scaleLinear().domain([0, 50]).range([0, 250])

    let bAxis = d3.axisBottom().scale(linearScale).ticks(5)


    let svg = d3.select('#d3')
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('x', paddingLeft)
      .attr('y', (d, i) => {
        return i * rectHeight
      })
      .attr('width', d => linearScale(d))
      .attr('height', rectHeight - 2)
      .attr('fill', 'steelblue')

    svg.append('g')
      .call(bAxis)
      .attr('class', 'axis')
      .attr('transform', `translate(${paddingLeft}, ${rectHeight * dataset.length})`)
  }

  drawV() {
    const width = 400
    const height = 400
    const padding = {
      left: 30,
      right: 30,
      bottom: 20,
      top: 20
    }

    let svgs = d3.range(3).map((d, i) => {
      return d3.select('#d3')
      .append('svg')
      .attr('width', width)
        .attr('height', height)
    })

    var dataset = [101, 20, 25, 35, 49, 24, 70]

    const xScale = d3
      .scaleBand()
      .domain(d3.range(dataset.length))
      .range([0, width - padding.left - padding.right])
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset)])
      .range([height - padding.top - padding.bottom, 0])

    const xAxis = d3.axisBottom()
      .scale(xScale)

    const yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(dataset.length)

    // const bars = svg.selectAll('g')
    //   .data(dataset)
    //   .enter()
    //   .append('g')
    //   .attr('transform', `translate(${padding.left}, ${padding.top})`)
    this.drawGsRT(svgs[0], xScale, yScale, dataset, padding, width, height)
    this.drawSingRT(svgs[1], xScale, yScale, dataset, padding, width, height)
    this.drawAniGsRT(svgs[2], xScale, yScale, dataset, padding, width, height)

    svgs.forEach((s) => {
      s.append('g')
        .attr('transform', `translate(${padding.left}, ${height - padding.bottom})`)
        .call(xAxis)
      s.append('g')
        .attr('transform', `translate(${padding.left}, ${padding.top})`)
        .call(yAxis)
    })
  }

  drawGsRT(svg, xScale, yScale, dataset, padding, width, height) {
    const skipL = 4
    const bars = svg.selectAll('g')
      .data(dataset)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${i * (xScale.bandwidth()) + padding.left}, ${padding.top})`)

    bars.append('rect')
      .attr('x', i => skipL / 2)
      .attr('y', d => yScale(d))
      .attr('width', d => xScale.bandwidth() - skipL)
      .attr('height', d => {
        return height - padding.bottom - padding.top - yScale(d)
      })
      .attr('fill', 'steelblue')

    bars.append('text')
      .text(d => d)
      .attr('x', i => (xScale.bandwidth() - skipL) / 2)
      .attr('y', d => yScale(d))
      .attr('dy', 20)
      .attr('text-anchor', 'middle')
  }

  drawSingRT(svg, xScale, yScale, dataset, padding, width, height) {
    const skipL = 4
    const rects = svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('transform', `translate(${padding.left}, ${padding.top})`)
      .attr('class', 'd3_rect')
      .attr('x', (d, i) => {
        return xScale(i) + skipL / 2
      })
      .attr('y', (d) => {
        return yScale(d)
      })
      .attr('width', (d) => {
        return xScale.bandwidth() - skipL
      })
      .attr('height', d => {
        return height - padding.top - padding.bottom - yScale(d)
      })
      .attr('fill', 'steelblue')

    const texts = svg.selectAll('text')
      .data(dataset)
      .enter()
      .append('text')
      .attr('transform', `translate(${padding.left}, ${padding.top})`)
      .attr('x', (d, i) => {
        return xScale(i) + skipL / 2
      })
      .attr('y', d => {
        return yScale(d)
      })
      .attr('dx', () => {
        return (xScale.bandwidth() - skipL) / 4
      })
      .attr('dy', () => {
        return 20
      })
      .text(d => d)

    rects.on('mouseover', function (d, i) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', 'yellow')
    }).on('mouseout', function (d, i) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', 'steelblue')
    })
  }

  drawAniGsRT(svg, xScale, yScale, dataset, padding, width, height) {
    const skipL = 4
    const rects = svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('transform', `translate(${padding.left}, ${padding.top})`)
      .attr('class', 'd3_rect')
      .attr('x', (d, i) => {
        return xScale(i) + skipL / 2
      })
      .attr('y', (d) => {
        const min = yScale.domain()[0]
        return yScale(min)
      })
      .attr('width', (d) => {
        return xScale.bandwidth() - skipL
      })
      .attr('height', d => 0)
      .attr('fill', 'steelblue')
      .transition()
      .delay((d, i) => i * 200)
      .duration(2000)
      .ease(d3.easeBounce)
      .attr('height', d => {
        return height - padding.top - padding.bottom - yScale(d)
      })
      .attr('y', (d) => {
        return yScale(d)
      })

    const texts = svg.selectAll('text')
      .data(dataset)
      .enter()
      .append('text')
      .attr('transform', `translate(${padding.left}, ${padding.top})`)
      .attr('x', (d, i) => {
        return xScale(i) + skipL / 2
      })
      .attr('y', d => {
        const min = d3.min(yScale.domain())
        return yScale(min)
      })
      .attr('dx', () => {
        return (xScale.bandwidth() - skipL) / 4
      })
      .attr('dy', () => {
        return 20
      })
      .text(d => d)
      .attr('fill', 'white')
      .transition()
      .delay((d, i) => i * 200)
      .duration(2000)
      .ease(d3.easeBounce)
      .attr('y', d => yScale(d))
  }

  render() {
    return (
      <div id="d3">
      </div>
    )
  }
}

export default D3Line
