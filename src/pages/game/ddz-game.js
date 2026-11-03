/**
 * @file 斗地主牌桌 Phaser 3 场景。
 * 逻辑分辨率 750x1334，由 Scale.FIT 适配屏幕。
 * 视觉依据原版对局截图逐元素对齐：顶部信息栏、四方座位、绿绒金沿牌桌、
 * 蓝色牌数徽章、大牌面手牌、底部常驻操作条。
 */

import {
  W,
  H,
  CARD_W,
  CARD_H,
  COLOR,
  drawCard,
  drawAvatar,
  drawButton,
  drawCountBadge,
  drawFeltGradient,
  drawBean,
  formatMoney
} from './ddz-theme.js'

/** 座位布局：索引 0 为自己（左下），1 为右对手，2 为左对手 */
const SEAT_POS = [
  { x: 96, y: 1008 },
  { x: 642, y: 330 },
  { x: 108, y: 330 }
]

/** 自己手牌基线 y */
const HAND_Y = 1152

/** 牌桌椭圆中心与半径 */
const TABLE = { cx: 375, cy: 742, rw: 458, rh: 322 }

/**
 * 创建牌桌场景类
 * @param {Object} Phaser Phaser 全局对象
 * @param {Object} hooks 交互回调集合
 * @returns {Function} Scene 类
 */
export default function createDdzScene(Phaser, hooks)
{
  return class DdzScene extends Phaser.Scene {
    constructor()
    {
      super({ key: 'DdzScene' })
      this.cardNodes = []
      this.handNodes = []
      this.selected = new Set()
      this.state = null
      this.seatNodes = []
      this.buttons = {}
    }

    /**
     * 构建静态场景骨架
     * @returns {void}
     */
    create()
    {
      this.drawTable()
      this.buildTopBar()
      this.buildActivityBar()
      this.buildSeats()
      this.buildCenter()
      this.buildHandArea()
      this.buildActionButtons()
      this.buildBottomBar()
      this.buildChatPanel()
      this.buildToast()
      if (hooks.onReady)
      {
        hooks.onReady(this)
      }
    }

    /**
     * 绘制牌桌：深绿底 + 木质外框 + 金色桌沿 + 绒布径向渐变 + 中央暗纹
     * @returns {void}
     */
    drawTable()
    {
      const g = this.add.graphics()
      g.fillStyle(0x07291a, 1)
      g.fillRect(0, 0, W, H)
      g.fillStyle(COLOR.feltOuter, 1)
      g.fillRect(0, 0, W, H)

      const shade = this.add.graphics()
      shade.fillStyle(0x000000, 0.18)
      shade.fillRect(0, 0, W, 120)
      shade.fillStyle(0x000000, 0.22)
      shade.fillRect(0, H - 140, W, 140)

      const rail = this.add.graphics()
      rail.lineStyle(30, COLOR.railDark, 1)
      rail.strokeEllipse(TABLE.cx, TABLE.cy, TABLE.rw * 2 + 30, TABLE.rh * 2 + 30)
      rail.lineStyle(12, COLOR.railLight, 1)
      rail.strokeEllipse(TABLE.cx, TABLE.cy, TABLE.rw * 2 + 22, TABLE.rh * 2 + 22)
      rail.lineStyle(3, 0x6b4312, 0.8)
      rail.strokeEllipse(TABLE.cx, TABLE.cy, TABLE.rw * 2 + 8, TABLE.rh * 2 + 8)

      drawFeltGradient(this, TABLE.cx, TABLE.cy, TABLE.rw, TABLE.rh, COLOR.feltLight, 20)
      const ring = this.add.graphics()
      ring.lineStyle(2, 0x0a3f27, 0.55)
      for (let i = 1; i <= 3; i += 1)
      {
        ring.strokeEllipse(
          TABLE.cx,
          TABLE.cy,
          TABLE.rw * 2 * (1 - i * 0.18),
          TABLE.rh * 2 * (1 - i * 0.18)
        )
      }

      const mark = this.add
        .text(TABLE.cx, TABLE.cy + 138, '欢乐斗地主', {
          fontFamily: 'sans-serif',
          fontSize: '62px',
          color: '#ffffff',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setAlpha(0.045)
        .setAngle(-4)
      mark.setDepth(1)
    }

    /**
     * 顶部信息栏：返回、房间号与时间、底分牌、任务与更多
     * @returns {void}
     */
    buildTopBar()
    {
      const g = this.add.graphics()
      g.fillStyle(COLOR.barBg, 0.94)
      g.fillRect(0, 0, W, 92)
      g.lineStyle(2, 0xd8ae4e, 0.5)
      g.lineBetween(0, 92, W, 92)

      const back = this.add.container(48, 46)
      const bg = this.add.graphics()
      bg.fillStyle(0x000000, 0.4)
      bg.fillRoundedRect(-28, -28, 56, 56, 12)
      bg.lineStyle(2, 0xd8ae4e, 0.7)
      bg.strokeRoundedRect(-28, -28, 56, 56, 12)
      const arrow = this.add
        .text(0, 0, '‹', { fontFamily: 'sans-serif', fontSize: '46px', color: '#ffe9a8' })
        .setOrigin(0.5)
      back.add([bg, arrow])
      back.setSize(56, 56)
      back.setInteractive({ useHandCursor: true })
      back.on('pointerdown', () =>
      {
        if (hooks.onAction)
        {
          hooks.onAction('quit', [])
        }
      })

      this.roomText = this.add.text(96, 22, '经典场 · 1/3', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#e9f3ec'
      })
      this.clockText = this.add.text(96, 54, '--:--', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#9fc4ad'
      })

      const baseCard = this.add.container(W / 2, 46)
      const cg = this.add.graphics()
      cg.fillStyle(0xffffff, 1)
      cg.fillRoundedRect(-34, -30, 68, 60, 8)
      cg.lineStyle(2, 0xd8ae4e, 1)
      cg.strokeRoundedRect(-34, -30, 68, 60, 8)
      this.baseText = this.add
        .text(0, -2, '0', {
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontSize: '26px',
          color: '#c0392b',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
      const baseTag = this.add
        .text(0, 20, '底分', { fontFamily: 'sans-serif', fontSize: '16px', color: '#8a6a2a' })
        .setOrigin(0.5)
      baseCard.add([cg, this.baseText, baseTag])

      this.buildTopIcon(628, 46, '任务', () => this.toast('任务中心开放中'))
      this.buildTopIcon(700, 46, '更多', () => this.toast('更多设置'))
    }

    /**
     * 顶栏右侧图标按钮
     * @param {number} x 位置 x
     * @param {number} y 位置 y
     * @param {string} text 文案
     * @param {Function} onClick 点击回调
     * @returns {void}
     */
    buildTopIcon(x, y, text, onClick)
    {
      const box = this.add.container(x, y)
      const g = this.add.graphics()
      g.fillStyle(0x1c4a33, 1)
      g.fillRoundedRect(-30, -24, 60, 48, 12)
      g.lineStyle(1.5, 0xd8ae4e, 0.6)
      g.strokeRoundedRect(-30, -24, 60, 48, 12)
      const t = this.add
        .text(0, 0, text, { fontFamily: 'sans-serif', fontSize: '20px', color: '#ffe9a8' })
        .setOrigin(0.5)
      box.add([g, t])
      box.setSize(60, 48)
      box.setInteractive({ useHandCursor: true })
      box.on('pointerdown', onClick)
    }

    /**
     * 顶部活动横幅，文案取自原版活动条
     * @returns {void}
     */
    buildActivityBar()
    {
      const box = this.add.container(20, 108)
      const g = this.add.graphics()
      g.fillStyle(0x000000, 0.34)
      g.fillRoundedRect(0, 0, 396, 40, 20)
      g.lineStyle(1, 0xffe9a8, 0.28)
      g.strokeRoundedRect(0, 0, 396, 40, 20)
      const tag = this.add
        .text(10, 20, '活动', {
          fontFamily: 'sans-serif',
          fontSize: '18px',
          color: '#3a2a05',
          backgroundColor: '#ffd45e',
          padding: { x: 8, y: 2 }
        })
        .setOrigin(0, 0.5)
      const txt = this.add
        .text(72, 20, '该不该约束？点我看看就知道', {
          fontFamily: 'sans-serif',
          fontSize: '20px',
          color: '#ffffff'
        })
        .setOrigin(0, 0.5)
      box.add([g, tag, txt])
      box.setSize(396, 40)
      box.setInteractive({ useHandCursor: true })
      box.on('pointerdown', () => this.toast('活动详情'))
    }

    /**
     * 构建三个座位节点
     * @returns {void}
     */
    buildSeats()
    {
      this.seatNodes = []
      SEAT_POS.forEach((pos, i) =>
      {
        const box = this.add.container(pos.x, pos.y)
        const ringColor = i === 0 ? 0xffd45e : 0x63e6ff
        const avatar = drawAvatar(this, 0, 0, 44, '', ringColor)
        const nameText = this.add
          .text(0, 54, '', {
            fontFamily: 'sans-serif',
            fontSize: '22px',
            color: '#eaf6ee'
          })
          .setOrigin(0.5, 0)
          .setShadow(0, 1, '#000000aa', 2)
        const coinIcon = this.add.container(-8, 88)
        const coinBg = this.add.graphics()
        coinBg.fillStyle(0x000000, 0.35)
        coinBg.fillRoundedRect(-78, -14, 168, 28, 14)
        coinIcon.add(coinBg)
        const bean = drawBean(this, -58, 0, 22)
        const coinText = this.add
          .text(-46, 0, '0', { fontFamily: 'sans-serif', fontSize: '21px', color: '#ffe9a8' })
          .setOrigin(0, 0.5)
        coinIcon.add([bean, coinText])

        const lordTag = this.add.container(0, -62)
        const lg = this.add.graphics()
        lg.fillStyle(0xd8352a, 1)
        lg.fillRoundedRect(-34, -15, 68, 30, 8)
        lg.lineStyle(2, 0xffd45e, 1)
        lg.strokeRoundedRect(-34, -15, 68, 30, 8)
        const lt = this.add
          .text(0, 0, '地主', {
            fontFamily: 'sans-serif',
            fontSize: '19px',
            color: '#ffe9a8',
            fontStyle: 'bold'
          })
          .setOrigin(0.5)
        lordTag.add([lg, lt])
        lordTag.setVisible(false)

        const badge = drawCountBadge(this, 62, -34, 27)
        const passBox = this.add.container(0, -96)
        const pb = this.add.graphics()
        pb.fillStyle(0x000000, 0.42)
        pb.fillRoundedRect(-46, -24, 92, 48, 12)
        pb.lineStyle(2, 0xffd45e, 0.85)
        pb.strokeRoundedRect(-46, -24, 92, 48, 12)
        const passText = this.add
          .text(0, 0, '不出', {
            fontFamily: 'sans-serif',
            fontSize: '26px',
            color: '#ffe08a',
            fontStyle: 'bold'
          })
          .setOrigin(0.5)
          .setShadow(0, 2, '#00000099', 3)
        passBox.add([pb, passText])
        passBox.setAlpha(0)

        if (i === 0)
        {
          nameText.setPosition(56, 6).setOrigin(0, 0.5)
          coinIcon.setVisible(false)
        }
        box.add([avatar, nameText, coinIcon, lordTag, badge, passBox])
        this.seatNodes.push({ box, avatar, nameText, coinText, lordTag, badge, passBox })
      })
    }

    /**
     * 中央区域：底牌展示、上一手牌、牌型文字、炸弹特效层
     * @returns {void}
     */
    buildCenter()
    {
      this.bottomSlot = this.add.container(W / 2, 208)
      this.playSlot = this.add.container(W / 2, TABLE.cy - 76)
      this.playLabel = this.add
        .text(W / 2, TABLE.cy + 44, '', {
          fontFamily: 'sans-serif',
          fontSize: '26px',
          color: '#ffe9a8',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setShadow(0, 2, '#000000aa', 3)
      this.effectLayer = this.add.container(W / 2, TABLE.cy - 108)
    }

    /**
     * 手牌区容器
     * @returns {void}
     */
    buildHandArea()
    {
      const tray = this.add.graphics()
      tray.fillStyle(0x02150d, 0.42)
      tray.fillRect(0, HAND_Y - CARD_H / 2 - 26, W, CARD_H / 2 + 60)
      tray.fillStyle(0x000000, 0.18)
      tray.fillRect(0, HAND_Y - CARD_H / 2 - 26, W, 10)
      this.handContainer = this.add.container(0, 0)
      this.selectedLabel = this.add
        .text(146, 1004, '', {
          fontFamily: 'sans-serif',
          fontSize: '24px',
          color: '#ffd45e'
        })
        .setOrigin(0.5)
    }

    /**
     * 右下角操作按钮组：提示 / 不出 / 出牌，叫分与加倍复用同一组
     * @returns {void}
     */
    buildActionButtons()
    {
      this.buttons = {}
      const mk = (key, text, x, fill, w) =>
      {
        const btn = drawButton(this, {
          x,
          y: 1042,
          w: w || 118,
          h: 66,
          text,
          fill,
          fontSize: 28
        })
        btn.setDepth(30)
        btn.on('pointerdown', () =>
        {
          if (hooks.onAction)
          {
            hooks.onAction(key, this.collectSelected())
          }
        })
        this.buttons[key] = btn
      }
      mk('hint', '提示', 404, COLOR.btnSecondary)
      mk('pass', '不出', 532, COLOR.btnSecondary)
      mk('play', '出牌', 664, COLOR.btnPrimary, 124)
      this.setButtonsEnabled(false)
    }

    /**
     * 底部常驻条：切换形象、欢乐豆、底分、托管、聊天
     * @returns {void}
     */
    buildBottomBar()
    {
      const g = this.add.graphics()
      g.fillStyle(0x0a2417, 0.96)
      g.fillRect(0, H - 98, W, 98)
      g.lineStyle(2, 0xd8ae4e, 0.45)
      g.lineBetween(0, H - 98, W, H - 98)

      const swap = drawButton(this, {
        x: 92,
        y: H - 50,
        w: 156,
        h: 54,
        text: '切换形象',
        fill: COLOR.btnPurple,
        fontSize: 24
      })
      swap.on('pointerdown', () => this.toast('形象切换开放中'))

      drawBean(this, 198, H - 50, 26)
      this.beanText = this.add
        .text(214, H - 50, '0', {
          fontFamily: 'sans-serif',
          fontSize: '24px',
          color: '#ffe9a8'
        })
        .setOrigin(0, 0.5)

      this.multiText = this.add
        .text(452, H - 50, '倍数 x1', {
          fontFamily: 'sans-serif',
          fontSize: '24px',
          color: '#ffd45e'
        })
        .setOrigin(0.5)

      const auto = drawButton(this, {
        x: 576,
        y: H - 50,
        w: 104,
        h: 54,
        text: '托管',
        fill: 0x4a5f52,
        fontSize: 24
      })
      auto.on('pointerdown', () =>
      {
        if (hooks.onAction)
        {
          hooks.onAction('auto', [])
        }
      })
      this.autoButton = auto

      const chat = drawButton(this, {
        x: 692,
        y: H - 50,
        w: 96,
        h: 54,
        text: '聊天',
        fill: COLOR.btnChat,
        fontSize: 24
      })
      chat.on('pointerdown', () => this.toggleChat())
    }

    /**
     * 聊天面板，快捷短语取自原版 GameTalkConfigCfg
     * @returns {void}
     */
    buildChatPanel()
    {
      this.chatPanel = this.add.container(W / 2, H / 2).setDepth(60).setVisible(false)
      const mask = this.add
        .rectangle(0, 0, W, H, 0x000000, 0.55)
        .setInteractive()
        .on('pointerdown', () => this.toggleChat())
      this.chatPanel.add(mask)

      const g = this.add.graphics()
      g.fillStyle(0x14301f, 1)
      g.fillRoundedRect(-320, -300, 640, 600, 20)
      g.lineStyle(3, 0xd8ae4e, 0.85)
      g.strokeRoundedRect(-320, -300, 640, 600, 20)
      this.chatPanel.add(g)

      const title = this.add
        .text(0, -262, '快捷语音', {
          fontFamily: 'sans-serif',
          fontSize: '28px',
          color: '#ffd45e',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
      this.chatPanel.add(title)

      const phrases = [
        '炸他！',
        '压他',
        '让他出',
        '出单牌',
        '出对子',
        '出三带',
        '不要出，让我来！',
        '出小牌，让我顺一手',
        '顺牌给我，这局让我先走'
      ]
      phrases.forEach((p, i) =>
      {
        const row = Math.floor(i / 2)
        const col = i % 2
        const w = 292
        const x = i === 8 ? 0 : (col === 0 ? -152 : 152)
        const y = -196 + row * 84
        const btn = drawButton(this, {
          x,
          y,
          w,
          h: 62,
          text: p,
          fill: 0x25543a,
          fontSize: p.length > 7 ? 20 : 24
        })
        btn.on('pointerdown', () =>
        {
          this.toggleChat()
          this.say(p)
          if (hooks.onChat)
          {
            hooks.onChat(p)
          }
        })
        this.chatPanel.add(btn)
      })
    }

    /**
     * 切换聊天面板显隐
     * @returns {void}
     */
    toggleChat()
    {
      const willShow = !this.chatPanel.visible
      this.chatPanel.setVisible(willShow)
      if (willShow && hooks.onPanelOpen)
      {
        hooks.onPanelOpen()
      }
    }

    /**
     * 在自己座位旁弹出语音气泡
     * @param {string} text 台词
     * @returns {void}
     */
    say(text)
    {
      this.bubble(text, 0)
    }

    /**
     * 在指定座位旁显示浮动气泡
     * @param {string} text 文案
     * @param {number} seatIdx 座位置
     * @returns {void}
     */
    bubble(text, seatIdx)
    {
      const pos = SEAT_POS[seatIdx] || SEAT_POS[0]
      const dir = seatIdx === 1 ? -1 : 1
      const box = this.add.container(pos.x + dir * 96, pos.y - 96).setDepth(50)
      const label = this.add
        .text(0, 0, text, {
          fontFamily: 'sans-serif',
          fontSize: '22px',
          color: '#3a2a05'
        })
        .setOrigin(0.5)
      const w = Math.max(120, label.width + 36)
      const bg = this.add.graphics()
      bg.fillStyle(0xfff4d0, 1)
      bg.fillRoundedRect(-w / 2, -26, w, 52, 16)
      bg.lineStyle(2, 0xd8ae4e, 1)
      bg.strokeRoundedRect(-w / 2, -26, w, 52, 16)
      label.setPosition(0, 0)
      box.add([bg, label])
      this.tweens.add({
        targets: box,
        alpha: 0,
        delay: 1400,
        duration: 500,
        onComplete: () => box.destroy()
      })
    }

    /**
     * 轻提示
     * @returns {void}
     */
    buildToast()
    {
      this.toastText = this.add
        .text(W / 2, H / 2 - 180, '', {
          fontFamily: 'sans-serif',
          fontSize: '30px',
          color: '#ffffff',
          backgroundColor: '#000000cc',
          padding: { x: 26, y: 14 }
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setDepth(70)
    }

    /**
     * 显示浮动提示
     * @param {string} msg 文案
     * @returns {void}
     */
    toast(msg)
    {
      this.toastText.setText(msg).setAlpha(1)
      this.tweens.add({ targets: this.toastText, alpha: 0, delay: 1200, duration: 600 })
    }

    /**
     * 批量设置操作按钮可用状态
     * @param {boolean} enabled 是否可点
     * @returns {void}
     */
    setButtonsEnabled(enabled)
    {
      ['hint', 'pass', 'play'].forEach((k) =>
      {
        const btn = this.buttons[k]
        if (btn && btn.setEnabled)
        {
          btn.setEnabled(enabled)
        }
      })
    }

    /**
     * 切换按钮组合：出牌阶段 / 叫分阶段 / 加倍阶段
     * @param {number} phaseCode 阶段码
     * @returns {void}
     */
    applyPhaseButtons(phaseCode)
    {
      const layout = {
        1: [
          { key: 'bid0', text: '不叫', fill: 0x4a5f52 },
          { key: 'bid1', text: '1分', fill: COLOR.btnSecondary },
          { key: 'bid2', text: '2分', fill: COLOR.btnSecondary },
          { key: 'bid3', text: '3分', fill: COLOR.btnPrimary }
        ],
        2: [
          { key: 'nodouble', text: '不加倍', fill: 0x4a5f52 },
          { key: 'double', text: '加倍', fill: COLOR.btnPrimary }
        ],
        3: [
          { key: 'hint', text: '提示', fill: COLOR.btnSecondary },
          { key: 'pass', text: '不出', fill: COLOR.btnSecondary },
          { key: 'play', text: '出牌', fill: COLOR.btnPrimary }
        ]
      }
      const seq = layout[phaseCode] || layout[3]
      const sig = seq.map((s) => s.key).join(',')
      if (this.phaseSig === sig)
      {
        return
      }
      this.phaseSig = sig
      Object.keys(this.buttons).forEach((k) =>
      {
        if (this.buttons[k])
        {
          this.buttons[k].destroy()
        }
      })
      this.buttons = {}
      const n = seq.length
      const w = n >= 4 ? 104 : n === 3 ? 118 : 140
      const gap = 10
      const total = n * w + (n - 1) * gap
      const start = 718 - total + w / 2
      seq.forEach((s, i) =>
      {
        const btn = drawButton(this, {
          x: start + i * (w + gap),
          y: 1042,
          w,
          h: 66,
          text: s.text,
          fill: s.fill,
          fontSize: n >= 4 ? 25 : 28
        })
        btn.setDepth(30)
        btn.on('pointerdown', () =>
        {
          if (hooks.onAction)
          {
            hooks.onAction(s.key, this.collectSelected())
          }
        })
        this.buttons[s.key] = btn
      })
      this.setButtonsEnabled(false)
    }

    /**
     * 按服务端状态刷新整个牌桌
     * @param {Object} state 状态快照
     * @returns {void}
     */
    renderState(state)
    {
      this.state = state
      this.baseText.setText(String(state.base_score || 0))
      this.multiText.setText('倍数 x' + (state.multiplier || 1))
      this.beanText.setText(formatMoney(state.my_coin || 0))
      this.renderSeats(state)
      this.renderBottom(state)
      this.renderPlayed(state)
      this.applyPhaseButtons(state.phase_code)
      this.renderHand(state)

      const myTurn = state.your_turn && state.phase_code >= 1 && state.phase_code <= 3
      this.setButtonsEnabled(myTurn)
      if (myTurn && state.phase_code === 1)
      {
        this.toast('轮到你叫分')
      }
      if (myTurn && state.phase_code === 2)
      {
        this.toast('是否加倍')
      }
      if (state.phase_code === 4)
      {
        this.showResult(state)
      }
    }

    /**
     * 刷新座位信息
     * @param {Object} state 状态快照
     * @returns {void}
     */
    renderSeats(state)
    {
      const players = state.players || []
      players.forEach((p) =>
      {
        const idx = p.seat
        if (idx < 0 || idx > 2)
        {
          return
        }
        const node = this.seatNodes[idx]
        node.nameText.setText(p.nickname || '座位' + p.seat)
        node.avatar.setLabel(p.nickname || '玩家')
        node.coinText.setText(formatMoney(p.coin || p.score || 0))
        node.lordTag.setVisible(Boolean(p.is_landlord))
        node.badge.setVisible(true)
        node.badge.setText(p.card_count || 0)
        node.passBox.setAlpha(p.passed ? 1 : 0)
      })
      this.seatNodes.forEach((node, i) =>
      {
        const has = players.some((p) => p.seat === i)
        node.box.setVisible(has)
      })
    }

    /**
     * 刷新底牌
     * @param {Object} state 状态快照
     * @returns {void}
     */
    renderBottom(state)
    {
      this.bottomSlot.removeAll(true)
      const cards = state.bottom || []
      if (!cards.length)
      {
        return
      }
      const reveal =
        state.phase_code >= 3 || state.landlord === state.my_seat || state.phase_code >= 2
      cards.forEach((card, i) =>
      {
        const c = drawCard(this, (i - 1) * 78, 0, card, reveal, 0.72)
        this.bottomSlot.add(c)
      })
    }

    /**
     * 刷新中央出牌区
     * @param {Object} state 状态快照
     * @returns {void}
     */
    renderPlayed(state)
    {
      this.playSlot.removeAll(true)
      const cards = state.last_cards || []
      if (!cards.length)
      {
        this.playLabel.setText('')
        return
      }
      const n = cards.length
      const step = Math.min(CARD_W * 0.62, (W - 240) / Math.max(n, 1))
      cards.forEach((card, i) =>
      {
        const offset = (i - (n - 1) / 2) * step
        const c = drawCard(this, offset, 0, card, true, 0.86)
        this.playSlot.add(c)
      })
      this.playLabel.setText(
        (state.last_type || '') + (state.last_type ? ' · ' : '') + n + ' 张'
      )
    }

    /**
     * 刷新手牌
     * @param {Object} state 状态快照
     * @returns {void}
     */
    renderHand(state)
    {
      this.handContainer.removeAll(true)
      this.handNodes = []
      this.selected.clear()
      const cards = state.my_cards || []
      this.selectedLabel.setText('')
      if (!cards.length)
      {
        return
      }
      const n = cards.length
      const maxSpan = W - 60
      const step = n > 1 ? Math.min(CARD_W * 0.62, (maxSpan - CARD_W) / (n - 1)) : 0
      const totalW = step * (n - 1) + CARD_W
      const startX = (W - totalW) / 2 + CARD_W / 2
      cards.forEach((card, i) =>
      {
        const x = startX + i * step
        const node = drawCard(this, x, HAND_Y, card, true, 1)
        node.setDepth(10 + i)
        node.setInteractive(
          new Phaser.Geom.Rectangle(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H),
          Phaser.Geom.Rectangle.Contains
        )
        const key = card.suit + '-' + card.rank + '-' + i
        node.on('pointerdown', () =>
        {
          if (this.selected.has(key))
          {
            this.selected.delete(key)
            node.y = HAND_Y
          }
          else
          {
            this.selected.add(key)
            node.y = HAND_Y - 28
          }
          this.selectedLabel.setText(this.selected.size ? '已选 ' + this.selected.size + ' 张' : '')
          if (hooks.onSelect)
          {
            hooks.onSelect(this.selected.size)
          }
        })
        this.handContainer.add(node)
        this.handNodes.push({ node, card, key, baseY: HAND_Y })
      })
    }

    /**
     * 收集当前选中的牌
     * @returns {Array} 牌数据数组
     */
    collectSelected()
    {
      return this.handNodes.filter((n) => this.selected.has(n.key)).map((n) => n.card)
    }

    /**
     * 清空选中状态
     * @returns {void}
     */
    clearSelection()
    {
      this.selected.clear()
      this.handNodes.forEach((n) =>
      {
        n.node.y = n.baseY
      })
      this.selectedLabel.setText('')
    }

    /**
     * 播放牌型特效：金色爆炸 + 牌型大字
     * @param {string} type 牌型名称
     * @param {boolean} isBomb 是否炸弹类
     * @returns {void}
     */
    playEffect(type, isBomb)
    {
      this.effectLayer.removeAll(true)
      const g = this.add.graphics()
      const rays = isBomb ? 14 : 8
      g.fillStyle(0xffd45e, 0.85)
      for (let i = 0; i < rays; i += 1)
      {
        const a = ((Math.PI * 2) / rays) * i
        const len = isBomb ? 240 : 170
        g.fillTriangle(
          Math.cos(a) * len,
          Math.sin(a) * len,
          Math.cos(a + 0.18) * 40,
          Math.sin(a + 0.18) * 40,
          Math.cos(a - 0.18) * 40,
          Math.sin(a - 0.18) * 40
        )
      }
      const glow = this.add.graphics()
      glow.fillStyle(0xffb830, 0.55)
      glow.fillCircle(0, 0, isBomb ? 130 : 96)
      const txt = this.add
        .text(0, 0, type, {
          fontFamily: 'sans-serif',
          fontSize: isBomb ? '72px' : '58px',
          color: '#fff6c8',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setShadow(0, 4, '#8a3a00', 8)
      this.effectLayer.add([g, glow, txt])
      this.effectLayer.setScale(0.6).setAlpha(1)
      this.tweens.add({
        targets: this.effectLayer,
        scale: 1.15,
        duration: 220,
        ease: 'Back.easeOut'
      })
      this.tweens.add({
        targets: this.effectLayer,
        alpha: 0,
        delay: 700,
        duration: 400,
        onComplete: () => this.effectLayer.removeAll(true)
      })
    }

    /**
     * 结算浮层
     * @param {Object} state 状态快照
     * @returns {void}
     */
    showResult(state)
    {
      if (this.resultShown)
      {
        return
      }
      this.resultShown = true
      const my = (state.players || []).find((p) => p.seat === state.my_seat)
      const won = my ? my.score > 0 : false
      const box = this.add.container(W / 2, H / 2).setDepth(80)
      const mask = this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setInteractive()
      const g = this.add.graphics()
      g.fillStyle(0x14301f, 1)
      g.fillRoundedRect(-300, -220, 600, 440, 24)
      g.lineStyle(4, 0xd8ae4e, 0.9)
      g.strokeRoundedRect(-300, -220, 600, 440, 24)
      const title = this.add
        .text(0, -150, won ? '胜利' : '失败', {
          fontFamily: 'sans-serif',
          fontSize: '76px',
          color: won ? '#7dff9b' : '#ff7d7d',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setShadow(0, 4, '#000000aa', 8)
      const detail = this.add
        .text(
          0,
          -40,
          '底分 ' +
            state.base_score +
            '  倍数 x' +
            state.multiplier +
            '\n本局得分 ' +
            ((my && my.score) || 0),
          {
            fontFamily: 'sans-serif',
            fontSize: '30px',
            color: '#e8f5e9',
            align: 'center',
            lineSpacing: 12
          }
        )
        .setOrigin(0.5)
      const back = drawButton(this, {
        x: 0,
        y: 140,
        w: 240,
        h: 72,
        text: '返回大厅',
        fill: COLOR.btnPrimary,
        fontSize: 30
      })
      back.on('pointerdown', () =>
      {
        if (hooks.onAction)
        {
          hooks.onAction('quit', [])
        }
      })
      box.add([mask, g, title, detail, back])
    }

    /**
     * 重置结算态，用于进入下一局
     * @returns {void}
     */
    resetResult()
    {
      this.resultShown = false
    }

    /**
     * 炸弹震屏
     * @returns {void}
     */
    shake()
    {
      this.cameras.main.shake(260, 0.008)
    }

    /**
     * 每帧刷新房间号与时钟，保持与原版一致的常驻信息
     * @returns {void}
     */
    update()
    {
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      if (this.clockText && this.clockText.text !== hh + ':' + mm)
      {
        this.clockText.setText(hh + ':' + mm)
      }
    }
  }
}
