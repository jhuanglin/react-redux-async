import React from 'react'
import * as d3 from 'd3'
import '../assets/d3_force_add.scss'

class D3AddNode extends React.Component{
  constructor(props){
    super(props)
    this.svg = null

    this.width = 600
    this.height = 300

    this.cursor = null

    this.util = this.generateUtil()
  }

  componentDidMount() {
    this.svg = d3.select('#d3')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)

    this.draw()
  }

  generateUtil () {
    let _this = this
    return {
      mousemove() {
        _this.cursor && _this.cursor.attr('transform', `translate(${d3.mouse(this)})`)
      }
    }
  }

  draw() {
    const width = this.width
    const height = this.height
    let svg = this.svg
    this.svg.on('mousemove', this.util.mousemove)
      .on('mousedown', mousedown)

    // let nodes = d3.range(10).map(() => {})
    let nodes = [{}]
    let links = []
    let simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).distance(10).strength(1))
      .force('charge', d3.forceManyBody().strength(40))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(20).strength(.7)) // 碰撞力
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .on('tick', ticked)
    console.log(links)

    this.cursor = this.svg.append('circle')
      .attr('r', 30)
      .attr('transform', `translate(-100, -100)`)
      .attr('class', 'cursor')

    restart()

    function mousedown() {
      let point = d3.mouse(this)
      let n = {
        x: point[0],
        y: point[1]
      }
      nodes.push(n)

      nodes.forEach((target) => {
        var x = target.x - n.x
        var y = target.y - n.y
        if (Math.sqrt(x * x + y * y) < 30) {
          links.push({
            source: n,
            target: target
          })
        }
      })

      restart()
    }

    function ticked() {
      svg.selectAll('.node')
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })

      svg.selectAll('.link')
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; })
    }

    function restart() {
      svg
        .selectAll('.node')
        .data(nodes)
        .enter()
        .insert('circle', '.cursor')
        .attr('class', 'node')
        .attr('r', 5)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
        )

      svg.selectAll('.link')
        .data(links)
        .enter()
        .insert('line', '.node')
        .attr('class', 'link')

      simulation.nodes(nodes)
      simulation.alpha(1).restart()
    }

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
  }

  render() {
    return (
      <div id="d3" className='d3_force_add'>
      </div>
    )
  }

}

export default D3AddNode
