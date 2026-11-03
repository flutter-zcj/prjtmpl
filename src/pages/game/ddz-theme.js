/**
 * @file 斗地主视觉主题。
 * 配色与尺寸由原版对局截图（720x1280）等比换算到 750x1334 逻辑分辨率得出，
 * 集中在此处便于统一微调，避免散落在场景代码里。
 */

/** 逻辑分辨率宽度 */
export const W = 750

/** 逻辑分辨率高度 */
export const H = 1334

/** 手牌尺寸 */
export const CARD_W = 84

/** 手牌高度 */
export const CARD_H = 118

/**
 * 主题色板。命名沿用牌桌语义，不按色值命名，便于整体换肤。
 */
export const COLOR = {
  /** 牌桌外圈深绿 */
  feltOuter: 0x093b25,
  /** 绒布暗部 */
  feltDark: 0x11603a,
  /** 绒布主色 */
  feltMain: 0x177a49,
  /** 绒布亮部 */
  feltLight: 0x1f8f57,
  /** 金色桌沿暗部 */
  railDark: 0x9a6a1f,
  /** 金色桌沿亮部 */
  railLight: 0xf0d089,
  /** 顶部信息栏底色 */
  barBg: 0x10281c,
  /** 主文字 */
  textMain: 0xffffff,
  /** 次要文字 */
  textSub: 0xd6e8dc,
  /** 高亮金色 */
  gold: 0xffd45e,
  /** 深金（按钮描边） */
  goldDeep: 0xb47a12,
  /** 主操作按钮 */
  btnPrimary: 0xe8a317,
  /** 次操作按钮 */
  btnSecondary: 0x2f6bd8,
  /** 聊天按钮 */
  btnChat: 0x2ba24c,
  /** 亮紫色（切换形象） */
  btnPurple: 0x7b57d6,
  /** 牌面白 */
  cardFace: 0xffffff,
  /** 牌面描边 */
  cardBorder: 0xcfd6dc,
  /** 牌背主色 */
  cardBack: 0xa8241c,
  /** 牌背暗纹 */
  cardBackDark: 0x7d1712,
  /** 红色点数 */
  red: 0xd81e06,
  /** 黑色点数 */
  black: 0x1a1a1a,
  /** 牌数徽章底 */
  badgeBlue: 0x2f7fe0
}

/** 花色字符，索引与牌数据 suit 对齐：0 方片 1 梅花 2 红桃 3 黑桃 */
export const SUIT_TEXT = ['♦', '♣', '♥', '♠']

/** 花色取色，索引与牌数据 suit 对齐 */
export const SUIT_COLOR = [COLOR.red, COLOR.black, COLOR.red, COLOR.black]

/** 点数展示文案 */
const RANK_TEXT = {
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
  15: '2',
  16: '小',
  17: '大'
}

/**
 * 取点数的展示文案
 * @param {number} rank 点数，11-14 为 JQKA，15 为 2，16/17 为大小王
 * @returns {string} 展示文案
 */
export function rankLabel(rank)
{
  return RANK_TEXT[rank] || String(rank)
}

/**
 * 数值转中文可读金额，超过一万按万/亿收敛，与原版一致
 * @param {number} value 原始数值
 * @returns {string} 展示文案
 */
export function formatMoney(value)
{
  const n = Number(value) || 0
  if (n >= 100000000)
  {
    return (n / 100000000).toFixed(1) + '亿'
  }
  if (n >= 10000)
  {
    return (n / 10000).toFixed(2) + '万'
  }
  return String(Math.round(n))
}

/**
 * 十六进制色转 CSS 颜色串
 * @param {number} hex 颜色值
 * @returns {string} CSS 颜色
 */
function css(hex)
{
  return '#' + hex.toString(16).padStart(6, '0')
}

/**
 * 绘制金元宝图标，用作欢乐豆符号
 * @param {Object} scene Phaser 场景
 * @param {number} x 中心 x
 * @param {number} y 中心 y
 * @param {number} size 尺寸
 * @returns {Object} Graphics 对象
 */
export function drawBean(scene, x, y, size)
{
  const g = scene.add.graphics({ x, y })
  const s = size / 2
  g.fillStyle(0xffcf3f, 1)
  g.fillEllipse(0, s * 0.35, s * 1.9, s * 0.95)
  g.fillStyle(0xffe07a, 1)
  g.fillTriangle(-s * 0.55, s * 0.05, s * 0.55, s * 0.05, 0, -s * 0.85)
  g.fillStyle(0xfff3c4, 1)
  g.fillCircle(0, -s * 0.28, s * 0.24)
  g.lineStyle(1.5, 0xb47a12, 0.7)
  g.strokeEllipse(0, s * 0.35, s * 1.9, s * 0.95)
  return g
}

/**
 * 绘制一张扑克牌
 * @param {Object} scene Phaser 场景
 * @param {number} x 中心 x
 * @param {number} y 中心 y
 * @param {Object} card 牌数据，含 suit 与 rank
 * @param {boolean} faceUp 是否亮牌
 * @param {number} scale 缩放
 * @returns {Object} 容器
 */
export function drawCard(scene, x, y, card, faceUp, scale)
{
  const k = scale || 1
  const w = CARD_W * k
  const h = CARD_H * k
  const box = scene.add.container(x, y)

  if (!faceUp)
  {
    const back = scene.add.graphics()
    back.fillStyle(COLOR.cardBack, 1)
    back.fillRoundedRect(-w / 2, -h / 2, w, h, 8 * k)
    back.fillStyle(COLOR.cardBackDark, 1)
    back.fillRoundedRect(-w / 2 + 5 * k, -h / 2 + 5 * k, w - 10 * k, h - 10 * k, 6 * k)
    back.lineStyle(1.5, 0xf2c14e, 0.9)
    back.strokeRoundedRect(-w / 2 + 9 * k, -h / 2 + 9 * k, w - 18 * k, h - 18 * k, 4 * k)
    back.fillStyle(0xf2c14e, 0.85)
    back.fillTriangle(0, -16 * k, 16 * k, 0, 0, 16 * k)
    back.fillTriangle(0, -16 * k, -16 * k, 0, 0, 16 * k)
    box.add(back)
    return box
  }

  const face = scene.add.graphics()
  face.fillStyle(COLOR.cardFace, 1)
  face.fillRoundedRect(-w / 2, -h / 2, w, h, 8 * k)
  face.lineStyle(1.5, COLOR.cardBorder, 1)
  face.strokeRoundedRect(-w / 2, -h / 2, w, h, 8 * k)
  box.add(face)

  const rank = card.rank
  const isJoker = rank >= 16
  const tone = isJoker ? (rank === 17 ? COLOR.red : COLOR.black) : SUIT_COLOR[card.suit] || COLOR.black
  const label = rankLabel(rank)

  if (isJoker)
  {
    const word = rank === 17 ? 'JOKER' : 'JOKER'
    const letters = scene.add
      .text(0, -4 * k, word.split('').join('\n'), {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: String(Math.round(17 * k)) + 'px',
        color: css(tone),
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: -4 * k
      })
      .setOrigin(0.5)
    box.add(letters)
    const mark = scene.add
      .text(-w / 2 + 8 * k, h / 2 - 16 * k, rank === 17 ? '大' : '小', {
        fontFamily: 'sans-serif',
        fontSize: String(Math.round(17 * k)) + 'px',
        color: css(tone),
        fontStyle: 'bold'
      })
      .setOrigin(0, 0.5)
    box.add(mark)
    return box
  }

  const rankSize = label.length > 1 ? 25 : 30
  const corner = scene.add
    .text(-w / 2 + 7 * k, -h / 2 + 4 * k, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: String(Math.round(rankSize * k)) + 'px',
      color: css(tone),
      fontStyle: 'bold'
    })
    .setOrigin(0, 0)
  box.add(corner)

  const smallSuit = scene.add
    .text(-w / 2 + 9 * k, -h / 2 + 36 * k, SUIT_TEXT[card.suit] || '', {
      fontFamily: 'sans-serif',
      fontSize: String(Math.round(20 * k)) + 'px',
      color: css(tone)
    })
    .setOrigin(0, 0)
  box.add(smallSuit)

  const bigSuit = scene.add
    .text(0, h * 0.22, SUIT_TEXT[card.suit] || '', {
      fontFamily: 'sans-serif',
      fontSize: String(Math.round(46 * k)) + 'px',
      color: css(tone)
    })
    .setOrigin(0.5)
  box.add(bigSuit)

  return box
}

/**
 * 绘制玩家头像：彩色环 + 内圈底色 + 首字
 * @param {Object} scene Phaser 场景
 * @param {number} x 中心 x
 * @param {number} y 中心 y
 * @param {number} radius 半径
 * @param {string} nickname 昵称，用于取首字
 * @param {number} ringColor 外环颜色
 * @returns {Object} 容器
 */
export function drawAvatar(scene, x, y, radius, nickname, ringColor)
{
  const box = scene.add.container(x, y)
  const g = scene.add.graphics()
  g.fillStyle(0x000000, 0.35)
  g.fillCircle(0, 3, radius + 4)
  g.lineStyle(4, ringColor, 1)
  g.strokeCircle(0, 0, radius)
  g.fillStyle(0x24523a, 1)
  g.fillCircle(0, 0, radius - 2)
  g.fillStyle(0x3c7a58, 1)
  g.fillCircle(0, -radius * 0.3, radius * 0.62)
  g.fillStyle(0x24523a, 1)
  g.fillCircle(0, radius * 0.55, radius * 0.7)
  box.add(g)

  const name = String(nickname || '玩家')
  const initial = scene.add
    .text(0, 0, name.slice(0, 1), {
      fontFamily: 'sans-serif',
      fontSize: String(Math.round(radius * 0.86)) + 'px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    .setOrigin(0.5)
  box.add(initial)
  box.setLabel = (t) =>
  {
    initial.setText(String(t || '玩家').slice(0, 1))
  }
  return box
}

/**
 * 绘制圆角按钮
 * @param {Object} scene Phaser 场景
 * @param {Object} opts 配置，含 x/y/w/h/text/fill/fontSize
 * @returns {Object} 容器，附带 setEnabled 方法
 */
export function drawButton(scene, opts)
{
  const { x, y, w, h, text, fill, fontSize } = opts
  const box = scene.add.container(x, y)
  const g = scene.add.graphics()
  g.fillStyle(0x000000, 0.28)
  g.fillRoundedRect(-w / 2, -h / 2 + 3, w, h, h / 2)
  g.fillStyle(fill, 1)
  g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
  g.fillStyle(0xffffff, 0.22)
  g.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.42, h * 0.24)
  g.lineStyle(2, 0xffffff, 0.55)
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
  box.add(g)

  const label = scene.add
    .text(0, 0, text, {
      fontFamily: 'sans-serif',
      fontSize: String(fontSize || 28) + 'px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    .setOrigin(0.5)
  label.setShadow(0, 2, '#00000066', 2)
  box.add(label)

  box.setSize(w, h)
  box.label = label
  box.setEnabled = (enabled) =>
  {
    box.setAlpha(enabled ? 1 : 0.45)
    if (enabled)
    {
      box.setInteractive({ useHandCursor: true })
    }
    else
    {
      box.disableInteractive()
    }
  }
  box.setEnabled(true)
  return box
}

/**
 * 绘制六边形牌数徽章
 * @param {Object} scene Phaser 场景
 * @param {number} x 中心 x
 * @param {number} y 中心 y
 * @param {number} size 半径
 * @returns {Object} 容器，含 setText 方法
 */
export function drawCountBadge(scene, x, y, size)
{
  const box = scene.add.container(x, y)
  const g = scene.add.graphics()
  const walk = () =>
  {
    g.beginPath()
    for (let i = 0; i < 6; i += 1)
    {
      const a = (Math.PI / 3) * i - Math.PI / 6
      const px = Math.cos(a) * size
      const py = Math.sin(a) * size
      if (i === 0)
      {
        g.moveTo(px, py)
      }
      else
      {
        g.lineTo(px, py)
      }
    }
    g.closePath()
  }
  g.fillStyle(0x1b4f9c, 1)
  walk()
  g.fillPath()
  g.lineStyle(2, 0x7fb6ff, 0.9)
  walk()
  g.strokePath()
  box.add(g)
  const t = scene.add
    .text(0, 0, '', {
      fontFamily: 'sans-serif',
      fontSize: String(Math.round(size * 0.95)) + 'px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    .setOrigin(0.5)
  box.add(t)
  box.setText = (v) => t.setText(String(v))
  return box
}

/**
 * 绘制竖向渐变色块，用于桌面绒布的径向感
 * @param {Object} scene Phaser 场景
 * @param {number} cx 中心 x
 * @param {number} cy 中心 y
 * @param {number} rw 椭圆半宽
 * @param {number} rh 椭圆半高
 * @param {number} base 基色
 * @param {number} steps 叠加层数
 * @returns {void}
 */
export function drawFeltGradient(scene, cx, cy, rw, rh, base, steps)
{
  const g = scene.add.graphics()
  const n = steps || 16
  const r0 = (base >> 16) & 0xff
  const g0 = (base >> 8) & 0xff
  const b0 = base & 0xff
  for (let i = n; i >= 1; i -= 1)
  {
    const t = i / n
    const k = 1 - t * 0.24
    const color = (Math.round(r0 * k) << 16) | (Math.round(g0 * k) << 8) | Math.round(b0 * k)
    g.fillStyle(color, 1)
    g.fillEllipse(cx, cy, rw * 2 * t, rh * 2 * t)
  }
}

/**
 * 生成容器内的纯色文字
 * @param {Object} scene Phaser 场景
 * @param {number} x 位置 x
 * @param {number} y 位置 y
 * @param {string} text 文案
 * @param {Object} style 文本样式
 * @returns {Object} Text 对象
 */
export function makeText(scene, x, y, text, style)
{
  return scene.add.text(x, y, text, style)
}
