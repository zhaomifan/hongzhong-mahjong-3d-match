// ==========================================
// 红中麻将3D堆叠消除 - 微信小游戏
// ==========================================

// ----- 工具函数 -----
function getSystemInfo() {
  return wx.getSystemInfoSync()
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh
}

// ----- 牌定义 -----
const TILE_TYPES = { WAN: 'wan', TIAO: 'tiao', BING: 'bing', ZI: 'zi' }
const TILE_DEFS = {
  wan_1: { type: TILE_TYPES.WAN, value: 1, display: '一万', color: '#e74c3c' },
  wan_2: { type: TILE_TYPES.WAN, value: 2, display: '二万', color: '#e74c3c' },
  wan_3: { type: TILE_TYPES.WAN, value: 3, display: '三万', color: '#e74c3c' },
  wan_4: { type: TILE_TYPES.WAN, value: 4, display: '四万', color: '#e74c3c' },
  wan_5: { type: TILE_TYPES.WAN, value: 5, display: '五万', color: '#e74c3c' },
  wan_6: { type: TILE_TYPES.WAN, value: 6, display: '六万', color: '#e74c3c' },
  wan_7: { type: TILE_TYPES.WAN, value: 7, display: '七万', color: '#e74c3c' },
  wan_8: { type: TILE_TYPES.WAN, value: 8, display: '八万', color: '#e74c3c' },
  wan_9: { type: TILE_TYPES.WAN, value: 9, display: '九万', color: '#e74c3c' },
  tiao_1: { type: TILE_TYPES.TIAO, value: 1, display: '一条', color: '#27ae60' },
  tiao_2: { type: TILE_TYPES.TIAO, value: 2, display: '二条', color: '#27ae60' },
  tiao_3: { type: TILE_TYPES.TIAO, value: 3, display: '三条', color: '#27ae60' },
  tiao_4: { type: TILE_TYPES.TIAO, value: 4, display: '四条', color: '#27ae60' },
  tiao_5: { type: TILE_TYPES.TIAO, value: 5, display: '五条', color: '#27ae60' },
  tiao_6: { type: TILE_TYPES.TIAO, value: 6, display: '六条', color: '#27ae60' },
  tiao_7: { type: TILE_TYPES.TIAO, value: 7, display: '七条', color: '#27ae60' },
  tiao_8: { type: TILE_TYPES.TIAO, value: 8, display: '八条', color: '#27ae60' },
  tiao_9: { type: TILE_TYPES.TIAO, value: 9, display: '九条', color: '#27ae60' },
  bing_1: { type: TILE_TYPES.BING, value: 1, display: '一饼', color: '#3498db' },
  bing_2: { type: TILE_TYPES.BING, value: 2, display: '二饼', color: '#3498db' },
  bing_3: { type: TILE_TYPES.BING, value: 3, display: '三饼', color: '#3498db' },
  bing_4: { type: TILE_TYPES.BING, value: 4, display: '四饼', color: '#3498db' },
  bing_5: { type: TILE_TYPES.BING, value: 5, display: '五饼', color: '#3498db' },
  bing_6: { type: TILE_TYPES.BING, value: 6, display: '六饼', color: '#3498db' },
  bing_7: { type: TILE_TYPES.BING, value: 7, display: '七饼', color: '#3498db' },
  bing_8: { type: TILE_TYPES.BING, value: 8, display: '八饼', color: '#3498db' },
  bing_9: { type: TILE_TYPES.BING, value: 9, display: '九饼', color: '#3498db' },
  zi_dong: { type: TILE_TYPES.ZI, value: 1, display: '东', color: '#2c3e50' },
  zi_nan: { type: TILE_TYPES.ZI, value: 2, display: '南', color: '#2c3e50' },
  zi_xi: { type: TILE_TYPES.ZI, value: 3, display: '西', color: '#2c3e50' },
  zi_bei: { type: TILE_TYPES.ZI, value: 4, display: '北', color: '#2c3e50' },
  zi_zhong: { type: TILE_TYPES.ZI, value: 5, display: '中', color: '#e74c3c' },
  zi_fa: { type: TILE_TYPES.ZI, value: 6, display: '发', color: '#27ae60' },
  zi_bai: { type: TILE_TYPES.ZI, value: 7, display: '白', color: '#95a5a6' }
}
function getAllTileIds() { return Object.keys(TILE_DEFS) }

// 牌类
class Tile {
  constructor(id, x, y, z) {
    this.id = id
    this.def = TILE_DEFS[id]
    this.x = x; this.y = y; this.z = z
    this.removed = false
    this.visible = true
  }
  get type() { return this.def.type }
  get value() { return this.def.value }
  get display() { return this.def.display }
  get color() { return this.def.color }
}

// ----- 关卡配置 -----
const LEVELS = [
  { id: 1, name: '新手入门', tileCount: 36, layers: 2, timeLimit: 90, types: ['wan', 'tiao'], slots: 6 },
  { id: 2, name: '初窥门径', tileCount: 48, layers: 3, timeLimit: 90, types: ['wan', 'tiao', 'bing'], slots: 6 },
  { id: 3, name: '小有所成', tileCount: 60, layers: 3, timeLimit: 80, types: ['wan', 'tiao', 'bing'], slots: 6 },
  { id: 4, name: '渐入佳境', tileCount: 72, layers: 4, timeLimit: 80, types: ['wan', 'tiao', 'bing'], slots: 6 },
  { id: 5, name: '融会贯通', tileCount: 84, layers: 4, timeLimit: 75, types: ['wan', 'tiao', 'bing', 'zi'], slots: 6 },
  { id: 6, name: '炉火纯青', tileCount: 96, layers: 5, timeLimit: 70, types: ['wan', 'tiao', 'bing', 'zi'], slots: 5 },
  { id: 7, name: '登峰造极', tileCount: 108, layers: 5, timeLimit: 65, types: ['wan', 'tiao', 'bing', 'zi'], slots: 5 },
  { id: 8, name: '雀神附体', tileCount: 120, layers: 6, timeLimit: 60, types: ['wan', 'tiao', 'bing', 'zi'], slots: 5 }
]
function getLevel(id) { return LEVELS.find(l => l.id === id) || LEVELS[0] }

// ----- 渲染器 -----
class Renderer {
  constructor() {
    const info = getSystemInfo()
    this.width = info.windowWidth
    this.height = info.windowHeight
    this.canvas = wx.createCanvas()
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.fov = 1000
    this.cameraZ = -500
    this.rotationX = 0.5
    this.tileWidth = 32
    this.tileHeight = 42
    this.tileDepth = 5
    this.bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height)
    this.bgGrad.addColorStop(0, '#1a1a2e')
    this.bgGrad.addColorStop(1, '#16213e')
  }

  project(x, y, z) {
    const cosX = Math.cos(this.rotationX)
    const sinX = Math.sin(this.rotationX)
    const y1 = y * cosX - z * sinX
    const z1 = y * sinX + z * cosX
    const scale = this.fov / (this.fov + z1 + this.cameraZ)
    return {
      x: this.width / 2 + x * scale,
      y: this.height / 2 + 30 + y1 * scale, // 下移避开顶部UI
      scale
    }
  }

  clear() {
    this.ctx.fillStyle = this.bgGrad
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  drawTile(tile) {
    if (!tile.visible || tile.removed) return
    const pos = this.project(tile.x, tile.y, tile.z)
    const w = this.tileWidth * pos.scale
    const h = this.tileHeight * pos.scale
    const d = this.tileDepth * pos.scale
    const x = pos.x - w / 2
    const y = pos.y - h / 2
    const s = pos.scale

    // 右侧面（竹绿色）
    this.ctx.fillStyle = '#3d6b47'
    this.ctx.beginPath()
    this.ctx.moveTo(x + w, y)
    this.ctx.lineTo(x + w + d * 0.5, y - d * 0.3)
    this.ctx.lineTo(x + w + d * 0.5, y + h - d * 0.3)
    this.ctx.lineTo(x + w, y + h)
    this.ctx.closePath()
    this.ctx.fill()

    // 上面（浅绿色）
    this.ctx.fillStyle = '#5a9a68'
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
    this.ctx.lineTo(x + d * 0.5, y - d * 0.3)
    this.ctx.lineTo(x + w + d * 0.5, y - d * 0.3)
    this.ctx.lineTo(x + w, y)
    this.ctx.closePath()
    this.ctx.fill()

    // 正面（象牙白）
    const grad = this.ctx.createLinearGradient(x, y, x, y + h)
    grad.addColorStop(0, '#fffff5')
    grad.addColorStop(0.5, '#f5f0e0')
    grad.addColorStop(1, '#ebe5d5')
    this.ctx.fillStyle = grad
    this.ctx.fillRect(x, y, w, h)

    // 绿色边框
    this.ctx.strokeStyle = '#2d5a36'
    this.ctx.lineWidth = Math.max(1, 2 * s)
    this.ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)

    // 内部凹陷效果
    this.ctx.strokeStyle = '#d5d0c0'
    this.ctx.lineWidth = Math.max(1, 1 * s)
    this.ctx.strokeRect(x + 3 * s, y + 3 * s, w - 6 * s, h - 6 * s)

    // 根据牌类型绘制
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(x + 4 * s, y + 4 * s, w - 8 * s, h - 8 * s)
    this.ctx.clip()

    if (tile.type === TILE_TYPES.WAN) {
      this.drawWanTile(tile, pos, w, h, s)
    } else if (tile.type === TILE_TYPES.TIAO) {
      this.drawTiaoTile(tile, pos, w, h, s)
    } else if (tile.type === TILE_TYPES.BING) {
      this.drawBingTile(tile, pos, w, h, s)
    } else if (tile.type === TILE_TYPES.ZI) {
      this.drawZiTile(tile, pos, w, h, s)
    }

    this.ctx.restore()
  }

  // 绘制万子
  drawWanTile(tile, pos, w, h, s) {
    const numChars = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
    const num = numChars[tile.value - 1]

    // 上半部分：红色数字
    this.ctx.fillStyle = '#c41e3a'
    this.ctx.font = 'bold ' + Math.max(10, 14 * s) + 'px serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(num, pos.x, pos.y - h * 0.18)

    // 下半部分：萬字
    this.ctx.fillStyle = '#1a1a2e'
    this.ctx.font = 'bold ' + Math.max(8, 11 * s) + 'px serif'
    this.ctx.fillText('萬', pos.x, pos.y + h * 0.22)
  }

  // 绘制条子（竹节）
  drawTiaoTile(tile, pos, w, h, s) {
    const colors = ['#1a5f2a', '#2d8a4e', '#1a5f2a']
    
    if (tile.value === 1) {
      // 一条：糖葫芦/竹节形状，竖排3个椭圆
      const rx = 6 * s  // 椭圆水平半径
      const ry = 4 * s  // 椭圆垂直半径
      const gap = 10 * s // 间距
      const startY = pos.y - gap

      // 画3个竖排椭圆
      for (let i = 0; i < 3; i++) {
        const cy = startY + i * gap
        this.ctx.fillStyle = colors[i % 3]
        this.ctx.beginPath()
        this.ctx.ellipse(pos.x, cy, rx, ry, 0, 0, Math.PI * 2)
        this.ctx.fill()
        // 中间横线装饰
        this.ctx.strokeStyle = '#0d3d16'
        this.ctx.lineWidth = Math.max(0.5, 0.8 * s)
        this.ctx.beginPath()
        this.ctx.moveTo(pos.x - rx + 1, cy)
        this.ctx.lineTo(pos.x + rx - 1, cy)
        this.ctx.stroke()
      }
    } else {
      // 绘制竹节
      const barH = h * 0.08
      const barW = w * 0.5
      const gap = h * 0.12
      const startY = pos.y - (tile.value - 1) * gap / 2

      for (let i = 0; i < tile.value; i++) {
        const cy = startY + i * gap
        // 竹节
        this.ctx.fillStyle = colors[i % 3]
        this.ctx.beginPath()
        this.ctx.ellipse(pos.x, cy, barW / 2, barH / 2, 0, 0, Math.PI * 2)
        this.ctx.fill()
        // 中间横线
        this.ctx.strokeStyle = '#0d3d16'
        this.ctx.lineWidth = Math.max(1, 1 * s)
        this.ctx.beginPath()
        this.ctx.moveTo(pos.x - barW / 2 + 2, cy)
        this.ctx.lineTo(pos.x + barW / 2 - 2, cy)
        this.ctx.stroke()
      }
    }
  }

  // 绘制饼子（圆饼）
  drawBingTile(tile, pos, w, h, s) {
    const r = Math.max(3, 5 * s)
    
    // 饼子位置布局
    const layouts = {
      1: [[0, 0]],
      2: [[0, -0.12], [0, 0.12]],
      3: [[0, -0.15], [0, 0], [0, 0.15]],
      4: [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]],
      5: [[-0.12, -0.12], [0.12, -0.12], [0, 0], [-0.12, 0.12], [0.12, 0.12]],
      6: [[-0.12, -0.15], [0.12, -0.15], [-0.12, 0], [0.12, 0], [-0.12, 0.15], [0.12, 0.15]],
      7: [[-0.12, -0.15], [0.12, -0.15], [0, -0.05], [-0.12, 0.08], [0.12, 0.08], [-0.12, 0.2], [0.12, 0.2]],
      8: [[-0.12, -0.18], [0.12, -0.18], [-0.12, -0.06], [0.12, -0.06], [-0.12, 0.06], [0.12, 0.06], [-0.12, 0.18], [0.12, 0.18]],
      9: [[-0.14, -0.18], [0, -0.18], [0.14, -0.18], [-0.14, 0], [0, 0], [0.14, 0], [-0.14, 0.18], [0, 0.18], [0.14, 0.18]]
    }

    const layout = layouts[tile.value] || layouts[1]

    for (const [dx, dy] of layout) {
      const cx = pos.x + dx * w
      const cy = pos.y + dy * h

      // 外圈
      this.ctx.fillStyle = '#1a3d5c'
      this.ctx.beginPath()
      this.ctx.arc(cx, cy, r + 1 * s, 0, Math.PI * 2)
      this.ctx.fill()

      // 内圈
      this.ctx.fillStyle = '#2980b9'
      this.ctx.beginPath()
      this.ctx.arc(cx, cy, r, 0, Math.PI * 2)
      this.ctx.fill()

      // 中心点
      this.ctx.fillStyle = '#1a3d5c'
      this.ctx.beginPath()
      this.ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  // 绘制字牌
  drawZiTile(tile, pos, w, h, s) {
    const ziData = {
      1: { char: '東', color: '#1a5f2a' },
      2: { char: '南', color: '#1a5f2a' },
      3: { char: '西', color: '#1a5f2a' },
      4: { char: '北', color: '#1a5f2a' },
      5: { char: '中', color: '#c41e3a' },
      6: { char: '發', color: '#1a5f2a' },
      7: { char: '', color: '#888' } // 白板
    }

    const data = ziData[tile.value]
    
    if (tile.value === 7) {
      // 白板：画边框
      this.ctx.strokeStyle = '#aaa'
      this.ctx.lineWidth = Math.max(1, 1.5 * s)
      this.ctx.strokeRect(pos.x - w * 0.2, pos.y - h * 0.2, w * 0.4, h * 0.4)
    } else {
      this.ctx.fillStyle = data.color
      this.ctx.font = 'bold ' + Math.max(12, 18 * s) + 'px serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(data.char, pos.x, pos.y)
    }
  }

  drawTiles(tiles) {
    const sorted = tiles.filter(t => !t.removed && t.visible).sort((a, b) => a.z - b.z)
    for (let i = 0; i < sorted.length; i++) this.drawTile(sorted[i])
  }

  drawSlot(slots, maxSlots) {
    const sw = 32, sh = 42
    const totalW = maxSlots * (sw + 3)
    const startX = (this.width - totalW) / 2
    const y = this.height - sh - 10

    // 背景
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)'
    this.roundRect(startX - 8, y - 8, totalW + 16, sh + 16, 10)

    for (let i = 0; i < maxSlots; i++) {
      const x = startX + i * (sw + 4)

      // 空槽位
      this.ctx.fillStyle = 'rgba(255,255,255,0.05)'
      this.ctx.fillRect(x, y, sw, sh)
      this.ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      this.ctx.strokeRect(x, y, sw, sh)

      if (slots[i]) {
        this.drawSlotTile(slots[i], x, y, sw, sh)
      }
    }
  }

  // 绘制卡槽中的牌
  drawSlotTile(tile, x, y, w, h) {
    // 象牙白背景
    const g = this.ctx.createLinearGradient(x, y, x, y + h)
    g.addColorStop(0, '#fffff5')
    g.addColorStop(0.5, '#f5f0e0')
    g.addColorStop(1, '#ebe5d5')
    this.ctx.fillStyle = g
    this.ctx.fillRect(x + 1, y + 1, w - 2, h - 2)

    // 绿色边框
    this.ctx.strokeStyle = '#2d5a36'
    this.ctx.lineWidth = 1.5
    this.ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)

    // 内边框
    this.ctx.strokeStyle = '#d5d0c0'
    this.ctx.lineWidth = 0.5
    this.ctx.strokeRect(x + 3, y + 3, w - 6, h - 6)

    const cx = x + w / 2
    const cy = y + h / 2

    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(x + 4, y + 4, w - 8, h - 8)
    this.ctx.clip()

    if (tile.type === TILE_TYPES.WAN) {
      // 万子
      const numChars = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
      this.ctx.fillStyle = '#c41e3a'
      this.ctx.font = 'bold 11px serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(numChars[tile.value - 1], cx, cy - h * 0.18)
      this.ctx.fillStyle = '#1a1a2e'
      this.ctx.font = 'bold 9px serif'
      this.ctx.fillText('萬', cx, cy + h * 0.22)
    } else if (tile.type === TILE_TYPES.TIAO) {
      // 条子
      const colors = ['#1a5f2a', '#2d8a4e', '#1a5f2a']
      if (tile.value === 1) {
        // 一条：糖葫芦/竹节形状
        const gap = 8
        for (let j = 0; j < 3; j++) {
          this.ctx.fillStyle = colors[j % 3]
          this.ctx.beginPath()
          this.ctx.ellipse(cx, cy - gap + j * gap, 5, 2.5, 0, 0, Math.PI * 2)
          this.ctx.fill()
        }
      } else {
        for (let j = 0; j < tile.value; j++) {
          const ty = cy - (tile.value - 1) * 4 + j * 8
          this.ctx.beginPath()
          this.ctx.ellipse(cx, ty, 7, 2.5, 0, 0, Math.PI * 2)
          this.ctx.fill()
        }
      }
    } else if (tile.type === TILE_TYPES.BING) {
      // 饼子
      const layouts = {
        1: [[0, 0]], 2: [[0, -6], [0, 6]], 3: [[0, -8], [0, 0], [0, 8]],
        4: [[-5, -5], [5, -5], [-5, 5], [5, 5]],
        5: [[-5, -5], [5, -5], [0, 0], [-5, 5], [5, 5]],
        6: [[-5, -8], [5, -8], [-5, 0], [5, 0], [-5, 8], [5, 8]],
        7: [[-5, -8], [5, -8], [0, -3], [-5, 3], [5, 3], [-5, 10], [5, 10]],
        8: [[-5, -10], [5, -10], [-5, -3], [5, -3], [-5, 3], [5, 3], [-5, 10], [5, 10]],
        9: [[-6, -10], [0, -10], [6, -10], [-6, 0], [0, 0], [6, 0], [-6, 10], [0, 10], [6, 10]]
      }
      const layout = layouts[tile.value] || layouts[1]
      for (const [dx, dy] of layout) {
        this.ctx.fillStyle = '#1a3d5c'
        this.ctx.beginPath()
        this.ctx.arc(cx + dx, cy + dy, 3.5, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.fillStyle = '#2980b9'
        this.ctx.beginPath()
        this.ctx.arc(cx + dx, cy + dy, 2.5, 0, Math.PI * 2)
        this.ctx.fill()
      }
    } else if (tile.type === TILE_TYPES.ZI) {
      // 字牌
      const ziChars = { 1: '東', 2: '南', 3: '西', 4: '北', 5: '中', 6: '發', 7: '' }
      const ziColors = { 1: '#1a5f2a', 2: '#1a5f2a', 3: '#1a5f2a', 4: '#1a5f2a', 5: '#c41e3a', 6: '#1a5f2a', 7: '#888' }

      if (tile.value === 7) {
        this.ctx.strokeStyle = '#aaa'
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(cx - 6, cy - 6, 12, 12)
      } else {
        this.ctx.fillStyle = ziColors[tile.value]
        this.ctx.font = 'bold 14px serif'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.fillText(ziChars[tile.value], cx, cy)
      }
    }

    this.ctx.restore()
  }

  roundRect(x, y, w, h, r) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + r, y)
    this.ctx.lineTo(x + w - r, y)
    this.ctx.arcTo(x + w, y, x + w, y + r, r)
    this.ctx.lineTo(x + w, y + h - r)
    this.ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    this.ctx.lineTo(x + r, y + h)
    this.ctx.arcTo(x, y + h, x, y + h - r, r)
    this.ctx.lineTo(x, y + r)
    this.ctx.arcTo(x, y, x + r, y, r)
    this.ctx.closePath()
    this.ctx.fill()
  }

  drawUI(level, score, timeLeft, total) {
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)'
    this.ctx.fillRect(0, 0, this.width, 44)
    this.ctx.fillStyle = '#fff'
    this.ctx.font = 'bold 14px sans-serif'
    this.ctx.textAlign = 'left'
    this.ctx.fillText('关卡 ' + level + '/' + total, 12, 22)
    this.ctx.textAlign = 'center'
    this.ctx.fillText('分数 ' + score, this.width / 2, 22)
    this.ctx.textAlign = 'right'
    this.ctx.fillStyle = timeLeft < 15 ? '#e74c3c' : '#fff'
    this.ctx.fillText(timeLeft + 's', this.width - 12, 22)

    // 时间条
    const bw = this.width - 24
    this.ctx.fillStyle = 'rgba(255,255,255,0.15)'
    this.ctx.fillRect(12, 38, bw, 4)
    this.ctx.fillStyle = timeLeft < 15 ? '#e74c3c' : '#2ecc71'
    this.ctx.fillRect(12, 38, bw * (timeLeft / 120), 4)
  }

  drawOverlay(title, sub, btn) {
    this.ctx.fillStyle = 'rgba(0,0,0,0.85)'
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.ctx.fillStyle = '#fff'
    this.ctx.textAlign = 'center'
    this.ctx.font = 'bold 32px sans-serif'
    this.ctx.fillText(title, this.width / 2, this.height / 2 - 50)
    this.ctx.font = '16px sans-serif'
    this.ctx.fillStyle = '#bdc3c7'
    this.ctx.fillText(sub, this.width / 2, this.height / 2)

    const bw = 150, bh = 44
    const bx = (this.width - bw) / 2
    const by = this.height / 2 + 30
    this.ctx.fillStyle = '#3498db'
    this.roundRect(bx, by, bw, bh, 22)
    this.ctx.fillStyle = '#fff'
    this.ctx.font = 'bold 16px sans-serif'
    this.ctx.fillText(btn, this.width / 2, by + bh / 2 + 5)
    return { bx, by, bw, bh }
  }

  drawHint(text) {
    this.ctx.save()
    this.ctx.fillStyle = 'rgba(46,204,113,0.95)'
    this.ctx.font = 'bold 28px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(text, this.width / 2, this.height / 2)
    this.ctx.restore()
  }
}

// ----- 卡槽 -----
class Slot {
  constructor(max) {
    this.max = max
    this.slots = new Array(max).fill(null)
    this.count = 0
  }
  get isFull() { return this.count >= this.max }
  get isEmpty() { return this.count === 0 }

  addTile(tile) {
    if (this.isFull) return { success: false }

    // 找相同牌旁边插入
    let idx = -1
    for (let i = 0; i < this.max; i++) {
      if (this.slots[i] && this.slots[i].id === tile.id) {
        idx = this.findInsertNear(i)
        if (idx !== -1) break
      }
    }
    // 找空位
    if (idx === -1) {
      for (let i = 0; i < this.max; i++) {
        if (!this.slots[i]) { idx = i; break }
      }
    }
    if (idx === -1) return { success: false }

    // 移动腾位
    this.shiftSlots(idx)
    this.slots[idx] = tile
    this.count++

    const result = this.checkEliminate()
    return { success: true, ...result }
  }

  findInsertNear(sameIdx) {
    // 向右找
    let end = sameIdx
    while (end + 1 < this.max && this.slots[end + 1] && this.slots[end + 1].id === this.slots[sameIdx].id) end++
    if (end + 1 < this.max && !this.slots[end + 1]) return end + 1
    // 向左找
    let start = sameIdx
    while (start - 1 >= 0 && this.slots[start - 1] && this.slots[start - 1].id === this.slots[sameIdx].id) start--
    if (start - 1 >= 0 && !this.slots[start - 1]) return start - 1
    return -1
  }

  shiftSlots(target) {
    if (!this.slots[target]) return
    // 右移
    for (let i = this.max - 1; i > target; i--) {
      if (!this.slots[i]) {
        for (let j = i; j > target; j--) this.slots[j] = this.slots[j - 1]
        this.slots[target] = null
        return
      }
    }
    // 左移
    for (let i = 0; i < target; i++) {
      if (!this.slots[i]) {
        for (let j = i; j < target; j++) this.slots[j] = this.slots[j + 1]
        this.slots[target] = null
        return
      }
    }
  }

  checkEliminate() {
    this.compress()
    // 4相同 杠
    const countMap = {}
    for (let i = 0; i < this.max; i++) {
      if (this.slots[i]) {
        if (!countMap[this.slots[i].id]) countMap[this.slots[i].id] = []
        countMap[this.slots[i].id].push(i)
      }
    }
    for (const id in countMap) {
      if (countMap[id].length >= 4) {
        for (const idx of countMap[id].slice(0, 4)) { this.slots[idx] = null; this.count-- }
        this.compress()
        return { eliminated: true, type: 'gang', score: 40 }
      }
    }
    // 3相同 碰
    for (const id in countMap) {
      if (countMap[id].length >= 3) {
        for (const idx of countMap[id].slice(0, 3)) { this.slots[idx] = null; this.count-- }
        this.compress()
        return { eliminated: true, type: 'peng', score: 30 }
      }
    }
    // 顺子 吃
    const groups = {}
    for (let i = 0; i < this.max; i++) {
      if (this.slots[i] && this.slots[i].type !== TILE_TYPES.ZI) {
        const key = this.slots[i].type
        if (!groups[key]) groups[key] = []
        groups[key].push({ idx: i, val: this.slots[i].value, id: this.slots[i].id })
      }
    }
    for (const type in groups) {
      const g = groups[type].sort((a, b) => a.val - b.val)
      for (let i = 0; i < g.length - 2; i++) {
        // 找3张不同值的连续牌
        for (let j = i + 1; j < g.length - 1; j++) {
          if (g[j].val !== g[i].val) {
            for (let k = j + 1; k < g.length; k++) {
              if (g[k].val !== g[j].val && g[k].val !== g[i].val) {
                const vals = [g[i].val, g[j].val, g[k].val].sort((a, b) => a - b)
                if (vals[1] === vals[0] + 1 && vals[2] === vals[1] + 1) {
                  this.slots[g[i].idx] = null
                  this.slots[g[j].idx] = null
                  this.slots[g[k].idx] = null
                  this.count -= 3
                  this.compress()
                  return { eliminated: true, type: 'chi', score: 20 }
                }
              }
            }
          }
        }
      }
    }
    return { eliminated: false }
  }

  compress() {
    const tiles = this.slots.filter(t => t !== null)
    this.slots = new Array(this.max).fill(null)
    for (let i = 0; i < tiles.length; i++) this.slots[i] = tiles[i]
  }

  clear() {
    this.slots = new Array(this.max).fill(null)
    this.count = 0
  }

  getTiles() { return this.slots.filter(t => t !== null) }
}

// ----- 求解器 -----
class Solver {
  getAvailable(tiles) {
    const avail = []
    for (const t of tiles) {
      if (t.removed) continue
      if (!this.isCovered(t, tiles)) avail.push(t)
    }
    return avail
  }

  isCovered(tile, all) {
    for (const o of all) {
      if (o === tile || o.removed) continue
      if (Math.abs(o.x - tile.x) < 20 && Math.abs(o.y - tile.y) < 26 && o.z > tile.z) return true
    }
    return false
  }

  checkSolvable(tiles, slotTiles) {
    const all = this.getAvailable(tiles).concat(slotTiles)
    const count = {}
    for (const t of all) count[t.id] = (count[t.id] || 0) + 1
    for (const id in count) { if (count[id] >= 3) return true }

    // 检查顺子
    const groups = {}
    for (const t of all) {
      if (t.type === TILE_TYPES.ZI) continue
      if (!groups[t.type]) groups[t.type] = {}
      groups[t.type][t.value] = true
    }
    for (const type in groups) {
      for (let v = 1; v <= 7; v++) {
        if (groups[type][v] && groups[type][v + 1] && groups[type][v + 2]) return true
      }
    }
    return false
  }

  // 智能变牌：找出孤立牌并改成可消除的牌
  fixUnsolvable(tiles, slotTiles) {
    const avail = this.getAvailable(tiles)
    const all = avail.concat(slotTiles)
    if (all.length < 3) return false

    // 按类型分组统计
    const typeGroups = {}
    for (const t of all) {
      if (t.type === TILE_TYPES.ZI) continue // 字牌单独处理
      if (!typeGroups[t.type]) typeGroups[t.type] = {}
      if (!typeGroups[t.type][t.value]) typeGroups[t.type][t.value] = []
      typeGroups[t.type][t.value].push(t)
    }

    // 对每种类型找出孤立牌并修复
    for (const type in typeGroups) {
      const group = typeGroups[type]
      const values = Object.keys(group).map(Number).sort((a, b) => a - b)

      // 找出无法组顺子也无法3相同的孤立牌
      for (const val of values) {
        const tilesAtVal = group[val]

        // 检查这个值能否组顺子
        const canSeqLeft = group[val - 1] && group[val - 2]
        const canSeqRight = group[val + 1] && group[val + 2]
        const canSeqMid = group[val - 1] && group[val + 1]
        const canSeq = canSeqLeft || canSeqRight || canSeqMid

        // 检查能否3相同
        const canSame = tilesAtVal.length >= 3

        if (!canSeq && !canSame && tilesAtVal.length <= 2) {
          // 这是孤立牌，尝试改成能组顺子的值
          const target = this.findBestValue(group, val, type)
          if (target !== null && target !== val) {
            for (const t of tilesAtVal) {
              const newId = type + '_' + target
              t.id = newId
              t.def = TILE_DEFS[newId]
            }
            // 更新分组
            if (!group[target]) group[target] = []
            group[target].push(...tilesAtVal)
            delete group[val]
          }
        }
      }
    }

    // 处理字牌：只能3相同或4相同
    const ziTiles = all.filter(t => t.type === TILE_TYPES.ZI)
    const ziGroups = {}
    for (const t of ziTiles) {
      if (!ziGroups[t.value]) ziGroups[t.value] = []
      ziGroups[t.value].push(t)
    }

    // 找出孤立字牌
    const isolatedZi = []
    for (const val in ziGroups) {
      if (ziGroups[val].length < 3) {
        isolatedZi.push(...ziGroups[val])
      }
    }

    // 将孤立字牌改成能凑3相同的
    if (isolatedZi.length >= 2) {
      // 找一个有2张以上的字牌组
      let targetVal = null
      for (const val in ziGroups) {
        if (ziGroups[val].length >= 2 && ziGroups[val].length < 3) {
          targetVal = val
          break
        }
      }
      if (targetVal) {
        for (const t of isolatedZi.slice(0, 3 - ziGroups[targetVal].length)) {
          const newId = 'zi_' + targetVal
          t.id = newId
          t.def = TILE_DEFS[newId]
        }
      }
    }

    return true
  }

  // 找最佳目标值：优先组顺子
  findBestValue(group, currentVal, type) {
    // 尝试改成能与相邻牌组顺子的值
    for (let offset = -2; offset <= 2; offset++) {
      if (offset === 0) continue
      const target = currentVal + offset
      if (target < 1 || target > 9) continue

      // 检查改成这个值后能否组顺子
      const hasLeft = (group[target - 1] && group[target - 1].length > 0)
      const hasRight = (group[target + 1] && group[target + 1].length > 0)
      const hasMid = (group[target - 1] && group[target + 1])

      if (hasLeft && hasRight) return target // 能组中间
      if (hasRight && group[target + 2]) return target // 能组左边
      if (hasLeft && group[target - 2]) return target // 能组右边
    }

    // 没有顺子机会，改成与某值相同凑3张
    for (const val in group) {
      if (group[val].length === 2) return Number(val)
    }
    for (const val in group) {
      if (group[val].length === 1 && Number(val) !== currentVal) return Number(val)
    }

    return null
  }
}

// ----- 主游戏 -----
const STATE = { MENU: 0, PLAY: 1, WIN: 2, LOSE: 3 }

class Game {
  constructor() {
    this.renderer = new Renderer()
    this.solver = new Solver()
    this.slot = new Slot(7)
    this.state = STATE.MENU
    this.level = 1
    this.score = 0
    this.timeLeft = 120
    this.tiles = []
    this.lastTime = Date.now()
    this.hintText = ''
    this.hintTimer = 0
    this.btnRect = null
    this.checkTimer = 0

    const self = this
    wx.onTouchStart(function (e) { self.onTouch(e) })

    this.loop()
  }

  loop() {
    const now = Date.now()
    const dt = (now - this.lastTime) / 1000
    this.lastTime = now
    this.update(dt)
    this.render()
    const self = this
    requestAnimationFrame(function () { self.loop() })
  }

  update(dt) {
    if (this.state === STATE.PLAY) {
      this.timeLeft -= dt
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.gameOver(false) }
      if (this.hintTimer > 0) { this.hintTimer -= dt; if (this.hintTimer <= 0) this.hintText = '' }

      // 定时检测可消性
      this.checkTimer -= dt
      if (this.checkTimer <= 0) {
        this.checkTimer = 1.5
        if (!this.solver.checkSolvable(this.tiles, this.slot.getTiles())) {
          if (this.solver.fixUnsolvable(this.tiles, this.slot.getTiles())) {
            this.showHint('牌面调整')
          }
        }
      }
    }
  }

  render() {
    this.renderer.clear()
    if (this.state === STATE.MENU) {
      this.btnRect = this.renderer.drawOverlay('红中麻将消消乐', '吃碰杠消除 | 挑战极限', '开始游戏')
    } else if (this.state === STATE.PLAY) {
      this.renderer.drawTiles(this.tiles)
      this.renderer.drawSlot(this.slot.slots, this.slot.max)
      this.renderer.drawUI(this.level, this.score, Math.ceil(this.timeLeft), LEVELS.length)
      if (this.hintText) this.renderer.drawHint(this.hintText)
    } else if (this.state === STATE.WIN) {
      this.renderer.drawTiles(this.tiles)
      this.renderer.drawSlot(this.slot.slots, this.slot.max)
      const next = this.level < LEVELS.length ? '下一关' : '重新开始'
      this.btnRect = this.renderer.drawOverlay('恭喜过关！', '得分: ' + this.score, next)
    } else {
      this.renderer.drawTiles(this.tiles)
      this.renderer.drawSlot(this.slot.slots, this.slot.max)
      this.btnRect = this.renderer.drawOverlay('游戏结束', '得分: ' + this.score, '重新开始')
    }
  }

  onTouch(e) {
    const t = e.touches[0]
    const x = t.clientX, y = t.clientY

    if (this.state !== STATE.PLAY) {
      if (this.btnRect && pointInRect(x, y, this.btnRect.bx, this.btnRect.by, this.btnRect.bw, this.btnRect.bh)) {
        if (this.state === STATE.MENU) this.startLevel(1)
        else if (this.state === STATE.WIN) this.startLevel(this.level < LEVELS.length ? this.level + 1 : 1)
        else this.startLevel(1)
      }
      return
    }

    // 点击牌
    const sorted = this.tiles.filter(t => !t.removed && t.visible).sort((a, b) => b.z - a.z)
    for (const tile of sorted) {
      if (this.isCovered(tile)) continue
      const pos = this.renderer.project(tile.x, tile.y, tile.z)
      const w = this.renderer.tileWidth * pos.scale
      const h = this.renderer.tileHeight * pos.scale
      if (pointInRect(x, y, pos.x - w / 2, pos.y - h / 2, w, h)) {
        this.pickTile(tile)
        return
      }
    }
  }

  isCovered(tile) {
    for (const o of this.tiles) {
      if (o === tile || o.removed) continue
      if (Math.abs(o.x - tile.x) < 20 && Math.abs(o.y - tile.y) < 26 && o.z > tile.z) return true
    }
    return false
  }

  pickTile(tile) {
    const res = this.slot.addTile(tile)
    if (!res.success) { this.showHint('卡槽已满！'); return }
    tile.removed = true
    if (res.eliminated) {
      const names = { peng: '碰！+30', gang: '杠！+40', chi: '吃！+20' }
      this.showHint(names[res.type] || '消除！')
      this.score += res.score
      this.timeLeft = Math.min(this.timeLeft + 5, getLevel(this.level).timeLimit)
    }
    if (this.tiles.every(t => t.removed)) this.gameOver(true)
    if (this.slot.isFull && !res.eliminated) this.gameOver(false)
  }

  showHint(text) { this.hintText = text; this.hintTimer = 1.2 }

  gameOver(win) {
    this.state = win ? STATE.WIN : STATE.LOSE
    if (win) this.score += Math.floor(this.timeLeft) * 10
  }

  startLevel(id) {
    const lv = getLevel(id)
    this.level = id
    this.score = 0
    this.timeLeft = lv.timeLimit
    this.slot = new Slot(lv.slots || 7) // 根据关卡配置卡槽数
    this.state = STATE.PLAY
    this.tiles = []
    this.checkTimer = 2

    // 生成牌
    const ids = getAllTileIds().filter(i => lv.types.includes(TILE_DEFS[i].type))
    const groups = []
    const gc = Math.floor(lv.tileCount / 3)
    for (let i = 0; i < gc; i++) groups.push(ids[i % ids.length])
    shuffle(groups)

    const tileIds = []
    for (const g of groups) { tileIds.push(g, g, g) }

    let idx = 0
    for (let layer = 0; layer < lv.layers && idx < tileIds.length; layer++) {
      const cnt = Math.min(Math.ceil(tileIds.length / lv.layers), tileIds.length - idx)
      const cols = Math.ceil(Math.sqrt(cnt * 1.5))
      const rows = Math.ceil(cnt / cols)
      // 间距根据列数自适应，确保不超屏幕
      const gapX = Math.min(32, (this.renderer.width * 0.8) / cols)
      const gapY = Math.min(42, (this.renderer.height * 0.5) / rows)
      for (let i = 0; i < cnt && idx < tileIds.length; i++) {
        const row = Math.floor(i / cols), col = i % cols
        const x = (col - (cols - 1) / 2) * gapX + (Math.random() - 0.5) * 4
        const y = (row - (rows - 1) / 2) * gapY + (Math.random() - 0.5) * 4
        const z = layer * 8
        this.tiles.push(new Tile(tileIds[idx], x, y, z))
        idx++
      }
    }
  }
}

// 启动游戏
new Game()
