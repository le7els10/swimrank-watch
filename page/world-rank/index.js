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
      x: SAFE_X, y: 14, w: 44, h: 44,
      text: '‹', text_size: 34, radius: 22,
      normal_color: C.bg, press_color: C.card,
      text_color: C.cyan, click_func: () => back(),
    })

    createWidget(widget.TEXT, {
      x: 0, y: 16, w: SCREEN_W, h: 28,
      text: getText('ranking_mundial_titulo'),
      text_size: 20, align_h: align.CENTER_H,
      color: C.white,
    })

    createWidget(widget.TEXT, {
      x: 0, y: 46, w: SCREEN_W, h: 20,
      text: `${getText('tu_pos_kicker')} · ${this.disc?.short ?? '100'} M`,
      text_size: 12, align_h: align.CENTER_H,
      color: C.cyan,
    })

    createWidget(widget.FILL_RECT, {
      x: SAFE_X, y: 72, w: SAFE_W, h: 1, color: C.line,
    })

    // ── Posición grande ────────────────────────────────────────────
    const rank = this.wr?.rank ?? WORLD.rank
    const total = this.wr?.total ?? WORLD.total

    // Up arrow
    createWidget(widget.TEXT, {
      x: 0, y: 82, w: CX - 10, h: 60,
      text: '▲',
      text_size: 28, align_h: align.RIGHT,
      color: C.cyan,
    })

    // Rank number (giant)
    createWidget(widget.TEXT, {
      x: CX - 8, y: 78, w: 120, h: 68,
      text: `#${rank}`,
      text_size: 64, align_h: align.LEFT,
      color: C.cyan,
    })

    // "de N nadadores"
    createWidget(widget.TEXT, {
      x: 0, y: 150, w: SCREEN_W, h: 24,
      text: `${getText('de')} ${total.toLocaleString()} ${getText('nadadores')}`,
      text_size: 16, align_h: align.CENTER_H,
      color: C.ink60,
    })

    // Percentile chip
    const pct = this.wr?.percentile ?? WORLD.percentile
    const chipW = 148
    createWidget(widget.FILL_RECT, {
      x: CX - chipW / 2, y: 180, w: chipW, h: 26,
      radius: 13, color: 0x1A1100,
    })
    createWidget(widget.TEXT, {
      x: CX - chipW / 2, y: 184, w: chipW, h: 18,
      text: `★  ${pct} mundial`,
      text_size: 14, align_h: align.CENTER_H,
      color: C.gold,
    })

    // ── Top 3 mundial ──────────────────────────────────────────────
    createWidget(widget.TEXT, {
      x: 0, y: 216, w: SCREEN_W, h: 20,
      text: 'TOP 3 ' + getText('ranking_mundial_titulo').split(' ')[0],
      text_size: 12, align_h: align.CENTER_H,
      color: C.ink60,
    })

    const top3 = WORLD.top3
    const toneColors = [C.gold, C.silver, C.bronze]
    const CARD_W = 100, CARD_H = 72, CARD_GAP = 8
    const startX = CX - (3 * CARD_W + 2 * CARD_GAP) / 2

    top3.forEach((p, i) => {
      const cx = startX + i * (CARD_W + CARD_GAP)
      const tC = toneColors[i]

      createWidget(widget.FILL_RECT, {
        x: cx, y: 240, w: CARD_W, h: CARD_H,
        radius: 12, color: 0x0C0C0C,
      })

      // Rank badge
      createWidget(widget.FILL_RECT, {
        x: cx + CARD_W / 2 - 14, y: 236, w: 28, h: 22,
        radius: 11, color: tC,
      })
      createWidget(widget.TEXT, {
        x: cx + CARD_W / 2 - 14, y: 238, w: 28, h: 18,
        text: `#${i + 1}`,
        text_size: 13, align_h: align.CENTER_H,
        color: 0x06243F,
      })

      // Tag
      createWidget(widget.TEXT, {
        x: cx + 4, y: 264, w: CARD_W - 8, h: 18,
        text: p.tag,
        text_size: 12, align_h: align.CENTER_H,
        color: C.ink60,
      })

      // Time
      createWidget(widget.TEXT, {
        x: cx + 4, y: 282, w: CARD_W - 8, h: 24,
        text: p.value,
        text_size: 18, align_h: align.CENTER_H,
        color: C.white,
      })

      // Country
      createWidget(widget.TEXT, {
        x: cx + 4, y: 304, w: CARD_W - 8, h: 18,
        text: p.country,
        text_size: 13, align_h: align.CENTER_H,
        color: tC,
      })
    })

    // ── Contexto (filas #45–#49) ───────────────────────────────────
    const context = WORLD.context
    context.forEach((row, i) => {
      const y = 328 + i * 34
      const isYou = row.you

      if (isYou) {
        createWidget(widget.FILL_RECT, {
          x: SAFE_X, y, w: SAFE_W, h: 30,
          radius: 8, color: 0x00243C,
        })
      }

      createWidget(widget.TEXT, {
        x: SAFE_X + 4, y: y + 6, w: 30, h: 20,
        text: `#${row.rank}`,
        text_size: 14, align_h: align.LEFT,
        color: isYou ? C.cyan : C.ink40,
      })

      createWidget(widget.TEXT, {
        x: SAFE_X + 40, y: y + 6, w: 200, h: 20,
        text: row.tag,
        text_size: 13,
        color: isYou ? C.white : C.ink60,
      })

      createWidget(widget.TEXT, {
        x: SAFE_X + SAFE_W - 80, y: y + 6, w: 76, h: 20,
        text: row.value,
        text_size: 15, align_h: align.RIGHT,
        color: isYou ? C.cyan : C.ink60,
      })

      if (isYou) {
        createWidget(widget.TEXT, {
          x: SAFE_X + SAFE_W - 20, y: y + 6, w: 16, h: 20,
          text: '▶',
          text_size: 12,
          color: C.cyan,
        })
      }
    })
  },
})
