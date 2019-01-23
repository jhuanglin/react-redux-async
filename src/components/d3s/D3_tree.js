import React from 'react'
import * as d3 from 'd3'

class D3Tree extends React.Component {
  constructor(props) {
    super(props)
    this.svg = null
    this.width = 600
    this.height = 500
    this.padding = {
      top: 20,
      left: 80,
      right: 50,
      bottom: 20
    }
  }

  componentDidMount() {
    this.drawTree()
  }

  drawTree() {
    let height = this.height
    let width = this.width
    let padding = this.padding

    // 创建新的树布局
    // 为每一个节点添加 x y坐标
    // size整个数的布局
    // nodeSize 节点尺寸的大小
    // separation 控制相邻节点的距离
    let tree = d3.tree().size([height, width]).separation((a, b) => {
      return a.parent === b.parent ? 1.5 : 2
    })
    // 添加svg
    let svg = d3.select('#d3Tree')
      .append('svg')
      .attr('width', width + this.padding.left + this.padding.right)
      .attr('height', 10)
      .append('g')
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`)

    // 获取数据
    let sourceData = require('../assets/learn.json')
    let root = d3.hierarchy(sourceData)
    root.x0 = height / 2
    root.y0 = 0
    tree(root)
    root.each((d, i) => {
      d.id = i
      d.y = d.depth * 180
      d._children = d.children
    })

    redraw(root)

    function redraw(source) {

      let left = root
      let right = root
      root.each((d) => {
        if(d.x < left.x) left = d
        if(d.x > right.x) right = d
      })

      let height = right.x - left.x + padding.top + padding.bottom
      const transition = d3.select('svg')
        .transition()
        .duration(500)
        .attr('height', height)
        .select('g')
        .attr('transform', `translate(${padding.left}, ${0})`)

      // 重新计算树的布局
      tree(root)

      // 扁平化数据 生成一个数组，每项都是每一个节点
      let nodes = root.descendants().reverse()
      // 返回节点的links数组，包含source(父节点)和target(子节点)属性
      let links = root.links()

      // data的第二个参数key，指定对应数据与元素的绑定，取代原本的按索引绑定
      // update节点
      let nodeUpdate = svg.selectAll('.node')
      .data(root.descendants(), d => {
        return d.data.name
      })

      // enter节点
      let nodeEnter = nodeUpdate.enter()

      // exit节点
      let nodeExit = nodeUpdate.exit()

      // 定位在父节点元素的坐标处
      let enterNodes = nodeEnter
        .append('g')
        .attr('class', 'node')
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .attr('transform', d => `translate(${source.y}, ${source.x} )`)
        .on('click', d => {
          d.children = d.children ? null : d._children
          redraw(d)
        })

      // 添加circle
      enterNodes.append('circle')
        .attr('r', '0')
        .attr('fill', d => {
          return d._children && !d.children ? 'steelblue' : '#fff'
        })
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '2')

      // 添加text
      enterNodes.append('text')
        .attr('x', d => d.children || d._children ? '-16' : '16')
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
        .attr('fill', '#ccc')
        .attr('font-size', '12')
        .text(d => {
          return d.data.name
        })

      // ！update节点与enter节点合并
      // 进行状态过度
      let updateNodes = nodeUpdate.merge(enterNodes)
        .transition(transition)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1)
        .attr('transform', d => `translate(${d.y}, ${d.x})`)

      updateNodes.select('circle')
        .attr('r', 8)
        .attr('fill', d => d._children && !d.children ? 'steelblue' : '#fff')
      nodeExit
        .transition(transition)
        .attr("transform", `translate(${source.y}, ${source.x})`)
        .remove()

      nodeExit.select('circle')
        .transition()
        .duration(400)
        .attr('r', 0)
      nodeExit.select('text')
        .transition()
        .duration(400)
        .attr('fill-opacity', 0)

      let linkUpdate = svg.selectAll('.link')
        .data(links, d => {
          return d.target.data.name
        })

      let linkEnter = linkUpdate.enter()

      // enter 连线 路径从从父节点的节点过度到target的位置
      let enterlinks = linkEnter.insert('path', '.node')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', '1.5')
        .attr("d", d3.linkVertical()
        .x(d => source.y)
        .y(d => source.x))

      linkUpdate
        .merge(enterlinks)
        .transition(transition)
        .attr('d',
          d3.linkVertical()
            .x(d => d.y)
            .y(d => d.x)
        )

      let linkExit = linkUpdate.exit()
          .transition(transition)
          .attr("d", d3.linkVertical()
            .x(d => source.y)
            .y(d => source.x)
          )
        .remove()
    }


    // function tree(root) {
    //   const root = d3.hierarchy(data)
    //   root.x0 = height / 2
    //   root.y0 = 0
    //   return d3.tree().size([height, width]).separation((a, b) => {
    //     return (a.parent === b.parent) ? 1 : 2
    //   })(root)
    // }
  }

  render() {
    return (
      <div id='d3Tree'>
      </div>
    )
  }
}

export default D3Tree
//
