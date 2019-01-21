import React from 'react'
import * as d3 from 'd3'
import './assets/d3_data.css'

class D3Data extends React.Component{
  constructor(props) {
    super(props)

    this.svg = null
    this.width = 960
    this.height = 500
    this.g = null

    this.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

    this.update = this.update.bind(this)
  }

  componentWillMount() {
    console.log('mounting...')
  }
  componentDidMount() {
    console.log('mounted...')
    this.draw()
  }

  draw() {
    this.svg = d3.select('#d3_d')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)

    this.g = this.svg.append('g')
      .attr('transfrom', `translate(32, ${this.height / 2})`)

    this.update(this.alphabet)

    this.timer = setInterval(() => {
      let data = d3.shuffle(this.alphabet).slice(0, Math.floor(Math.random() * 26)).sort
      ()
      this.update(data)
    }, 1500)

  }

  update(data) {
    if (this.g) {
      let texts = this.g.selectAll('text')
        .data(data)

      // texts.data() // return update selection

      texts.attr('class', 'update')

      texts.exit()
        .attr('opacity', '1')
        .transition()
        .duration(1000)
        .attr('opacity', '0')
        .remove()
      texts.enter()
        .append('text')
        .attr('class', 'enter')
        .attr('x', (d, i) => i * 32)
        .attr('dy', '1em')
        .merge(texts)
        .text(d => d)

      }
  }

  render() {
    return (
      <div id="d3_d"></div>
    )
  }
}

export default D3Data
