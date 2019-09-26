
/**
 *
 * 这里放的是业务代码
 */
import ForceCanvas from './force.canvas'
import * as d3 from 'd3'

// 自定义事件调用方法
// d3.select('body').dispatch('事件名', { detail: {}})


// d3.select('body').dispatch('show_path', { detail: {
//   show_path: {vertexes: ['test/center'], edges: []}
// }})

class ForceBusiness extends ForceCanvas {
  constructor(ele, options) {
    super(ele, options)
    this.state = {}
    if(!Object.__proto__) { // 兼容ie10
      ForceCanvas.call(this, ele, options)
    }
  }

  init(globalData) {
    if (globalData) {
      this.globalData = globalData
    }
    this
      ._preloadImg()
      ._preprocessData()
      ._initChartLayer()
      ._initForce()
      .render()
      .bindEvents()
      .bindCustomizeEvents()
      .bindContextmenu()

    this.canvas.on('mouseup', this.onmouseup.bind(this))
  }


  bindCustomizeEvents() {
    /** 自定义事件 */
    // d3.select('body').on('')
    d3.select('body').on('show_path', this.showPath.bind(this))
      .on('hide_vertex', () => { // 隐藏实体
        this.hideVertex(d3.event.detail.vertex)
      }).on('show_vertex', () => { // 取消隐藏实体
        this.showVertex(d3.event.detail.vertex)
      }).on('mark_vertex', () => { // 标记实体
        this.markVertex(d3.event.detail.vertex)
      }).on('unmark_vertex', () => { // 取消标记实体
        this.unmarkVertex(d3.event.detail.vertex)
      }).on('graph_filter', () => { // 实体过滤、关系过滤
        this.filterGraphData(d3.event.detail)
      }).on('select_click_vertex', () => { // 图内实体搜索框中选中节点
        this.clickVertex(d3.event.detail.vertex)
      })

    return this
  }

  bindContextmenu() {
    document.getElementById('graph').oncontextmenu = function(e) {
      return false
    }
    return this
  }

  onmouseup (e) {
    if (d3.event.button === 2) {
      const x = this.transform.invertX(d3.event.x)
      // 兼容IE，使用原生pageY
      const y = this.transform.invertY(d3.event.pageY)
      let target = null

      this.chart.vertexes.some(v => {
        const isInVertexFlag = this.utils.isInVertex(v, {x, y})
        if (isInVertexFlag) {
          target = {}
          for (let key in v) {
            target[key] = v[key]
          }
          target.x = this.transform.applyX(v.x)
          target.y = this.transform.applyY(v.y)
          target.radius = target.radius * this.transform.k
        }
        return isInVertexFlag
      })
      if (this.redux && this.redux.setRightClickTarget && target) {
        this.redux.setRightClickTarget({...target, scale: this.transform.k})
      }
    }

  }

  showPath() {
    if (!d3.event.detail.show_path) {
      this.globalData.highLightParam.pathEvent = false
      this.changeClickHighlightStyle(null)
        // .draw()
      return
    }

    const vertexIds = d3.event.detail.show_path.vertexes || []
    const edgeIds = d3.event.detail.show_path.edges || []

    this.globalData.highLightParam.pathEvent = true
    this.resetShowOrHideVertex()

    this.chart.edges.forEach(e => {
      e.is_in_path = edgeIds.includes(e._id)
    })

    this.chart.vertexes.forEach(v => {
      v.is_in_path = vertexIds.includes(v._id)
    })
    this.draw()
  }

  // 重置经过显示、隐藏操作
  resetShowOrHideVertex() {
    this.chart.edges.forEach((e) => {
      if(e.uiConfig._color) {
        e.uiConfig.color = e.uiConfig._color
      }
      delete e.uiConfig._color
      delete e.uiConfig.is_fade
      delete e.filterEvent
    })
    this.chart.vertexes.forEach((v) => {
      if(v.uiConfig._color) {
        v.uiConfig.color = v.uiConfig._color
      }
      delete v.uiConfig._color
      delete v.uiConfig.is_fade
      delete v.uiConfig.isHide
      delete v.filterEvent
    })
  }

  hideVertex (vertex) {
    if (this.globalData.highLightParam.pathEvent || this.globalData.highLightParam.filterEvent) {
      return
    }
    const hideColor = '#dcdcdc'
    vertex.uiConfig = vertex.uiConfig || {}
    vertex.uiConfig._color = vertex.uiConfig.color
    vertex.uiConfig.color = hideColor
    vertex.uiConfig.is_fade = true
    vertex.uiConfig.isHide = true
    this.chart.edges.forEach((e) => {
      if (e._from === vertex._id || e._to === vertex._id) {
        e.uiConfig = e.uiConfig || {}
        if (!('_color' in e.uiConfig)) {
          e.uiConfig._color = e.uiConfig.color
        }
        e.uiConfig.color = hideColor
      }
    })
    this.draw()
  }

  showVertex (vertex) {
    if (this.globalData.highLightParam.pathEvent || this.globalData.highLightParam.filterEvent) {
      return
    }
    vertex.uiConfig.color = vertex.uiConfig._color
    vertex.uiConfig.is_fade = false
    vertex.uiConfig.isHide = false
    delete vertex.uiConfig._color

    this.chart.edges.forEach((e) => {
      if (e._from === vertex._id || e._to === vertex._id) {
        e.uiConfig.color = e.uiConfig._color
        delete e.uiConfig._color
      }
    })
    this.draw()
  }

  markVertex (vertex) {
    vertex.uiConfig = vertex.uiConfig ? vertex.uiConfig : {}
    vertex.uiConfig.isMark = true
    this.draw()
  }

  unmarkVertex (vertex) {
    vertex.uiConfig.isMark = false
    this.draw()
  }

  filterGraphData(info) {
    this.resetShowOrHideVertex()
    this.globalData.highLightParam.filterEvent = !info.isAll

    if (info.isAll) {
      this.draw()
      return
    }

    const filterColor = '#dcdcdc';

    ['vertexes', 'edges'].map(key => {
      this.chart[key].forEach(d => {
        let type = (d.schemaInfo || {}).schemaName
        d.filterEvent = true
        if(!info.filter[key].includes(type)) {
          d.uiConfig._color = d.uiConfig.color
          d.uiConfig.color = filterColor
          d.uiConfig.is_fade = true
          d.filterEvent = false
        }else {
          d.uiConfig.color = d.uiConfig._color ? d.uiConfig._color : d.uiConfig.color
          d.uiConfig.is_fade = false
          delete d.uiConfig._color
        }
      })
    })
    this.draw()
  }

  getAllGraphData = () => {
    return this.chart
  }

  redrawEvent = () => {
    d3.select('body').dispatch('redrawThumbnail')
    d3.select('body').dispatch('animationReStart', {detail: {}})
  }

  zoomChange = (transform) => {
    d3.select('body').dispatch('redrawThumbnailOperation', {detail: {transform}})
    d3.select('body').dispatch('animationReStart', {detail: {transform}})
  }

  /* 搜索框选中节点，节点居中显示
   * 缩放比例小于1，重置为1
   */
  clickVertex = (v) => {
    let { options } = this
    if (this.transform.k < 1) {
      this.transform.k = 1
      this.options.onZoom(this.transform)
    }

    // 中心点偏移到选中节点
    let w = (options.width + options.canvasShift[0] ) / 2
    let h = (options.height + options.canvasShift[1]) / 2
    let offsetX = w - v.fx * this.transform.k
    let offsetY = h - v.fy * this.transform.k
    this.transform.x = offsetX
    this.transform.y = offsetY

    this.changeClickHighlightStyle(v)
    this.draw()
  }
}

export default ForceBusiness
