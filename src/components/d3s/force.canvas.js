/**
 * @desc: {力图绘制组件, canvas}
 * @author: xieyuzhong
 * @Date: 2018-12-17 16:20:50
 * @Last Modified by: linjianhuang
 * @Last Modified time: 2019-09-24 14:52:39
 *
 *  调用方式:
 *  const force = new ForceCanvas(<element>, {
 *    data: chartData // { vertexes: [], edges: [] }
 *  })
 *  force.init()
 *
 * <element>:
 *  可为 DOM 元素，也可为 d3 selection
 *
 * 配置参数:
 * {
 *   data: { vertexes: [...], edges: [...] } // 必传
 *   r,
 *   distance
 * }
 *
 * 性能优化手段：
 * 1. 离屏绘制
 *  1.1 节点 & icon
 * 2. 通过计算和判断，避免无谓的绘制操作【需要计算图实际区域，以计算 transform，难以实现】
 * 3. 调整绘图 API 的调用顺序【done】
 * 4. 分层
 *  4.1 拖拽时分层，变化节点单独一层绘制
 * 5. 图片预加载【done】
 * 6. 节点过多时，砍掉复杂结构，如 icon
 */
import * as d3 from 'd3'
// 可视化配置的icon 映射
export const ICON_MAP = {
  '1': 'icon-VisualIcon1', '2': 'icon-VisualIcon2', '3': 'icon-VisualIcon3', '4': 'icon-VisualIcon4', '5': 'icon-VisualIcon5',
  '6': 'icon-VisualIcon6', '7': 'icon-VisualIcon7', '8': 'icon-VisualIcon8', '9': 'icon-VisualIcon9', '10': 'icon-VisualIcon10',
  '11': 'icon-VisualIcon11', '12': 'icon-VisualIcon12', '13': 'icon-VisualIcon13', '14': 'icon-VisualIcon14', '15': 'icon-VisualIcon'
}
export const EDGE_LINE_WIDTH_MAP = {
  1: 3,
  2: 2,
  3: 1,
  'xSmall': 1,
  'small': 1,
  'normal': 1,
  'large': 1,
  'xLarge': 1,
}

const _default = {
  width: window.innerWidth,
  height: window.innerHeight,
  data: { vertexes: [], edges: [] },
  theme: 'deep', // 默认撞色主题
  edgeColor: '#4FA2F1',
  radius: 24, // 节点默认大小
  vertexColor: '#82C896',
  lineWidth: 1,
  boldLineWidth: 2, // 数据需要鼠标悬浮时高亮路径时的路径线条粗细
  fontSize: 10,
  optimizeVertexThreshold: 500,
  // fontFamily: 'PingFang SC, Microsoft YaHei, Helvetica, Arial, Verdana, sans-serif',
  fontFamily: 'character, PingFang SC, Microsoft YaHei, Helvetica, Arial, Verdana, sans-serif',
  displayTextThreshold: 0.5,  // 字体展示的缩放阈值，默认放大到 0.5 倍时才展示节点中的文字
  arrowLength: 5,  // 箭头斜边长度
  arrowDt: Math.PI / 6,  // 箭头斜边与边的夹脚
  scaleExtent: [0.1, 2],
  canvasShift: [0, 0],  // left, top shift
  vertexIcons: Object.values(ICON_MAP), // 节点 icon 类型
  highlightEdgeWidth: 4,
  // 深浅主题对应的节点颜色
  light: {
    vertex: '#4FA2F1',
    edge: '#64C69F',
    centerVertex: '#EF4772'
  },
  deep: {
    vertex: '#82C896',
    edge: '#4FA2F1'
  },
  mix: {
    vertex: '#82C896',
    edge: '#4FA2F1'
  },
  pure: {
    vertex: '#82C896',
    edge: '#4FA2F1'
  },
  // 指示标签颜色配置
  tagMap: {
    // 是否黑名单
    is_blacklist: {
      color: '#000',
      shiftX: '-'
    },
    is_black: {
      color: '#000',
      shiftX: '-'
    },
    is_Black: {
      color: '#000',
      shiftX: '-'
    },
    // 是否行内客户
    belong_inner: {
      color: '#60A1F1',
      shiftX: '0'
    },
    // 是否异常状态
    is_abnormal_status: {
      color: '#D0021B',
      shiftX: '+'
    }
  },
  onRenderEnd: () => { },
  onClickVertex: () => { },
  onClickEdge: () => { },
  onZoom: () => { }
  // COMPANY_COLOR: '#63A3EF',
  // PERSON_COLOR: '#9BCB70'
}
const SQRT2 = Math.sqrt(2)
const PI2 = Math.PI * 2

class ForceCanvas {
  constructor(ele, options) {
    this.options = Object.assign({}, _default, options)
    // 拖动窗口 _default 里没有改变大小 jerry
    this.options.width = window.innerWidth
    this.options.height = window.innerHeight

    this.ele = ele.node ? ele.node() : ele
    this.canvas = d3.select(this.ele)
    this.ctx = this.ele.getContext('2d')
    this.chart = this.options.data

    this.transform = d3.zoomIdentity
    this.utils = utils
    this.images = {}
    this.currentCtxStyle = {} // 暂存绘图上下文属性，防止重复设置，提升性能

    this.sinDt = Math.sin(this.options.arrowDt)
    this.cosDt = Math.cos(this.options.arrowDt)
    this.isRenderEnd = false
  }

  globalData = {
    // 多种高亮情况区分
    highLightParam: {
      pathEvent: false,
    }
  }

  init () {
    this
      ._preloadImg()
      ._preprocessData()
      ._initChartLayer()
      ._initForce()
      .render()
      .bindEvents()
  }

  _preprocessData () {
    const degreeMap = {}
    this.chart.edges.forEach((e) => {
      e.source = e._from
      e.target = e._to
      degreeMap[e._from + e._to] = (degreeMap[e._from + e._to] || 0) + 1
      degreeMap[e._to + e._from] = (degreeMap[e._to + e._from] || 0) + 1
      e.degreeIdx = degreeMap[e._from + e._to]
    })
    this.chart.edges.forEach((e) => {
      e.degree = degreeMap[e._from + e._to]
    })

    const vIdSet = new Set()

    this.chart.vertexes.forEach((v) => {
      // 储存节点类型：公司 || 自然人
      v._type = v._type || (v._id.includes('/') && v._id.split('/')[0])
      // 储存节点大小
      vIdSet.add(v._id)
      v.radius = this.getRadius(v)
      // if ( v._tag === 'START') {
      //   if (!v.x && !v.fx) {
      //     v.x = this.options.width / 2  - this.options.canvasShift[0] / 2
      //     v.y = this.options.height / 2 - this.options.canvasShift[1] / 2
      //     v.fx = this.options.width / 2 - this.options.canvasShift[0] / 2
      //     v.fy = this.options.height / 2 - this.options.canvasShift[1] / 2
      //   }
      // }

    })

    this.chart.edges = this.chart.edges.filter(e => vIdSet.has(e._from) && vIdSet.has(e._to))

    return this
  }

  _initChartLayer () {
    const { ctx, options } = this
    this.canvas.attr('width', options.width)
      .attr('height', options.height)

    ctx.font = options.fontSize + 'px ' + options.fontFamily  // 设置全局字体大小
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = this.getBackgroundColor(options.theme)
    ctx.lineCap = 'round'
    this.options.onClickOutside(true)

    return this
  }

  _initForce () {
    const { options, chart } = this
    let alphaDecay = 0.08
    let maxDistance = 500
    const vertexNum = chart.vertexes.length
    if (vertexNum > 500) {
      maxDistance = 2000
    } else if (vertexNum > 200) {
      maxDistance = 1200
    } else if (vertexNum > 10) {
      maxDistance = 800
    }
    if (vertexNum > 15) {
      alphaDecay = 0.04
    }
    this.simulation = d3.forceSimulation()
      .alphaDecay(alphaDecay)
      .force('link', d3.forceLink().id((d) => d._id).distance((d) => this.getDistance(d)))
      .force('charge', d3.forceManyBody().strength(-1000).distanceMin(200).distanceMax(maxDistance))
      .force('center', d3.forceCenter((options.width - options.canvasShift[0]) / 2, (options.height - options.canvasShift[1]) / 2))
      .force('collision', d3.forceCollide().radius((d) => d.radius * 2)) // 节点斥力

    return this
  }

  render () {
    // console.time('graph')
    if (this.chart.vertexes.length > 0) {
      d3.select('body').dispatch('loading', {detail: {loading: true, loadingTest: '生成图谱中'}})
    }
    this.simulation.nodes(this.chart.vertexes)
    this.simulation.on('tick', this.draw.bind(this))
      .on('end', () => {
        this.chart.vertexes.forEach((v) => {
          v.fx = v.x
          v.fy = v.y
        })
        if (!this.isRenderEnd) {
          this.isRenderEnd = true

          // 中心偏移
          const centerNode = this.chart.vertexes.find(v => v._tag === 'START')
          if (centerNode && !this.options.transform) {
            let w = (this.options.width + this.options.canvasShift[0] ) / 2
            let h = (this.options.height + this.options.canvasShift[1]) / 2
            let offsetX = w - centerNode.fx
            let offsetY = h - centerNode.fy
            this.transform.x = offsetX
            this.transform.y = offsetY
            // console.timeEnd('graph')
          }
          // 中心偏移
          d3.select('body').dispatch('loading', {detail: {loading: false, loadingTest: ''}})
          this.draw()
        }

        this.options.onRenderEnd()

        // console.timeEnd('graph')
      })

    this.simulation.force('link')
      .links(this.chart.edges)

    return this
  }

  draw (opts = {}) {
    if(!this.isRenderEnd) {
      return this
    }
    Object.assign(this.options, opts)
    const { ctx, options, chart, transform, currentCtxStyle } = this
    ctx.save()
    ctx.clearRect(0, 0, options.width, options.height)
    this.ctx.beginPath()
    this.ctx.rect(0, 0, options.width, options.height)
    // this.ctx.fill()
    // 优化，超出可视范围不绘制，提高绘制性能
    // 是否绘制不清楚，但是坐标肯定是计算了的。进一步优化需要计算节点是否超出视窗外
    this.ctx.clip();
    // 优化，超出可视范围不绘制，提高绘制性能

    this.ctx.beginPath()
    ctx.translate(this.transform.x, this.transform.y)
    ctx.scale(this.transform.k, this.transform.k)

    ctx.lineWidth = options.lineWidth

    currentCtxStyle.strokeStyle = ''
    for (let i = 0, length = chart.edges.length; i < length; i++) {
      const e = chart.edges[i]
      const sourcePos = utils.getScreenPosition(e.source.x, e.source.y, transform)
      const targetPos = utils.getScreenPosition(e.target.x, e.target.y, transform)
      if (utils.edgeOutOfWindow(sourcePos, targetPos)) {
        continue
      }
      this.drawEdge(e, e.degree > 1 ? 'curve' : 'line')
    }
    currentCtxStyle.fillStyle = ''
    if (transform.k > options.displayTextThreshold) {
      for (let i = 0, length = chart.edges.length; i < length; i++) {
        const e = chart.edges[i]
        const sourcePos = utils.getScreenPosition(e.source.x, e.source.y, transform)
        const targetPos = utils.getScreenPosition(e.target.x, e.target.y, transform)
        if (utils.edgeOutOfWindow(sourcePos, targetPos)) {
          continue
        }
        let directed = true
        if (e.schemaInfo && e.schemaInfo.directed !== undefined) {
          directed = e.schemaInfo.directed
        }
        if (e.degree > 1) {
          if (e.label) {
            const dist = Math.sqrt(Math.pow(e.source.x - e.target.x, 2) + Math.pow(e.source.y - e.target.y, 2))
            const labelLength = ctx.measureText(e.label).width
            this.drawCurveLable(e, (dist - labelLength) / 2, e.source.x, e.source.y, e.ctrlX, e.ctrlY, e.target.x, e.target.y)
          }
          directed && this.drawCurveArrow(e)
        } else {
          directed && this.drawArrow(e)
          this.drawEdgeLabel(e)
        }
      }
    }

    ctx.lineWidth = 2
    currentCtxStyle.fillStyle = ''
    for (let i = 0, length = chart.vertexes.length; i < length; i++) {
      const v = chart.vertexes[i]
      const pos = utils.getScreenPosition(v.x, v.y, transform)
      if (utils.vertexOutOfWindow(pos)) {
        continue
      }
      this.highlightCurrentVertex(v)
      this.drawVertex(v)  // todo: 使用离屏绘制提升性能
      this.drawVertexMark(v)
    }
    if (transform.k > options.displayTextThreshold) {
      for (let i = 0, length = chart.vertexes.length; i < length; i++) {
        const v = chart.vertexes[i]
        const pos = utils.getScreenPosition(v.x, v.y, transform)
        if (utils.vertexOutOfWindow(pos)) {
          continue
        }
        this.drawVertexText(v)
      }
    }
    ctx.restore()
    if (this.redrawEvent && typeof this.redrawEvent === 'function') {
      this.redrawEvent()
    }
  }

  _calcShiftPos = (pos, edge) => {
    const { degree, degreeIdx } = edge
    const shiftPos = { x: pos.x, y: pos.y }
    if ((degree + 1) / 2 === degreeIdx) { // 只有一条边或奇数条边的中间那条，大多数情况
      return shiftPos
    }
    const alpha = Math.atan(Math.abs(edge.target.y - edge.source.y) / Math.abs(edge.target.x - edge.source.x))
    let shift = this.options.radius / 2  // 偏移距离，两点之间超过 5 条边会有问题
    if (degree === 2) {
      shift = this.options.radius
    } else if (degree === 3) {
      shift = this.options.radius / 3 * 2
    }
    const d = (degreeIdx - ((degree + 1) / 2)) * shift
    const flag = (edge.target.y - edge.source.y) * (edge.target.x - edge.source.x) < 0 ? 1 : -1
    shiftPos.x += Math.sin(alpha) * d * flag
    shiftPos.y += Math.cos(alpha) * d
    return shiftPos
  }

  drawEdge (d, type = 'line') {
    const { ctx, currentCtxStyle } = this
    ctx.lineWidth = this.getLineWidth(d)
    ctx.beginPath()
    ctx.moveTo(d.source.x, d.source.y)
    if (type === 'line') {
      ctx.lineTo(d.target.x, d.target.y)
    } else if (type === 'curve') {
      const [ctrlX, ctrlY] = this.getControlPoint(d)
      d.ctrlX = ctrlX
      d.ctrlY = ctrlY
      ctx.quadraticCurveTo(ctrlX, ctrlY, d.target.x, d.target.y)
    }
    const strokeStyle = this.getColor(d, 'edge')
    if (currentCtxStyle.strokeStyle !== strokeStyle) {
      ctx.strokeStyle = strokeStyle
      currentCtxStyle.strokeStyle = strokeStyle
    }
    ctx.stroke()
    ctx.closePath()
  }

  getControlPoint (d) {
    const { source, target } = d
    const centerX = Math.min(source.x, target.x) + Math.abs(source.x - target.x) / 2
    const centerY = Math.min(source.y, target.y) + Math.abs(source.y - target.y) / 2
    let ctrlX = centerX // d.degree = 1时，为中点
    let ctrlY = centerY

    if (d.degree !== 1) {
      const alpha = Math.atan(Math.abs(centerY - source.y) / Math.abs(centerX - source.x))
      const SHIFT = 25 // 单位控制点偏移距离，可调
      let shift = 0
      if (d.degree % 2) { // 两点间奇数条边
        shift = Math.pow(-1, d.degreeIdx) * Math.floor(d.degreeIdx / 2) * SHIFT
      } else {
        shift = Math.pow(-1, d.degreeIdx - 1) * Math.ceil(d.degreeIdx / 2) * SHIFT
      }


  spreadGraphAni () {
    const { ctx, options, chart } = this
    let centerX = (options.width + options.canvasShift[0] ) / 2
    let centerY = (options.height + options.canvasShift[1]) / 2
    const centerNode = chart.vertexes.find(v => v._tag === 'START')

    const iR = centerNode.radius
    const oR = window.innerWidth

    let startAngle = 0
    requestAnimationFrame(ra.bind(this))

    function ra() {
      this.draw()
      ctx.save()
      ctx.fillStyle = this.getBackgroundColor(options.theme)
      ctx.beginPath()

      ctx.translate(centerX, centerY)

      d3.arc()
      .innerRadius(iR)
      .outerRadius(oR)
      .startAngle(startAngle)
      .endAngle(2 * Math.PI)
      .context(ctx)(null)

      ctx.fill()
      ctx.restore()
      startAngle += 0.03 * Math.PI
      if (startAngle <= 2 * Math.PI) {
        requestAnimationFrame(ra.bind(this))
      } else {
        this.draw()
        if (this.redrawEvent && typeof this.redrawEvent === 'function') {
          this.redrawEvent()
        }
      }
    }
  }
      const deltaX = shift * Math.sin(alpha)
      const deltaY = shift * Math.cos(alpha)

      const shouldSwap = (source.x > target.x && source.y > target.y) || (source.x < target.x && source.y < target.y)
      ctrlX += deltaX
      ctrlY += deltaY * (shouldSwap ? -1 : 1) // 防止拖拽至 2、4 象限时合成一条线
    }

    return [ctrlX, ctrlY]
  }

  drawArrow (d) {
    const { ctx, options, currentCtxStyle } = this
    const srcShiftPos = d.source
    const dstShiftPos = d.target

    ctx.beginPath()
    const alpha = Math.atan2(dstShiftPos.x - srcShiftPos.x, dstShiftPos.y - srcShiftPos.y)
    const dt = options.arrowDt  // 箭头与边的夹角
    const lineWidth = this.getLineWidth(d)
    const arrowLength = options.arrowLength + lineWidth

    // 修正值，有外环的时候距离宽一点
    const CorrectionValue = (d.target.fieldUiConfigs || []).find(item => item.coverable === 'N') ? 4 : 0
    const CorrectionCurrent = d.target.is_current ? 7 : CorrectionValue

    // 边的终点减去节点半径，为箭头绘制起点
    const endX = dstShiftPos.x - (Math.sin(alpha) * (d.target.radius + CorrectionCurrent - lineWidth))
    const endY = dstShiftPos.y - (Math.cos(alpha) * (d.target.radius + CorrectionCurrent - lineWidth))
    ctx.moveTo(endX, endY)
    ctx.lineTo(endX - (Math.sin(alpha - dt) * arrowLength), endY - (Math.cos(alpha - dt) * arrowLength))
    ctx.lineTo(endX - (Math.sin(alpha + dt) * arrowLength), endY - (Math.cos(alpha + dt) * arrowLength))
    const fillStyle = this.getColor(d, 'edge')
    if (currentCtxStyle.fillStyle !== fillStyle) {
      ctx.fillStyle = fillStyle
      currentCtxStyle.fillStyle = fillStyle
    }
    ctx.fill()

    return this
  }

  drawEdgeLabel (d) {
    if (!d.label) {
      return this
    }
    const { ctx, options } = this

    const srcShiftPos = d.source
    const dstShiftPos = d.target

    ctx.save()  // 后面会旋转 ctx，以绘制斜边
    const dy = dstShiftPos.y - srcShiftPos.y
    const dx = dstShiftPos.x - srcShiftPos.x
    if (dx > 0) {
      ctx.translate(srcShiftPos.x, srcShiftPos.y)
      ctx.rotate(Math.atan2(dy, dx))
    } else {
      ctx.translate(dstShiftPos.x, dstShiftPos.y)
      ctx.rotate(Math.PI + Math.atan2(dy, dx))
    }
    const middleX = Math.sqrt((dx * dx) + (dy * dy)) / 2
    let textWidth = 0
    if (this.chart.vertexes.length > options.optimizeVertexThreshold) {
      textWidth = d.label.length * options.fontSize
    } else {
      textWidth = d.label ? this.ctx.measureText(d.label).width + 10 : 0
    }
    // 文字背景
    ctx.fillStyle = this.getBackgroundColor(options.theme)
    ctx.fillRect(middleX - (textWidth / 2), -options.fontSize / 2, textWidth, options.fontSize)
    // 文字
    ctx.fillStyle = this.getColor(d, 'edge', 'text')
    ctx.fillText(d.label, middleX, 0)
    ctx.restore()

    return this
  }

  drawCurveLable (e, offset, x1, y1, x2, y2, x3, y3, x4, y4) {
    const text = e.label
    const { ctx, transform, options } = this
    if (x1 > x3) {
      [x1, x3] = [x3, x1];
      [y1, y3] = [y3, y1]
    }
    const k = transform.k
    x1 = x1 + transform.x / k
    x2 = x2 + transform.x / k
    x3 = x3 + transform.x / k
    y1 = y1 + transform.y / k
    y2 = y2 + transform.y / k
    y3 = y3 + transform.y / k
    ctx.save()
    ctx.textAlign = "center"
    var widths = []
    for (var i = 0; i < text.length; i++) {
      widths[i] = ctx.measureText(text[i]).width
    }
    var ch = utils.curveHelper(x1, y1, x2, y2, x3, y3, x4, y4)
    var pos = offset
    var cpos = 0

    ctx.fillStyle = this.getBackgroundColor(options.theme)
    for (let i = 0; i < text.length; i++) {
      pos += widths[i] / 2
      cpos = ch.forward(pos)
      ch.tangent(cpos)

      ctx.setTransform(ch.vect.x * k, ch.vect.y * k, -ch.vect.y * k,
        ch.vect.x * k, ch.vec.x * k, ch.vec.y * k)
      ctx.fillRect(-widths[i], -options.fontSize / 2, widths[i] * 2, options.fontSize)

      pos += widths[i] / 2
    }

    pos = offset
    ch = utils.curveHelper(x1, y1, x2, y2, x3, y3, x4, y4)
    ctx.fillStyle = this.getColor(e, 'edge', 'text')
    for (let i = 0; i < text.length; i++) {
      pos += widths[i] / 2
      cpos = ch.forward(pos)
      ch.tangent(cpos)

      ctx.setTransform(ch.vect.x * k, ch.vect.y * k, -ch.vect.y * k,
        ch.vect.x * k, ch.vec.x * k, ch.vec.y * k)
      ctx.fillText(text[i], 0, 0)

      pos += widths[i] / 2
    }
    ctx.restore()

    return this
  }

  drawCurveArrow (d) {
    const { ctx, transform, options } = this
    const k = transform.k
    let x1 = d.source.x
    let y1 = d.source.y
    let x2 = d.ctrlX
    let y2 = d.ctrlY
    let x3 = d.target.x
    let y3 = d.target.y
    x1 = x1 + transform.x / k
    x2 = x2 + transform.x / k
    x3 = x3 + transform.x / k
    y1 = y1 + transform.y / k
    y2 = y2 + transform.y / k
    y3 = y3 + transform.y / k
    ctx.save()
    const ch = utils.curveHelper(x3, y3, x2, y2, x1, y1)  // 箭头从 target 开始
    // 修正值，有外环的时候距离宽一点
    const CorrectionValue = (d.target.fieldUiConfigs || []).find(item => item.coverable === 'N') ? 4 : 0
    const CorrectionCurrent = d.target.is_current ? 7 : CorrectionValue
    const lineWidth = this.getLineWidth(d)
    // const lineWidth = 1
    const pos = d.target.radius + CorrectionCurrent - lineWidth
    let cpos = ch.forward(pos)
    ch.tangent(cpos)

    ctx.setTransform(ch.vect.x * k, ch.vect.y * k, -ch.vect.y * k,
      ch.vect.x * k, ch.vec.x * k, ch.vec.y * k)
    ctx.beginPath()

    let arrowLength = options.arrowLength + lineWidth * 1
    const { sinDt, cosDt } = this
    arrowLength += lineWidth === 1 ? 0 : lineWidth
    ctx.moveTo(0, 0)
    ctx.lineTo(cosDt * arrowLength, -sinDt * arrowLength)
    ctx.lineTo(cosDt * arrowLength, sinDt * arrowLength)
    const fillStyle = this.getColor(d, 'edge')
    ctx.fillStyle = fillStyle
    ctx.fill()

    ctx.restore()

    return this
  }

  drawVertex (d) {
    const { ctx, options, transform, chart, currentCtxStyle } = this

    const radius = d.radius
    const vertexColor = this.getColor(d, 'vertex')

    const vertexStrokeColor = this.getVertexStrokeColor(d)
    // if (utils.isStartOrEnd(d)) {
    //   ctx.beginPath()
    //   ctx.moveTo(d.x + radius + 12, d.y)  // 光晕半径比实体半径大 12px
    //   ctx.arc(d.x, d.y, radius + 12, 0, PI2)
    //   ctx.fillStyle = utils.fadeColor(vertexColor)
    //   ctx.fill()
    // }
    ctx.beginPath()
    ctx.moveTo(d.x + radius, d.y)
    ctx.arc(d.x, d.y, radius, 0, PI2)
    ctx.fillStyle = vertexColor
    currentCtxStyle.fillStyle = vertexColor
    ctx.fill()

    // tags
    if (transform.k < options.displayTextThreshold * 0.8
      && chart.vertexes.length > options.optimizeVertexThreshold) {
      return this
    }
    if (vertexStrokeColor.length !== 0) {
      // gap 为缝隙
      const gapRadius = PI2 / 360 * 10
      const gapNumber = vertexStrokeColor.length - 1
      let eachRadius = (PI2 - gapNumber * gapRadius) / vertexStrokeColor.length

      for (let i = 0, length = vertexStrokeColor.length; i < length; i++) {
        const c = vertexStrokeColor[i]
        ctx.beginPath()
        ctx.strokeStyle = c
        ctx.arc(d.x, d.y, radius + 3, i * eachRadius + i * gapRadius, (i + 1) * eachRadius)
        ctx.stroke()
      }

    }

    return this
  }

  drawVertexMark (d) {
    if (!d.uiConfig || !d.uiConfig.isMark) {
      return this
    }
    let markRadiusS = d.isCenter ? 6 : 7
    let markRadiusL = markRadiusS + 4
    const { ctx, currentCtxStyle } = this
    const radius = d.radius
    const centerX = d.x + radius / SQRT2 + markRadiusS / 2
    const centerY = d.y - radius / SQRT2 - markRadiusS / 2
    ctx.beginPath()
    ctx.moveTo(centerX + markRadiusL, centerY)
    ctx.arc(centerX, centerY, markRadiusL, 0, PI2)
    ctx.fillStyle = '#EFD7DF'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(centerX + markRadiusS, centerY)
    ctx.arc(centerX, centerY, markRadiusS, 0, PI2)
    ctx.fillStyle = '#EF4772'
    ctx.fill()
    currentCtxStyle.fillStyle = ''
  }

  drawVertexText (d) {
    const { ctx, options } = this
    const textNumPerLine = 8 // 节点中每一行的文字个数阈值
    let name = d.name || ''
    const lineNum = Math.floor(name.length / textNumPerLine) + 1 // 节点文字行数阈值
    let nameStack = []

    if (name.length < textNumPerLine) {
      nameStack = [name]
    } else {
      for (let i = 0; i < lineNum; i++) {
        let subName = name.substr(0, textNumPerLine)
        name = name.slice(textNumPerLine)
        nameStack.push(subName)
      }
    }

    const defaultColor = options.theme === 'deep' ? '#fff' : '#42444C'
    if (d.uiConfig && (d.uiConfig.is_fade || d.uiConfig.isHide)) {
      ctx.fillStyle = utils.fadeColor()
    } else {
      ctx.fillStyle = defaultColor
    }
    if (this.globalData.highLightParam && this.globalData.highLightParam.pathEvent) {
      ctx.fillStyle = !d.is_in_path ? utils.fadeColor() : defaultColor
    }

    if (utils.isStartOrEnd(d)) {
      nameStack.forEach((name, i) => {
        ctx.fillText(name, d.x, d.y + options.fontSize * (i + 1) + d.radius + 5 * i + 10)  // 5*i，行间距加大
      })
    } else {
      nameStack.forEach((name, i) => {
        ctx.fillText(name, d.x, d.y + options.fontSize * (i + 1) + d.radius + 5 * i)  // 5*i，行间距加大
      })
    }

    /**
     * todo
     * 1. 性能问题，每次重绘都会造成images绘制
     * 2. 某些情况下image 会渲染不出来  // 需要在 image 加载后绘制（onload）, xyz
     */
    const img = this.images[d.uiConfig.style || ICON_MAP[1]]
    const rate = d.radius / 25
    const imgH = rate * img.width * 0.8
    const imgW = rate * img.width * 0.8
    const imgX = (0 | d.x) - options.radius / 2 - imgH * 0.3 * (d.radius / 30) // 优化，坐标为整数，避免浏览器进行插值计算
    const imgY = (0 | d.y) - options.radius / 2 - imgW * 0.3 * (d.radius / 30) // 优化，坐标为整数，避免浏览器进行插值计算
    if (img) {
      ctx.drawImage(img, imgX, imgY, imgW, imgH)
    }

    return this
  }

  _preloadImg () {
    const types = (this.options || {}).vertexIcons || []
    types.forEach((type) => {
      const img = new Image()
      img.src = require(`../images/${type}.svg`)
      this.images[type] = img
    })

    return this
  }

  // 绘制指示标签
  drawLabel (d) {
    const { ctx } = this
    // 标签纵坐标
    const labelY = d.y + d.radius / 2 + d.radius / 2 * 0.3
    // 标签高度
    const labelHeight = labelY + d.radius * 0.2
    // 标签宽度
    const labelWidth = d.radius * 0.1
    // 同一级标签偏移量
    const labelShift = labelWidth * 2
    Object.keys(_default.tagMap).forEach((type) => {
      if (d[type] && d[type] !== 'false') {
        let labelColor = _default.tagMap[type].color
        ctx.beginPath()
        let labelX = _default.tagMap[type].shiftX === '0' ? d.x : (_default.tagMap[type].shiftX === '-' ? d.x - labelShift : d.x + labelShift)
        ctx.moveTo(labelX, labelY)
        ctx.lineTo(labelX - labelWidth, labelHeight)
        ctx.lineTo(labelX + labelWidth, labelHeight)
        ctx.fillStyle = labelColor
        ctx.fill()
      }
    })
    return this
  }

  // 点击节点
  highlightCurrentVertex (d) {
    if (!d.is_current) {
      return this
    }

    const { ctx } = this

    const radius = d.radius
    let vertexColor = this.getColor(d, 'vertex')

    ctx.beginPath()
    ctx.fillStyle = utils.fadeColor(vertexColor, 0.5)
    ctx.moveTo(d.x, d.y)
    ctx.arc(d.x, d.y, radius + 8, 0, PI2)
    ctx.fill()


    // ctx.beginPath()
    // ctx.fillStyle = utils.fadeColor(vertexColor, 0.7)
    // ctx.moveTo(d.x, d.y)
    // ctx.arc(d.x, d.y, radius + 5, 0, PI2)
    // ctx.fill()

    return this
  }

  getBackgroundColor (theme) {
    const themeMap = {
      light: '#eff0f2',
      deep: '#263243',
      mix: '#EFF0F2',
      pure: '#EFF0F2'
    }

    return themeMap[theme] || '#eff0f2'
  }

  getDistance (d) {
    return 200
  }

  getColor (d, type, text = false) {
    const { options } = this
    let uiConfig = d.uiConfig || {}

    let color = (options[options.theme] || {} )[type]
    if (uiConfig.color && uiConfig.color.includes('#')) {
      color = uiConfig.color
    }

    if (type === 'edge' && text !== 'text' ) {
      color = utils.fadeColor(color)
    }

    if (this.globalData.highLightParam && this.globalData.highLightParam.pathEvent) {
      if (!d.is_in_path) {
        color = utils.fadeColor()
      }
    } else if (d.uiConfig.is_fade) { // d.uiConfig.is_fade 为 true 或 没有 is_fade 属性时
      color = utils.fadeColor()
    }

    return color
  }

  getRadius (d) {
    let uiConfig = d.uiConfig || {}
    return uiConfig.radius || this.options.radius
  }

  getVertexStrokeColor (d) {
    if (!d._strokeStyle || d._strokeStyle.length === 0) {
      return []
    }
    let color = [...d._strokeStyle]
    color.forEach((c, index) => {
      color[index] = utils.fadeColor(c, 0.8)
    })
    if (this.globalData.highLightParam && this.globalData.highLightParam.pathEvent) {
      if (!d.is_in_path) {
        color.forEach((c, index) => {
          color[index] = utils.fadeColor()
        })
      }
    } else if (d.uiConfig.is_fade || d.uiConfig.isHide || d.uiConfig._color) {
      color.forEach((c, index) => {
        color[index] = utils.fadeColor()
      })
    }

    return color
  }

  getLineWidth (d) {
    const { options } = this
    let lineWidth = EDGE_LINE_WIDTH_MAP[d.uiConfig.size] || 1
    if (d.is_current) {
      lineWidth += 1
      // lineWidth += 4
    }

    return lineWidth
  }

  bindEvents () {
    const { options } = this
    const zoomListener = d3.zoom()
      .scaleExtent(this.options.scaleExtent)
      .on('zoom', this.onZoom.bind(this)) // 监听放大缩小操作
    this.canvas.call(
      d3.drag()
        .container(this.ele)
        .subject(this._getTargetVertexOrEdge.bind(this))
        .on('start', this.onDragStart.bind(this))
        .on('drag', this.onDrag.bind(this))
        .on('end', this.onDragEnd.bind(this))
    ).call(zoomListener)

    const config = options.transform || {
      x: options.canvasShift[0],
      y: options.canvasShift[1],
      k: 1  // 默认缩放比例
    }
    const t = d3.zoomIdentity.translate(config.x, config.y).scale(config.k)
    this.canvas.call(zoomListener.transform, t)

    this.canvas.on('mousemove', this.onMousemove.bind(this))

    this.canvas.on('click', this.onClick.bind(this))

    d3.select('body').on('canvas_zoom', () => {
      const scale = d3.event.detail.scale || 1 // 缩放比例
      const { width, height } = this.options
      const xShift = width * (1 - scale) / 2 + options.canvasShift[0]
      const yShift = height * (1 - scale) / 2 + options.canvasShift[1]
      const t = d3.zoomIdentity.translate(xShift, yShift).scale(scale)
      this.canvas.call(zoomListener.transform, t)
    })
    d3.select('body').on('thumbnail_zoom', () => {
      const detail = d3.event.detail
      const t = d3.zoomIdentity.translate(detail.x, detail.y).scale(detail.scale)
      this.canvas.call(zoomListener.transform, t)
    })

    return this
  }


  _getTargetVertexOrEdge () {
    const x = this.transform.invertX(d3.event.x)
    // 兼容IE，click事件使用原生pageY
    const y = this.transform.invertY(d3.event.type === 'click' ? d3.event.pageY : d3.event.y)
    let target = null

    this.chart.vertexes.some(v => {
      const isInVertexFlag = utils.isInVertex(v, { x, y })
      if (isInVertexFlag) {
        if (this.isRenderEnd) {
          v.x = this.transform.applyX(v.x)
          v.y = this.transform.applyY(v.y)
        }
        target = v
      }
      return isInVertexFlag
    })

    if (!target) {  // 判断是否点击在边上
      this.chart.edges.some(edge => {
        let isInLineEdge = utils.isInEdge(x, y, edge.source.x, edge.source.y, edge.target.x, edge.target.y,
          (edge.uiConfig.size || this.options.lineWidth) * 2) // 放大边触发范围
        let isInEdgeFlag = isInLineEdge
        if (edge.degree > 1) { // 奇数条边时中间边为直线，排除在外
          if (!(edge.degree % 2 === 1 && edge.degreeIdx === 1)) {
            isInEdgeFlag = this.isInCurveEdge(x, y, edge)
          }
        }
        target = isInEdgeFlag ? edge : null
        return isInEdgeFlag
      })
    }

    return target
  }

  isInCurveEdge (x, y, d) {
    const { ctx } = this
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(d.source.x, d.source.y)
    ctx.quadraticCurveTo(d.ctrlX, d.ctrlY, d.target.x, d.target.y - 1)
    ctx.lineWidth = 5
    ctx.closePath()
    const isInPath = ctx.isPointInStroke ? ctx.isPointInStroke(x, y) : ctx.isPointInPath(x, y)
    ctx.restore()
    return isInPath
  }

  onClick () {
    // IE兼容，隐藏右键内容
    d3.select(".rightBtnSvg").remove();
    const target = this._getTargetVertexOrEdge()
    // UI
    this.changeClickHighlightStyle(target)
    // 高亮节点、路径以及左侧对应的卡片信息
    if (target) {
      if (target.source) {  // 点击边
        this.options.onClickOutside(true)
        this.options.onClickEdge && this.options.onClickEdge(target)
      } else {  // 点击节点
        this.options.onClickOutside(false)
        this.options.onClickVertex && this.options.onClickVertex(target)
      }
    } else {
      this.options.onClickOutside(true)
    }
  }

  changeClickHighlightStyle = (target) => {
    this.chart.vertexes.forEach((v) => {
      v.is_current = false
    })
    this.chart.edges.forEach((e) => {
      e.is_current = false
    })

    if (!target) {
      this.draw()
      return this
    }

    const type = target._from && target._to ? 'edge' : 'vertex'

    if (type === 'vertex') {
      this.chart.edges.forEach(e => {
        e.is_current = e._from === target._id || e._to === target._id
      })
      target.is_current = true
    }

    if (type === 'edge') {
      target.is_current = true
    }

    // IE上点击节点会出现闪现，绘制了多次，屏蔽此次绘制
    // this.draw()
  }

  onZoom () {
    this.transform = d3.event.transform
    this.draw()
    this.options.onZoom(this.transform)
    if (this.zoomChange && typeof this.zoomChange === 'function') {
      this.zoomChange(this.transform)
    }
  }


  onDragStart () {
    // IE兼容，隐藏右键内容
    d3.select(".rightBtnSvg").remove();
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.01).restart()
    }
    if (this.isRenderEnd) {
      d3.event.subject.fx = this.transform.invertX(d3.event.x)
      d3.event.subject.fy = this.transform.invertY(d3.event.y)
    }
  }

  onDrag () {
    if (this.isRenderEnd) {
      d3.event.subject.fx = this.transform.invertX(d3.event.x)
      d3.event.subject.fy = this.transform.invertY(d3.event.y)
    }
  }

  onDragEnd () {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0)
    }
    if (this.isRenderEnd) {
      d3.event.subject.fx = this.transform.invertX(d3.event.x)
      d3.event.subject.fy = this.transform.invertY(d3.event.y)
    }
  }

  onMousemove () {
    /** 边的 mouseover 事件 */
    // this.onMouseoverEdge() // 鼠标移动会一直导致重绘，待优化 1. debounce, 2. 只有移到边上才重绘，空白处不触发重绘
  }

  onMouseoverEdge () {
    /** 高亮选中的边 */
    let findMouseover = false
    this.chart.edges.forEach((e) => {
      if (findMouseover) {
        e.mouseover = false
        return  // 跳出本次循环
      }
      if (utils.isInEdge(e.srcShiftPos || e.source, e.dstShiftPos || e.target, d3.event)) {
        e.mouseover = true
        findMouseover = true
      } else {
        e.mouseover = false
      }
    })
    this.draw()
  }
}

const utils = {
  hexToRgbCache: {},
  /**
    * Check if a point is on a line segment.
    *
    * @param  {number} x       The X coordinate of the point to check.
    * @param  {number} y       The Y coordinate of the point to check.
    * @param  {number} x1      The X coordinate of the line start point.
    * @param  {number} y1      The Y coordinate of the line start point.
    * @param  {number} x2      The X coordinate of the line end point.
    * @param  {number} y2      The Y coordinate of the line end point.
    * @param  {number} epsilon The precision (consider the line thickness).
    * @return {boolean}        True if point is "close to" the line
    *                          segment, false otherwise.
  */
  isInEdge: (x, y, x1, y1, x2, y2, epsilon) => {
    // http://stackoverflow.com/a/328122
    var crossProduct = Math.abs((y - y1) * (x2 - x1) - (x - x1) * (y2 - y1)),
      d = utils.getDistance(x1, y1, x2, y2),
      nCrossProduct = crossProduct / d; // normalized cross product

    return (nCrossProduct < epsilon &&
      Math.min(x1, x2) <= x && x <= Math.max(x1, x2) &&
      Math.min(y1, y2) <= y && y <= Math.max(y1, y2));
  },
  getDistance: (x0, y0, x1, y1) => {
    return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
  },
  /**
   * 判断某个点是否在实体上面
   * @param {Object} src {x: 实体横坐标, y: 实体纵坐标, radius: 实体半径}
   * @param { Object } cur { x: 当前点横坐标, y: 当前点纵坐标 }
   */
  isInVertex: (src, cur) => {
    const dx = src.x - cur.x
    const dy = src.y - cur.y
    return dx * dx + dy * dy < src.radius * src.radius
  },
  isTrue: (condition) => condition && condition !== 'false',
  hexToRgb: (hex) => {
    if (hex.indexOf('rgb') === 0) {
      const rgbList = /rgba+\((\d{1,3}), (\d{1,3}), (\d{1,3})/.exec(hex)
      return { r: rgbList[1], g: rgbList[2], b: rgbList[3] }
    }
    if (utils.hexToRgbCache[hex]) {
      return utils.hexToRgbCache[hex]
    }
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    const rgb = result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
    if (rgb) {
      utils.hexToRgbCache[hex] = rgb
    }
    return rgb
  },
  fadeColor: (color = '#C3CACF', opacity = 0.5) => {
    color = utils.hexToRgb(color)
    color = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`

    return color
  },
  getScreenPosition: (x, y, transform) => {
    const xn = transform.x + x * transform.k
    const yn = transform.y + y * transform.k
    return { x: xn, y: yn }
  },
  vertexOutOfWindow: (pos) => {
    return pos.x > window.innerWidth || pos.x < 0 || pos.y > window.innerHeight || pos.y < 0
  },
  edgeOutOfWindow: (source, target) => {
    if (!utils.vertexOutOfWindow(source) || !utils.vertexOutOfWindow(target)) {
      return false
    }
    if (source.y !== target.y) {
      const crossPointX = (target.x * source.y - source.x * target.y) / (source.y - target.y)
      if (crossPointX > 0 && crossPointX < window.innerWidth) {
        return false
      }
    }
    if (source.x !== target.x) {
      const crossPointY = (target.x * source.y - source.x * target.y) / (source.y - target.y)
      if (crossPointY > 0 && crossPointY < window.innerHeight) {
        return false
      }
    }

    return true
  },
  curveHelper: (x1, y1, x2, y2, x3, y3, x4, y4) => {
    var tx1, ty1, tx2, ty2, tx3, ty3
    var a, b, c, u
    var vec, currentPos, vec1, vect
    vec = { x: 0, y: 0 }
    vec1 = { x: 0, y: 0 }
    vect = { x: 0, y: 0 }
    var quad = false
    currentPos = 0
    var currentDist = 0
    if (x4 === undefined || x4 === null) {
      quad = true
      x4 = x3
      y4 = y3
    }
    var estLen = Math.sqrt((x4 - x1) * (x4 - x1) + (y4 - y1) * (y4 - y1))
    var onePix = 1 / estLen
    function posAtC (c) {
      tx1 = x1; ty1 = y1;
      tx2 = x2; ty2 = y2;
      tx3 = x3; ty3 = y3;
      tx1 += (tx2 - tx1) * c;
      ty1 += (ty2 - ty1) * c;
      tx2 += (tx3 - tx2) * c;
      ty2 += (ty3 - ty2) * c;
      tx3 += (x4 - tx3) * c;
      ty3 += (y4 - ty3) * c;
      tx1 += (tx2 - tx1) * c;
      ty1 += (ty2 - ty1) * c;
      tx2 += (tx3 - tx2) * c;
      ty2 += (ty3 - ty2) * c;
      vec.x = tx1 + (tx2 - tx1) * c;
      vec.y = ty1 + (ty2 - ty1) * c;
      return vec;
    }
    function posAtQ (c) {
      tx1 = x1; ty1 = y1;
      tx2 = x2; ty2 = y2;
      tx1 += (tx2 - tx1) * c;
      ty1 += (ty2 - ty1) * c;
      tx2 += (x3 - tx2) * c;
      ty2 += (y3 - ty2) * c;
      vec.x = tx1 + (tx2 - tx1) * c;
      vec.y = ty1 + (ty2 - ty1) * c;
      return vec;
    }
    function forward (dist) {
      var step;
      helper.posAt(currentPos);

      while (currentDist < dist) {
        vec1.x = vec.x;
        vec1.y = vec.y;
        currentPos += onePix;
        helper.posAt(currentPos);
        currentDist += step = Math.sqrt((vec.x - vec1.x) * (vec.x - vec1.x) + (vec.y - vec1.y) * (vec.y - vec1.y));
      }
      currentPos -= ((currentDist - dist) / step) * onePix
      currentDist -= step;
      helper.posAt(currentPos);
      currentDist += Math.sqrt((vec.x - vec1.x) * (vec.x - vec1.x) + (vec.y - vec1.y) * (vec.y - vec1.y));
      return currentPos;
    }

    function tangentQ (pos) {
      a = (1 - pos) * 2;
      b = pos * 2;
      vect.x = a * (x2 - x1) + b * (x3 - x2);
      vect.y = a * (y2 - y1) + b * (y3 - y2);
      u = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
      vect.x /= u;
      vect.y /= u;
    }
    function tangentC (pos) {
      a = (1 - pos)
      b = 6 * a * pos;
      a *= 3 * a;
      c = 3 * pos * pos;
      vect.x = -x1 * a + x2 * (a - b) + x3 * (b - c) + x4 * c;
      vect.y = -y1 * a + y2 * (a - b) + y3 * (b - c) + y4 * c;
      u = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
      vect.x /= u;
      vect.y /= u;
    }
    var helper = {
      vec: vec,
      vect: vect,
      forward: forward,
    }
    if (quad) {
      helper.posAt = posAtQ;
      helper.tangent = tangentQ;
    } else {
      helper.posAt = posAtC;
      helper.tangent = tangentC;
    }
    return helper
  },
  isStartOrEnd: (d) => {
    return d._tag === 'START' || d._tag === 'END'
  }
}

export default ForceCanvas
