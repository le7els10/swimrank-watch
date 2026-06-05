import { createWidget, widget, align } from '@zos/ui'
import { back } from '@zos/router'
import { getText } from '@zos/i18n'
import { localStorage } from '@zos/storage'
import { SCREEN_W, SAFE_X, SAFE_W, C, DISCIPLINE_MAP, WORLD } from '../../utils/constants.js'

const CX = SCREEN_W / 2

Page({
  onInit() {
    this.discId = localStorage.getItem('selectedDiscipline') || '100'
    this.disc   = DISCIPLINE_MAP[this.discId] ?? DISCIPLINE_MAP['100']

    const wr = localStorage.getItem('worldRanks')
    const real = wr ? JSON.parse(wr)[this.discId] : null
    this.wr = real ?? WORLD  // fall back to demo data
  },

  build() {
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: SCREEN_W, h: SCREEN_W, color: C.bg })

    // ── Header ──────────────────────────────────────────────────────
    createWidget(widget.BUTTON, {
      x: SAFE_X, y: 14, w: 50, h: 50,
      text: '‹', text_size: 40, radius: 25,
      normal_color: C.bg, press_color: C.card,
      text_color: C.cyan, click_func: () => back(),
    })

    createWidget(widget.TEXT, {
      x: 0, y: 14, w: SCREEN_W, h: 36,
      text: getText('ranking_mundial_titulo'),
      text_size: 28, align_h: align.CENTER_H,
      color: C.white,
    })

    createWidget(widget.TEXT, {
      x: 0, y: 52, w: SCREEN_W, h: 26,
      text: `${getText('tu_pos_kicker')} · ${this.disc?.short ?? '100'} M`,
      text_size: 18, align_h: align.CENTER_H,
      color: C.cyan,
    })

    createWidget(widget.FILL_RECT, {
      x: SAFE_X, y: 82, w: SAFE_W, h: 1, color: C.line,
    })

    // ── Posición grande ────────────────────────────────────────────
    const rank = this.wr?.rank ?? WORLD.rank
    const total = this.wr?.total ?? WORLD.total

    // Up arrow
    createWidget(widget.TEXT, {
      x: 0, y: 96, w: CX - 20, h: 70,
      text: '▲',
      text_size: 42, align_h: align.RIGHT,
      color: C.cyan,
    })

    // Rank number (giant)
    createWidget(widget.TEXT, {
      x: CX - 16, y: 88, w: 180, h: 90,
      text: `#${rank}`,
      text_size: 84, align_h: align.LEFT,
      color: C.cyan,
    })

    // "de N nadadores"
    createWidget(widget.TEXT, {
      x: 0, y: 182, w: SCREEN_W, h: 32,
      text: `${getText('de')} ${total.toLocaleString()} ${getText('nadadores')}`,
      text_size: 22, align_h: align.CENTER_H,
      color: C.ink60,
    })

    // Percentile chip
    const pct = this.wr?.percentile ?? WORLD.percentile
    const chipW = 200
    createWidget(widget.FILL_RECT, {
      x: CX - chipW / 2, y: 222, w: chipW, h: 38,
      radius: 19, color: 0x1A1100,
    })
    createWidget(widget.TEXT, {
      x: CX - chipW / 2, y: 228, w: chipW, h: 26,
      text: `★  ${pct} mundial`,
      text_size: 20, align_h: align.CENTER_H,
      color: C.gold,
    })

    // ── Top 3 mundial ──────────────────────────────────────────────
    createWidget(widget.TEXT, {
      x: 0, y: 274, w: SCREEN_W, h: 28,
      text: 'TOP 3 ' + getText('ranking_mundial_titulo').split(' ')[0],
      text_size: 18, align_h: align.CENTER_H,
      color: C.ink60,
    })

    const top3 = WORLD.top3
    const toneColors = [C.gold, C.silver, C.bronze]
    const CARD_W = 120, CARD_H = 100, CARD_GAP = 4
    const startX = CX - (3 * CARD_W + 2 * CARD_GAP) / 2

    top3.forEach((p, i) => {
      const cx = startX + i * (CARD_W + CARD_GAP)
      const tC = toneColors[i]

      createWidget(widget.FILL_RECT, {
        x: cx, y: 310, w: CARD_W, h: CARD_H,
        radius: 14, color: 0x0C0C0C,
      })

      // Rank badge
      createWidget(widget.FILL_RECT, {
        x: cx + CARD_W / 2 - 18, y: 302, w: 36, h: 28,
        radius: 14, color: tC,
      })
      createWidget(widget.TEXT, {
        x: cx + CARD_W / 2 - 18, y: 304, w: 36, h: 24,
        text: `#${i + 1}`,
        text_size: 18, align_h: align.CENTER_H,
        color: 0x06243F,
      })

      // Tag
      createWidget(widget.TEXT, {
        x: cx + 4, y: 336, w: CARD_W - 8, h: 22,
        text: p.tag,
        text_size: 16, align_h: align.CENTER_H,
        color: C.ink60,
      })

      // Time
      createWidget(widget.TEXT, {
        x: cx + 4, y: 358, w: CARD_W - 8, h: 30,
        text: p.value,
        text_size: 26, align_h: align.CENTER_H,
        color: C.white,
      })

      // Country
      createWidget(widget.TEXT, {
        x: cx + 4, y: 388, w: CARD_W - 8, h: 22,
        text: p.country,
        text_size: 17, align_h: align.CENTER_H,
        color: tC,
      })
    })

    // ── Contexto (filas #45–#49) ───────────────────────────────────
    const context = WORLD.context
    context.forEach((row, i) => {
      const y = 426 + i * 50
      const isYou = row.you

      if (isYou) {
        createWidget(widget.FILL_RECT, {
          x: SAFE_X, y, w: SAFE_W, h: 44,
          radius: 12, color: 0x00243C,
        })
      }

      createWidget(widget.TEXT, {
        x: SAFE_X + 8, y: y + 10, w: 42, h: 28,
        text: `#${row.rank}`,
        text_size: 20, align_h: align.LEFT,
        color: isYou ? C.cyan : C.ink40,
      })

      createWidget(widget.TEXT, {
        x: SAFE_X + 54, y: y + 10, w: 200, h: 28,
        text: row.tag,
        text_size: 20,
        color: isYou ? C.white : C.ink60,
      })

      createWidget(widget.TEXT, {
        x: SAFE_X + SAFE_W - 100, y: y + 10, w: 92, h: 28,
        text: row.value,
        text_size: 22, align_h: align.RIGHT,
        color: isYou ? C.cyan : C.ink60,
      })

      if (isYou) {
        createWidget(widget.TEXT, {
          x: SAFE_X + SAFE_W - 22, y: y + 10, w: 20, h: 28,
          text: '▶',
          text_size: 18,
          color: C.cyan,
        })
      }
    })
  },
})
