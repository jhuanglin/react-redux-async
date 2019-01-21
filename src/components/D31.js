import React from 'react'
let d3 = require('d3')

class D3 extends React.Component {
  constructor(props) {
    super(props)
    this.svg = null
  }


  componentDidMount() {
    // this.textUE()
    // this.drawS()
    // this.drawV()
    // this.drawCircles()
    // this.drawPie()
    this.drawN()
  }

  textUE() {
    // ----------update exit enter--------------
    const ds = ['i', 'u', 'c']
    const de = ['1', '2']
    let d = d3.select('#d3').selectAll('p')
    // update
    let update = d.data(ds)
    // enter
    let enter = update.enter()
    update.text(d => 'update ' + d)
    // exit
    let exit = enter.append('p')
      .text(d => 'enter ' + d)
    exit.data(de).exit().remove()
    // ----------update exit enter--------------
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

    let svg = d3.select('#d3')
      .append('svg')
      .attr('width', width)
      .attr('height', height)

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

    this.drawSingRT(svg, xScale, yScale, dataset, padding, width, height)
    // this.drawGsRT(svg, xScale, yScale, dataset, padding, width, height)
    // this.drawAniGsRT(svg, xScale, yScale, dataset, padding, width, height)
    svg.append('g')
      .attr('transform', `translate(${padding.left}, ${height - padding.bottom})`)
      .call(xAxis)

    svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`)
      .call(yAxis)

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

  zoomed(d) {
    const transform = d3.event.transform
    console.log(transform)
    d3.select(this).attr('transform', `translate(${transform.x} , ${transform.y}) scale(${transform.k})`)
  }

  getZoom(d) {
    d3.event.stopPropagation()
    if (this.tagName === 'svg') {
      d3.selectAll('circle')
      .transition()
      .duration(1000)
      .attr('r', 15)
    } else {
      d3.selectAll('circle')
        .transition()
        .duration(1000)
        .attr('r', (d, i, g) => {
          if (this === g[i]) {
            return 15 * 2
          } else {
            return 15 / 2
          }
        })
    }

  }

  drawN() {
    const width = 400
    const height = 400
    let nodes = [{ name: "桂林" }, { name: "广州" },
    { name: "厦门" }, { name: "杭州" },
    { name: "上海" }, { name: "青岛" },
    { name: "天津" }];

    let links = [{ source: 0, target: 1 }, { source: 0, target: 2 },
    { source: 0, target: 3 }, { source: 1, target: 4 },
    { source: 1, target: 5 }, { source: 1, target: 6 }];

    let zoomListener = d3.zoom()
      .scaleExtent([.5, 2])
      .on('zoom', this.zoomed)

    this.svg = d3.select('#d3')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .on('click', this.getZoom)

    let simulation = d3.forceSimulation()
      .force('link', d3.forceLink()) //连接线
      .force('charge', d3.forceManyBody().strength(-100)) // 电荷力模型 正值为引力 负值为斥力
      .force("center", d3.forceCenter(width / 2, height / 2)) // 中间力
      .force('collide', d3.forceCollide(15).strength(.7)) // 碰撞力
      .velocityDecay(.2)
      // .alphaMin(0.0001)
      // .alphaDecay(0.01)

    simulation.nodes(nodes)
      .on('tick', ticked)
    simulation.force('link')
      .links(links)
      .distance(100)

    var g = this.svg.append('g')
      .call(zoomListener)

    var link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#aaa')
      .attr('stroke-width', 2)

    var link_text = g.append('g')
      .attr('class', 'link_text')
      .selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('dx', 10)
      .attr('dy', 10)
      .text(d => d.index)

    var node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 15)
      .attr('fill', (d, i) => {
        return d3.schemeCategory10[i]
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', this.getZoom)

    var text = g.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('dx', 20)
      .attr('dy', 8)
      .attr('fill', 'black')
      .text(d => d.name)

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    function ticked() {
      link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

      node
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });

      text
        .attr('x', d => d.x)
        .attr('y', d => d.y)

      link_text
        .attr('x', d=> {
          let x_d = (d.source.x + d.target.x) / 2
          return x_d
        })
        .attr('y', d => {
          let y_d = (d.source.y + d.target.y) / 2
          return y_d
        })
    }


  }
  render() {
    return (
      <div id="d3">
      </div>
    )
  }
}

export default D3
