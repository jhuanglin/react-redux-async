import React from 'react'
let d3 = require('d3')

class D3Force extends React.Component {
  constructor(props) {
    super(props)
    this.svg = null
  }


  componentDidMount() {
    this.drawForce()
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

  drawForce() {
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

export default D3Force
