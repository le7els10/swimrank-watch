import { createWidget, widget, align } from '@zos/ui'
import { replace } from '@zos/router'
import { getText } from '@zos/i18n'
import { localStorage } from '@zos/storage'
import { SCREEN_W, C, DISCIPLINE_MAP } from '../../utils/constants.js'

const CX = SCREEN_W / 2
const CY = SCREEN_W / 2

// Confetti positions (static approximation)
const CONFETTI = [
  [80,  70,  C.gold,  8, 5], [130,  55, C.cyan,   6, 4], [200,  80, C.white,  5, 3],
  [290,  60, C.gold,  7, 5], [350,  75, C.goldBright, 6, 4], [390, 110, C.cyan,  5, 3],
  [60,  160, C.goldBright, 5, 4], [420, 170, C.gold, 6, 5], [100, 380, C.cyan,  7, 4],
  [180, 395, C.white,  5, 3], [280, 390, C.gold,  6, 5], [360, 375, C.goldBright, 5, 4],
  [420, 350, C.cyan,  4, 3], [50,  320, C.gold,   7, 5], [440, 260, C.white,  5, 4],
  [45,  220, C.cyan,  6, 4], [148,  48, C.gold,   5, 3], [320,  44, C.goldBright, 7, 4],
]

Page({
  onInit() {
    const discId = localStorage.getItem('selectedDiscipline') || '100'
    this.disc = DISCIPLINE_MAP[discId] ?? DISCIPLINE_MAP['100']
  },

  build() {
    // ── Dark green celebration bg (design spec) ───────────────────
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: SCREEN_W, h: SCREEN_W, color: 0x050F03 })

    // ── Radial gold halo ──────────────────────────────────────────
    createWidget(widget.CIRCLE, { center_x: CX, center_y: CY, radius: 160, color: 0x1A1200 })
    createWidget(widget.CIRCLE, { center_x: CX, center_y: CY, radius: 110, color: 0x251900 })
    createWidget(widget.CIRCLE, { center_x: CX, center_y: CY, radius: 70,  color: 0x301E00 })

    // ── Confetti (colored rectangles) ─────────────────────────────
    CONFETTI.forEach(([x, y, color, w, h]) => {
      createWidget(widget.FILL_RECT, { x, y, w, h, radius: 1, color })
    })

    // ── Badge ring ────────────────────────────────────────────────
    createWidget(widget.CIRCLE, { center_x: CX, center_y: CY - 30, radius: 48, color: 0x1A1200 })
    createWidget(widget.ARC, {
      x: CX - 48, y: CY - 78, w: 96, h: 96,
      start_angle: -90, end_angle: 270,
      color: C.gold, line_width: 4,
    })

    // Star icon in badge
    createWidget(widget.TEXT, {
      x: CX - 48, y: CY - 72, w: 96, h: 96,
      text: '★',
      text_size: 42,
      align_h: align.CENTER_H,
      color: C.gold,
    })

    // ── "¡NUEVO RÉCORD!" ──────────────────────────────────────────
    createWidget(widget.TEXT, {
      x: 0, y: CY + 36, w: SCREEN_W, h: 34,
      text: getText('nuevo_record'),
      text_size: 28,
      align_h: align.CENTER_H,
      color: C.gold,
    })

    // Discipline label
    createWidget(widget.TEXT, {
      x: 0, y: CY + 72, w: SCREEN_W, h: 24,
      text: getText(this.disc?.labelKey ?? 'disc_100').toUpperCase(),
      text_size: 18,
      align_h: align.CENTER_H,
      color: C.ink60,
    })

    // Best time
    createWidget(widget.TEXT, {
      x: 0, y: CY + 96, w: SCREEN_W, h: 48,
      text: this.disc?.best ?? '1:08.3',
      text_size: 44,
      align_h: align.CENTER_H,
      color: C.white,
    })

    // Improvement chip
    createWidget(widget.FILL_RECT, {
      x: CX - 90, y: CY + 148, w: 180, h: 26,
      radius: 13, color: 0x001520,
    })
    createWidget(widget.TEXT, {
      x: CX - 90, y: CY + 152, w: 180, h: 18,
      text: '▼ 0.6 s · mejor marca',
      text_size: 13,
      align_h: align.CENTER_H,
      color: C.cyan,
    })

    // ── SEGUIR button ─────────────────────────────────────────────
    createWidget(widget.BUTTON, {
      x: CX - 72, y: CY + 184, w: 144, h: 52,
      text: getText('seguir'),
      text_size: 18,
      radius: 26,
      normal_color: C.gold,
      press_color:  C.goldDeep,
      text_color:   0x06243F,
      click_func:   () => replace({ url: 'page/home/index' }),
    })
  },
})
