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
    // const transform = d3.event.transform
    // console.log(transform)
    // d3.select(this).attr('transform', `translate(${transform.x} , ${transform.y}) scale(${transform.k})`)
  }

  getZoom(d) {
    // d3.event.stopPropagation()
    // if (this.tagName === 'svg') {
    //   d3.selectAll('circle')
    //   .transition()
    //   .duration(1000)
    //   .attr('r', 15)
    // } else {
    //   d3.selectAll('circle')
    //     .transition()
    //     .duration(1000)
    //     .attr('r', (d, i, g) => {
    //       if (this === g[i]) {
    //         return 15 * 2
    //       } else {
    //         return 15 / 2
    //       }
    //     })
    // }
  }

  drawForce() {
    const width = 400
    const height = 400
    d3.select('#d3')
      .append('canvas')
      .attr('width', width)
      .attr('height', height)

    let canvas = document.querySelector('canvas')

    let context = canvas.getContext('2d')

    let nodes = [{ name: "桂林" }, { name: "广州" },
    { name: "厦门" }, { name: "杭州" },
    { name: "上海" }, { name: "青岛" },
    { name: "天津" }];

    let links = [{ source: 0, target: 1 }, { source: 0, target: 2 },
    { source: 0, target: 3 }, { source: 1, target: 4 },
    { source: 1, target: 5 }, { source: 1, target: 6 }];

    let simulation = d3.forceSimulation()
      .force('link', d3.forceLink())
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))

    simulation.nodes(nodes)
      .on('tick', ticked)

    simulation.force('link')
      .links(links)
      .distance(100)

    function ticked () {
      context.clearRect(0, 0, width, height)
      context.save()

      context.beginPath()

      links.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      })
      context.strokeStyle = "#aaa";
      context.stroke();

      context.beginPath();
      nodes.forEach(d => {
        context.moveTo(d.x + 3, d.y)
        context.arc(d.x, d.y, 3, 0, 2 * Math.PI)
      })
      context.fill()
      context.strokeStyle = '#fff'
      context.stroke()
      context.restore();

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
