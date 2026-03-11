# -*- coding: utf-8 -*-
"""
TriggerHub 2.0 -- Professional PDF Generator
Generates a visually rich PDF with UI mockups, architecture diagrams,
and SaaS-style layout using ReportLab + Pillow.
"""

import os
import io
import datetime
from PIL import Image, ImageDraw, ImageFont

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import (
    Color, HexColor, white, black
)
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image as RLImage, PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ─────────────────────────────────────────────
# COLOUR PALETTE
# ─────────────────────────────────────────────
C_NAVY     = HexColor("#0D1B2A")   # deep dark navy  (bg)
C_DARK     = HexColor("#1A2E42")   # dark card bg
C_BLUE     = HexColor("#1F6FEB")   # accent blue
C_CYAN     = HexColor("#00C2FF")   # highlight cyan
C_GREEN    = HexColor("#22C55E")   # success green
C_ORANGE   = HexColor("#F59E0B")   # warning amber
C_RED      = HexColor("#EF4444")   # error red
C_GREY     = HexColor("#64748B")   # muted text
C_LIGHT    = HexColor("#E2E8F0")   # light text
C_WHITE    = HexColor("#FFFFFF")
C_SURFACE  = HexColor("#112233")   # card surface
C_BORDER   = HexColor("#1E3A5F")   # subtle border

W, H = A4  # 595 x 842 pt

OUTPUT = r"e:\Programmierung\TriggerHub2.0\docs\TriggerHub2_Praesentation.pdf"
IMG_TMP = r"e:\Programmierung\TriggerHub2.0\docs\_tmp_img"
os.makedirs(IMG_TMP, exist_ok=True)

# ─────────────────────────────────────────────
# PIL HELPER: save PIL image to temp file
# ─────────────────────────────────────────────

def pil_to_tmp(img: Image.Image, name: str) -> str:
    path = os.path.join(IMG_TMP, name)
    img.save(path, "PNG")
    return path


def pil_to_rl(img: Image.Image, width_pt, height_pt) -> RLImage:
    buf = io.BytesIO()
    img.save(buf, "PNG")
    buf.seek(0)
    return RLImage(buf, width=width_pt, height=height_pt)

# ─────────────────────────────────────────────
# FONT HELPER
# ─────────────────────────────────────────────

def try_font(name="Helvetica"):
    return name   # ReportLab always has Helvetica family

F_BOLD   = "Helvetica-Bold"
F_REG    = "Helvetica"
F_OBLIQUE = "Helvetica-Oblique"

# ─────────────────────────────────────────────
# STYLES
# ─────────────────────────────────────────────

def make_styles():
    styles = {}

    styles["title"] = ParagraphStyle(
        "title", fontName=F_BOLD, fontSize=38, textColor=C_WHITE,
        leading=46, alignment=TA_CENTER, spaceAfter=6
    )
    styles["subtitle"] = ParagraphStyle(
        "subtitle", fontName=F_REG, fontSize=16, textColor=C_CYAN,
        leading=22, alignment=TA_CENTER, spaceAfter=4
    )
    styles["section"] = ParagraphStyle(
        "section", fontName=F_BOLD, fontSize=22, textColor=C_CYAN,
        leading=28, spaceBefore=18, spaceAfter=8
    )
    styles["h2"] = ParagraphStyle(
        "h2", fontName=F_BOLD, fontSize=14, textColor=C_LIGHT,
        leading=20, spaceBefore=10, spaceAfter=4
    )
    styles["body"] = ParagraphStyle(
        "body", fontName=F_REG, fontSize=11, textColor=C_LIGHT,
        leading=17, spaceAfter=6
    )
    styles["caption"] = ParagraphStyle(
        "caption", fontName=F_OBLIQUE, fontSize=9, textColor=C_GREY,
        leading=13, alignment=TA_CENTER, spaceAfter=10
    )
    styles["bullet"] = ParagraphStyle(
        "bullet", fontName=F_REG, fontSize=11, textColor=C_LIGHT,
        leading=17, leftIndent=14, spaceAfter=3,
        bulletText="\u2022"
    )
    styles["badge_done"] = ParagraphStyle(
        "badge_done", fontName=F_BOLD, fontSize=10, textColor=C_GREEN,
        leading=14
    )
    styles["badge_wip"] = ParagraphStyle(
        "badge_wip", fontName=F_BOLD, fontSize=10, textColor=C_ORANGE,
        leading=14
    )
    styles["badge_plan"] = ParagraphStyle(
        "badge_plan", fontName=F_BOLD, fontSize=10, textColor=C_GREY,
        leading=14
    )
    styles["label"] = ParagraphStyle(
        "label", fontName=F_BOLD, fontSize=9, textColor=C_CYAN,
        leading=12, spaceAfter=2
    )
    styles["small"] = ParagraphStyle(
        "small", fontName=F_REG, fontSize=9, textColor=C_GREY,
        leading=13
    )
    styles["center"] = ParagraphStyle(
        "center", fontName=F_REG, fontSize=11, textColor=C_LIGHT,
        leading=17, alignment=TA_CENTER, spaceAfter=6
    )
    return styles

S = make_styles()

# ─────────────────────────────────────────────
# DARK PAGE BACKGROUND CANVAS CALLBACK
# ─────────────────────────────────────────────

def dark_page(canv, doc):
    canv.saveState()
    canv.setFillColor(C_NAVY)
    canv.rect(0, 0, W, H, fill=1, stroke=0)
    # subtle bottom stripe
    canv.setFillColor(C_DARK)
    canv.rect(0, 0, W, 30, fill=1, stroke=0)
    # page number
    canv.setFont(F_REG, 9)
    canv.setFillColor(C_GREY)
    canv.drawCentredString(W / 2, 12, f"TriggerHub 2.0   |   Seite {doc.page}")
    canv.restoreState()


def cover_page(canv, doc):
    canv.saveState()
    # gradient-like background using layered rects
    canv.setFillColor(C_NAVY)
    canv.rect(0, 0, W, H, fill=1, stroke=0)
    # glow blob top
    canv.setFillColorRGB(0.12, 0.43, 0.92, alpha=0.18)
    canv.ellipse(-80, H - 200, 340, H + 100, fill=1, stroke=0)
    # glow blob bottom right
    canv.setFillColorRGB(0.0, 0.76, 1.0, alpha=0.10)
    canv.ellipse(W - 200, -80, W + 120, 280, fill=1, stroke=0)
    # top accent bar
    canv.setFillColor(C_BLUE)
    canv.rect(0, H - 5, W, 5, fill=1, stroke=0)
    canv.restoreState()

# ─────────────────────────────────────────────
# PILLOW MOCKUP GENERATORS
# ─────────────────────────────────────────────

SCALE = 2  # retina-like

def px(pt): return int(pt * SCALE)


def draw_pill(draw, x1, y1, x2, y2, fill, r=10):
    r = min(r, (y2 - y1) // 2, (x2 - x1) // 2)
    draw.rounded_rectangle([x1, y1, x2, y2], radius=r, fill=fill)


def draw_window_chrome(draw, W, H, title="TriggerHub 2.0", dark=True):
    """Render a fake OS window title bar."""
    bar_h = px(32)
    bg = (13, 27, 42) if dark else (240, 244, 248)
    draw.rectangle([0, 0, W, H], fill=bg)
    draw.rectangle([0, 0, W, bar_h], fill=(20, 40, 65))
    # traffic lights
    for i, col in enumerate([(239, 68, 68), (245, 158, 11), (34, 197, 94)]):
        cx = px(14) + i * px(20)
        cy = bar_h // 2
        draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=col)
    # title
    try:
        font = ImageFont.load_default(size=px(9))
    except Exception:
        font = ImageFont.load_default()
    draw.text((W // 2, bar_h // 2), title, fill=(150, 180, 210), anchor="mm", font=font)


def make_dashboard_mockup(w_pt=420, h_pt=240) -> Image.Image:
    W2, H2 = px(w_pt), px(h_pt)
    img = Image.new("RGB", (W2, H2), (13, 27, 42))
    d = ImageDraw.Draw(img)
    draw_window_chrome(d, W2, H2, "TriggerHub 2.0  --  Dashboard")

    try:
        font_sm = ImageFont.load_default(size=px(8))
        font_md = ImageFont.load_default(size=px(10))
        font_lg = ImageFont.load_default(size=px(13))
    except Exception:
        font_sm = font_md = font_lg = ImageFont.load_default()

    top = px(36)

    # Sidebar
    sidebar_w = px(90)
    d.rectangle([0, top, sidebar_w, H2], fill=(16, 36, 58))
    nav_items = ["Dashboard", "Trigger", "Makros", "Plugins", "Einstellungen"]
    for i, item in enumerate(nav_items):
        y = top + px(10) + i * px(26)
        active = (i == 0)
        if active:
            draw_pill(d, px(6), y, sidebar_w - px(6), y + px(20), (31, 111, 235), r=px(6))
            d.text((sidebar_w // 2, y + px(10)), item, fill=(255, 255, 255), anchor="mm", font=font_sm)
        else:
            d.text((sidebar_w // 2, y + px(10)), item, fill=(100, 140, 180), anchor="mm", font=font_sm)

    # Main content area
    content_x = sidebar_w + px(12)
    content_w = W2 - content_x - px(8)

    # Header
    d.text((content_x, top + px(8)), "Dashboard", fill=(0, 194, 255), font=font_lg)
    d.text((content_x, top + px(24)), "Aktive Automationen & Status", fill=(100, 130, 160), font=font_sm)

    # Stat cards row
    card_top = top + px(42)
    card_h = px(44)
    card_gap = px(8)
    cards = [
        ("6", "Aktive Trigger", (34, 197, 94)),
        ("3", "Makros", (0, 194, 255)),
        ("2", "Plugins", (245, 158, 11)),
        ("OK", "System", (34, 197, 94)),
    ]
    card_w = (content_w - 3 * card_gap) // 4
    for i, (val, label, col) in enumerate(cards):
        cx = content_x + i * (card_w + card_gap)
        d.rounded_rectangle([cx, card_top, cx + card_w, card_top + card_h], radius=px(6), fill=(20, 46, 75))
        d.text((cx + card_w // 2, card_top + px(12)), val, fill=col, anchor="mm", font=font_md)
        d.text((cx + card_w // 2, card_top + px(28)), label, fill=(100, 130, 160), anchor="mm", font=font_sm)

    # Trigger list
    list_top = card_top + card_h + px(12)
    d.text((content_x, list_top), "Aktive Trigger", fill=(150, 180, 210), font=font_sm)
    list_top += px(14)
    triggers = [
        ("OBS Szene gewechselt", "Aufnahme starten", "aktiv", (34, 197, 94)),
        ("Spotify Track aendert", "Titel anzeigen", "aktiv", (34, 197, 94)),
        ("Hotkey Strg+F9", "Makro: StreamStart", "aktiv", (34, 197, 94)),
        ("Clip erstellt", "TikTok Export", "pause", (245, 158, 11)),
    ]
    row_h = px(20)
    for i, (trigger, action, status, col) in enumerate(triggers):
        y = list_top + i * (row_h + px(3))
        bg = (18, 42, 68) if i % 2 == 0 else (15, 35, 58)
        d.rounded_rectangle([content_x, y, content_x + content_w, y + row_h], radius=px(4), fill=bg)
        dot_x = content_x + px(8)
        d.ellipse([dot_x - px(3), y + row_h // 2 - px(3), dot_x + px(3), y + row_h // 2 + px(3)], fill=col)
        d.text((dot_x + px(8), y + row_h // 2), trigger, fill=(200, 220, 240), anchor="lm", font=font_sm)
        d.text((content_x + content_w - px(8), y + row_h // 2), action, fill=(100, 140, 180), anchor="rm", font=font_sm)

    return img


def make_trigger_editor_mockup(w_pt=420, h_pt=240) -> Image.Image:
    W2, H2 = px(w_pt), px(h_pt)
    img = Image.new("RGB", (W2, H2), (13, 27, 42))
    d = ImageDraw.Draw(img)
    draw_window_chrome(d, W2, H2, "TriggerHub 2.0  --  Trigger Editor")

    try:
        font_sm = ImageFont.load_default(size=px(8))
        font_md = ImageFont.load_default(size=px(10))
        font_lg = ImageFont.load_default(size=px(12))
    except Exception:
        font_sm = font_md = font_lg = ImageFont.load_default()

    top = px(40)
    pad = px(16)

    d.text((pad, top), "Neuer Trigger erstellen", fill=(0, 194, 255), font=font_lg)
    top += px(20)

    # Form fields
    fields = [
        ("Trigger-Name", "OBS Szene: Gameplay gestartet"),
        ("Ereignis-Typ", "OBS Studio  >  Szene gewechselt"),
        ("Bedingung", "scene_name == 'Gameplay'"),
        ("Aktion", "Makro ausfuehren: StreamStart"),
    ]
    field_h = px(28)
    for label, value in fields:
        d.text((pad, top), label, fill=(100, 140, 180), font=font_sm)
        top += px(12)
        d.rounded_rectangle([pad, top, W2 - pad, top + field_h], radius=px(5), fill=(20, 46, 75), outline=(31, 111, 235), width=1)
        d.text((pad + px(8), top + field_h // 2), value, fill=(200, 225, 255), anchor="lm", font=font_sm)
        top += field_h + px(8)

    # Save button
    btn_y = H2 - px(44)
    btn_x1, btn_x2 = W2 - px(140), W2 - pad
    draw_pill(d, btn_x1, btn_y, btn_x2, btn_y + px(28), (31, 111, 235), r=px(6))
    d.text(((btn_x1 + btn_x2) // 2, btn_y + px(14)), "Trigger speichern", fill=(255, 255, 255), anchor="mm", font=font_sm)

    # Cancel
    btn2_x1, btn2_x2 = W2 - px(250), W2 - px(148)
    draw_pill(d, btn2_x1, btn_y, btn2_x2, btn_y + px(28), (30, 58, 90), r=px(6))
    d.text(((btn2_x1 + btn2_x2) // 2, btn_y + px(14)), "Abbrechen", fill=(150, 180, 210), anchor="mm", font=font_sm)

    return img


def make_plugin_manager_mockup(w_pt=420, h_pt=220) -> Image.Image:
    W2, H2 = px(w_pt), px(h_pt)
    img = Image.new("RGB", (W2, H2), (13, 27, 42))
    d = ImageDraw.Draw(img)
    draw_window_chrome(d, W2, H2, "TriggerHub 2.0  --  Plugin Manager")

    try:
        font_sm = ImageFont.load_default(size=px(8))
        font_md = ImageFont.load_default(size=px(10))
    except Exception:
        font_sm = font_md = ImageFont.load_default()

    top = px(38)
    pad = px(12)

    d.text((pad, top), "Installierte Plugins", fill=(0, 194, 255), font=font_md)
    top += px(18)

    plugins = [
        ("OBS Bridge", "v1.2.0", "Verbindet OBS Studio", True),
        ("Spotify Connect", "v0.9.1", "Musiksteuerung & Track-Info", True),
        ("TikTok Exporter", "v0.3.0", "Automatischer Clip-Export", False),
        ("Twitch Events", "v1.0.0", "Chat & Event-Empfang", True),
    ]
    row_h = px(36)
    for i, (name, version, desc, active) in enumerate(plugins):
        y = top + i * (row_h + px(4))
        bg = (18, 44, 72) if i % 2 == 0 else (14, 36, 60)
        d.rounded_rectangle([pad, y, W2 - pad, y + row_h], radius=px(6), fill=bg)
        # icon placeholder
        icon_col = (31, 111, 235) if active else (60, 80, 110)
        d.rounded_rectangle([pad + px(6), y + px(6), pad + px(30), y + row_h - px(6)], radius=px(4), fill=icon_col)
        d.text((pad + px(18), y + row_h // 2), name[0], fill=(255, 255, 255), anchor="mm", font=font_md)
        # text
        tx = pad + px(38)
        d.text((tx, y + px(8)), name, fill=(200, 225, 255), font=font_sm)
        d.text((tx, y + px(20)), desc, fill=(100, 140, 180), font=font_sm)
        d.text((tx + px(120), y + px(8)), version, fill=(80, 120, 160), font=font_sm)
        # toggle
        tog_x = W2 - pad - px(40)
        tog_col = (34, 197, 94) if active else (60, 80, 110)
        draw_pill(d, tog_x, y + row_h // 2 - px(9), tog_x + px(36), y + row_h // 2 + px(9), tog_col, r=px(9))
        knob_x = (tog_x + px(24)) if active else (tog_x + px(12))
        d.ellipse([knob_x - px(7), y + row_h // 2 - px(7), knob_x + px(7), y + row_h // 2 + px(7)], fill=(255, 255, 255))

    return img


def make_macro_editor_mockup(w_pt=420, h_pt=230) -> Image.Image:
    W2, H2 = px(w_pt), px(h_pt)
    img = Image.new("RGB", (W2, H2), (13, 27, 42))
    d = ImageDraw.Draw(img)
    draw_window_chrome(d, W2, H2, "TriggerHub 2.0  --  Makro Editor")

    try:
        font_sm = ImageFont.load_default(size=px(8))
        font_md = ImageFont.load_default(size=px(10))
    except Exception:
        font_sm = font_md = ImageFont.load_default()

    top = px(38)
    pad = px(12)

    d.text((pad, top), "Makro: StreamStart", fill=(0, 194, 255), font=font_md)
    top += px(18)

    steps = [
        ("1", "OBS: Szene wechseln", "scene: 'Gameplay'", (31, 111, 235)),
        ("2", "Warten", "500ms", (100, 120, 160)),
        ("3", "OBS: Aufnahme starten", "--", (34, 197, 94)),
        ("4", "Spotify: Wiedergabe starten", "playlist: 'Stream Mix'", (34, 197, 94)),
        ("5", "Benachrichtigung senden", "msg: 'Stream laeuft!'", (245, 158, 11)),
    ]
    step_h = px(30)
    left_col = px(30)
    for i, (num, name, param, col) in enumerate(steps):
        y = top + i * (step_h + px(4))
        # connector line
        if i < len(steps) - 1:
            line_x = pad + px(14)
            d.line([line_x, y + step_h, line_x, y + step_h + px(4)], fill=(40, 70, 110), width=px(2))
        # step circle
        cx, cy = pad + px(14), y + step_h // 2
        d.ellipse([cx - px(12), cy - px(12), cx + px(12), cy + px(12)], fill=col)
        d.text((cx, cy), num, fill=(255, 255, 255), anchor="mm", font=font_sm)
        # card
        card_x = pad + left_col
        d.rounded_rectangle([card_x, y, W2 - pad, y + step_h], radius=px(5), fill=(18, 44, 72))
        d.text((card_x + px(8), y + step_h // 2 - px(5)), name, fill=(200, 225, 255), font=font_sm)
        d.text((card_x + px(8), y + step_h // 2 + px(5)), param, fill=(100, 140, 180), font=font_sm)

    return img


# ─────────────────────────────────────────────
# PILLOW DIAGRAM: Architecture
# ─────────────────────────────────────────────

def make_architecture_diagram(w_pt=460, h_pt=200) -> Image.Image:
    W2, H2 = px(w_pt), px(h_pt)
    img = Image.new("RGB", (W2, H2), (13, 27, 42))
    d = ImageDraw.Draw(img)

    try:
        font_sm = ImageFont.load_default(size=px(8))
        font_md = ImageFont.load_default(size=px(9))
        font_lg = ImageFont.load_default(size=px(11))
    except Exception:
        font_sm = font_md = font_lg = ImageFont.load_default()

    pad = px(16)
    row_h = px(42)
    col_w = px(100)
    gap_x = px(24)

    layers = [
        ("Benutzer-\nOberfläche", "React + Electron", (31, 111, 235)),
        ("App Facade", "API Surface", (0, 160, 200)),
        ("Kern-Engine", "Trigger / Makro / EventBus", (20, 140, 80)),
        ("Services", "OBS / Spotify / Clip", (160, 100, 20)),
        ("Plugins", "Registry + SDK", (120, 60, 200)),
    ]

    total_w = len(layers) * col_w + (len(layers) - 1) * gap_x
    start_x = (W2 - total_w) // 2
    center_y = H2 // 2

    for i, (name, sub, col) in enumerate(layers):
        x1 = start_x + i * (col_w + gap_x)
        x2 = x1 + col_w
        y1 = center_y - row_h // 2
        y2 = center_y + row_h // 2

        # shadow
        d.rounded_rectangle([x1 + 3, y1 + 3, x2 + 3, y2 + 3], radius=px(8), fill=(5, 15, 28))
        # card
        d.rounded_rectangle([x1, y1, x2, y2], radius=px(8), fill=(*bytes.fromhex(f"{col[0]:02x}{col[1]:02x}{col[2]:02x}"), 200))
        # top accent
        d.rounded_rectangle([x1, y1, x2, y1 + px(4)], radius=px(4), fill=(255, 255, 255, 80))

        for j, line in enumerate(name.split("\n")):
            d.text(((x1 + x2) // 2, y1 + px(12) + j * px(12)), line,
                   fill=(255, 255, 255), anchor="mm", font=font_md)
        d.text(((x1 + x2) // 2, y2 - px(10)), sub,
               fill=(200, 230, 255, 180), anchor="mm", font=font_sm)

        # arrow to next
        if i < len(layers) - 1:
            ax = x2 + 2
            ay = center_y
            d.line([ax, ay, ax + gap_x - 2, ay], fill=(0, 194, 255), width=px(2))
            # arrowhead
            ah = px(5)
            ax2 = ax + gap_x - 2
            d.polygon([(ax2, ay), (ax2 - ah, ay - ah), (ax2 - ah, ay + ah)], fill=(0, 194, 255))

    # Labels above/below
    d.text((W2 // 2, px(14)), "Systemarchitektur -- TriggerHub 2.0", fill=(0, 194, 255), anchor="mm", font=font_lg)
    d.text((W2 // 2, H2 - px(14)), "Jede Schicht ist unabhaengig und austauschbar (Dependency Injection)", fill=(80, 120, 160), anchor="mm", font=font_sm)

    return img


def make_flow_diagram(w_pt=460, h_pt=120) -> Image.Image:
    """Event -> Trigger -> Condition -> Action -> Makro flow."""
    W2, H2 = px(w_pt), px(h_pt)
    img = Image.new("RGB", (W2, H2), (13, 27, 42))
    d = ImageDraw.Draw(img)

    try:
        font_sm = ImageFont.load_default(size=px(8))
        font_md = ImageFont.load_default(size=px(9))
    except Exception:
        font_sm = font_md = ImageFont.load_default()

    nodes = [
        ("Ereignis", "z.B. OBS\nSzene wechselt", (31, 111, 235)),
        ("Trigger", "Regel wird\ngeprüft", (0, 160, 200)),
        ("Bedingung", "Ist erfüllt?", (160, 100, 20)),
        ("Aktion", "Wird\nausgefuehrt", (20, 140, 80)),
        ("Makro", "Schritte\nlaufen ab", (120, 60, 200)),
    ]

    node_w = px(74)
    node_h = px(54)
    gap = px(20)
    total = len(nodes) * node_w + (len(nodes) - 1) * gap
    sx = (W2 - total) // 2
    cy = H2 // 2

    for i, (label, sub, col) in enumerate(nodes):
        x1 = sx + i * (node_w + gap)
        x2 = x1 + node_w
        y1 = cy - node_h // 2
        y2 = cy + node_h // 2

        d.rounded_rectangle([x1, y1, x2, y2], radius=px(8), fill=(18, 44, 72), outline=col, width=px(2))
        d.text(((x1 + x2) // 2, y1 + px(14)), label, fill=col, anchor="mm", font=font_md)
        for j, line in enumerate(sub.split("\n")):
            d.text(((x1 + x2) // 2, y1 + px(28) + j * px(10)), line, fill=(150, 180, 210), anchor="mm", font=font_sm)

        if i < len(nodes) - 1:
            ax = x2
            ay = cy
            d.line([ax, ay, ax + gap, ay], fill=(0, 194, 255), width=px(2))
            d.polygon([(ax + gap, ay), (ax + gap - px(5), ay - px(4)), (ax + gap - px(5), ay + px(4))], fill=(0, 194, 255))

    return img


def make_automation_example(title, trigger, action, result, col, w_pt=200, h_pt=120) -> Image.Image:
    W2, H2 = px(w_pt), px(h_pt)
    img = Image.new("RGB", (W2, H2), (16, 38, 64))
    d = ImageDraw.Draw(img)

    try:
        font_sm = ImageFont.load_default(size=px(8))
        font_md = ImageFont.load_default(size=px(9))
        font_lg = ImageFont.load_default(size=px(10))
    except Exception:
        font_sm = font_md = font_lg = ImageFont.load_default()

    # top colour bar
    d.rounded_rectangle([0, 0, W2, px(6)], radius=px(3), fill=col)
    d.rounded_rectangle([px(4), px(4), W2 - px(4), H2 - px(4)], radius=px(10), outline=(30, 65, 105), width=1)

    d.text((W2 // 2, px(16)), title, fill=col, anchor="mm", font=font_lg)

    rows = [("Trigger", trigger, (0, 194, 255)), ("Aktion", action, (34, 197, 94)), ("Ergebnis", result, (245, 158, 11))]
    y = px(30)
    for label, text, lc in rows:
        d.text((px(10), y), label + ":", fill=lc, font=font_sm)
        d.text((px(10), y + px(10)), text, fill=(180, 210, 240), font=font_sm)
        y += px(26)

    return img


def make_roadmap_diagram(w_pt=460, h_pt=130) -> Image.Image:
    W2, H2 = px(w_pt), px(h_pt)
    img = Image.new("RGB", (W2, H2), (13, 27, 42))
    d = ImageDraw.Draw(img)

    try:
        font_sm = ImageFont.load_default(size=px(7))
        font_md = ImageFont.load_default(size=px(8))
        font_lg = ImageFont.load_default(size=px(9))
    except Exception:
        font_sm = font_md = font_lg = ImageFont.load_default()

    phases = [
        ("Phase 1", "Grundlage", "Jetzt", (34, 197, 94), True),
        ("Phase 2", "Creator Tools", "2025", (0, 194, 255), False),
        ("Phase 3", "Erweiterbar-\nkeit", "2025", (31, 111, 235), False),
        ("Phase 4", "Content\nTools", "2026", (245, 158, 11), False),
        ("Phase 5", "Community", "2026", (168, 85, 247), False),
        ("Phase 6", "KI-Schicht", "2027", (239, 68, 68), False),
    ]

    node_w = px(62)
    node_h = px(60)
    gap = px(12)
    total = len(phases) * node_w + (len(phases) - 1) * gap
    sx = (W2 - total) // 2
    line_y = H2 // 2

    # timeline line
    d.line([sx, line_y, sx + total, line_y], fill=(30, 65, 105), width=px(3))

    for i, (phase, name, date, col, done) in enumerate(phases):
        cx = sx + i * (node_w + gap) + node_w // 2
        # connector dot on line
        r = px(6)
        d.ellipse([cx - r, line_y - r, cx + r, line_y + r], fill=col if done else (30, 65, 105), outline=col, width=px(2))
        # card above
        y1 = line_y - node_h - px(12)
        y2 = line_y - px(14)
        x1 = cx - node_w // 2
        x2 = cx + node_w // 2
        bg = (20, 55, 90) if done else (16, 38, 64)
        d.rounded_rectangle([x1, y1, x2, y2], radius=px(6), fill=bg, outline=col if done else (25, 55, 90), width=1 if not done else 2)
        d.text((cx, y1 + px(10)), phase, fill=col, anchor="mm", font=font_sm)
        for j, line in enumerate(name.split("\n")):
            d.text((cx, y1 + px(22) + j * px(10)), line, fill=(180, 210, 240) if done else (100, 140, 180), anchor="mm", font=font_sm)
        # date below line
        d.text((cx, line_y + px(16)), date, fill=col if done else (60, 90, 130), anchor="mm", font=font_sm)

    d.text((W2 // 2, H2 - px(10)), "Entwicklungs-Roadmap  --  6 Phasen bis zur vollstaendigen Plattform", fill=(60, 90, 130), anchor="mm", font=font_sm)

    return img


# ─────────────────────────────────────────────
# STATUS TABLE HELPER
# ─────────────────────────────────────────────

def status_table(data):
    ts = TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0),  C_DARK),
        ("TEXTCOLOR",    (0, 0), (-1, 0),  C_CYAN),
        ("FONTNAME",     (0, 0), (-1, 0),  F_BOLD),
        ("FONTSIZE",     (0, 0), (-1, 0),  10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_SURFACE, C_DARK]),
        ("TEXTCOLOR",    (0, 1), (-1, -1), C_LIGHT),
        ("FONTNAME",     (0, 1), (-1, -1), F_REG),
        ("FONTSIZE",     (0, 1), (-1, -1), 10),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("GRID",         (0, 0), (-1, -1), 0.5, C_BORDER),
        ("ROUNDEDCORNERS", [4]),
    ])
    return ts

# ─────────────────────────────────────────────
# COVER PAGE (drawn directly on canvas)
# ─────────────────────────────────────────────

def build_cover(c: canvas.Canvas):
    cover_page(c, None)

    # Logo circle
    c.setFillColor(C_BLUE)
    c.circle(W / 2, H - 160, 50, fill=1, stroke=0)
    c.setFont(F_BOLD, 28)
    c.setFillColor(C_WHITE)
    c.drawCentredString(W / 2, H - 168, "TH")

    # Tag line badge
    badge_w, badge_h = 220, 26
    c.setFillColor(C_SURFACE)
    bx = (W - badge_w) / 2
    by = H - 230
    c.roundRect(bx, by, badge_w, badge_h, 13, fill=1, stroke=0)
    c.setFont(F_BOLD, 9)
    c.setFillColor(C_CYAN)
    c.drawCentredString(W / 2, by + 9, "AUTOMATION FOR CREATORS")

    # Main title
    c.setFont(F_BOLD, 52)
    c.setFillColor(C_WHITE)
    c.drawCentredString(W / 2, H - 300, "TriggerHub")
    c.setFont(F_BOLD, 52)
    c.setFillColor(C_CYAN)
    c.drawCentredString(W / 2, H - 355, "2.0")

    # Subtitle
    c.setFont(F_REG, 16)
    c.setFillColor(C_LIGHT)
    c.drawCentredString(W / 2, H - 395, "Das Betriebssystem fuer Creator-Automation")

    # Divider
    c.setStrokeColor(C_BORDER)
    c.setLineWidth(1)
    c.line(80, H - 420, W - 80, H - 420)

    # Three value props
    props = [
        ("AUTOMATISIERT", "Komplexe Workflows\nauf Knopfdruck"),
        ("VERBINDET", "OBS, Spotify, Clips\nin einem System"),
        ("ERWEITERT", "Plugin-Marktplatz\nfuer Creator"),
    ]
    col_w2 = (W - 120) / 3
    for i, (head, body_txt) in enumerate(props):
        cx = 60 + i * col_w2 + col_w2 / 2
        c.setFont(F_BOLD, 11)
        c.setFillColor(C_CYAN)
        c.drawCentredString(cx, H - 450, head)
        c.setFont(F_REG, 9)
        c.setFillColor(C_GREY)
        for j, line in enumerate(body_txt.split("\n")):
            c.drawCentredString(cx, H - 465 - j * 13, line)

    # Date
    c.setFont(F_REG, 10)
    c.setFillColor(C_GREY)
    c.drawCentredString(W / 2, 80, f"Entwicklungsstand  |  {datetime.date.today().strftime('%B %Y')}")

    # Version badge
    c.setFillColor(C_DARK)
    c.roundRect(W / 2 - 30, 55, 60, 18, 9, fill=1, stroke=0)
    c.setFont(F_BOLD, 8)
    c.setFillColor(C_GREEN)
    c.drawCentredString(W / 2, 61, "v0.1.0")


# ─────────────────────────────────────────────
# SECTION HEADER HELPER (drawn as flowable)
# ─────────────────────────────────────────────

def section_header(num: str, title: str):
    """Returns a list of flowables for a section heading."""
    return [
        Spacer(1, 8 * mm),
        HRFlowable(width="100%", thickness=1, color=C_BORDER, spaceAfter=6),
        Paragraph(f'<font color="#00C2FF"><b>{num}</b></font>   {title}', S["section"]),
    ]


def chip(text, col="#1F6FEB"):
    return Paragraph(f'<font color="{col}"><b>{text}</b></font>', S["label"])


# ─────────────────────────────────────────────
# AUTOMATION EXAMPLE CARDS
# ─────────────────────────────────────────────

def automation_card_table(examples):
    """3 images in a row."""
    imgs = []
    for title, trigger, action, result, col in examples:
        im = make_automation_example(title, trigger, action, result, col)
        imgs.append(pil_to_rl(im, 175, 105))
    row = [imgs]
    t = Table(row, colWidths=[175, 175, 175])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


# ─────────────────────────────────────────────
# BUILD PDF
# ─────────────────────────────────────────────

def build():
    c_main = canvas.Canvas(OUTPUT, pagesize=A4)

    # ── COVER ────────────────────────────────
    build_cover(c_main)
    c_main.showPage()

    # ── REST: use SimpleDocTemplate pipelined onto same canvas  ──
    # We use a two-pass approach: build story then draw on existing canvas.
    # Simpler: use platypus directly with our canvas callbacks.

    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=20 * mm,
        onFirstPage=dark_page,
        onLaterPages=dark_page,
    )

    story = []

    # ── SEITE 2: Was ist das Projekt? ────────
    story += section_header("01", "Was ist TriggerHub 2.0?")

    story.append(Paragraph(
        "TriggerHub 2.0 ist eine Desktop-App, die Streamern und Content Creatorn hilft, "
        "ihren Alltag zu automatisieren. Statt fünf verschiedene Programme gleichzeitig "
        "zu bedienen, gibt es eine einzige Steuerzentrale.",
        S["body"]
    ))

    # 3-column feature cards
    feat_data = [
        [
            Paragraph("<b>Für Streamer</b>", S["h2"]),
            Paragraph("<b>Für YouTuber</b>", S["h2"]),
            Paragraph("<b>Für alle Creator</b>", S["h2"]),
        ],
        [
            Paragraph("OBS automatisch steuern, Szenen wechseln, Aufnahmen starten ohne manuelle Eingriffe.", S["body"]),
            Paragraph("Clips automatisch erstellen und für TikTok & Shorts exportieren.", S["body"]),
            Paragraph("Musik, Benachrichtigungen, Overlays -- alles auf einmal, per Knopfdruck oder Regelwerk.", S["body"]),
        ],
    ]
    feat_t = Table(feat_data, colWidths=[168, 168, 168])
    feat_t.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0),  C_DARK),
        ("BACKGROUND",   (0, 1), (0, 1),   C_SURFACE),
        ("BACKGROUND",   (1, 1), (1, 1),   HexColor("#0E2233")),
        ("BACKGROUND",   (2, 1), (2, 1),   C_SURFACE),
        ("TEXTCOLOR",    (0, 0), (-1, -1), C_LIGHT),
        ("TOPPADDING",   (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
        ("LEFTPADDING",  (0, 0), (-1, -1), 10),
        ("GRID",         (0, 0), (-1, -1), 0.5, C_BORDER),
        ("ROUNDEDCORNERS", [6]),
    ]))
    story.append(Spacer(1, 4 * mm))
    story.append(feat_t)

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(
        "Das grosse Ziel: TriggerHub wird das Betriebssystem fuer Creator-Automation -- "
        "eine Plattform, auf der Creator Plugins installieren, Workflows teilen und "
        "komplette Streams automatisch produzieren.",
        S["body"]
    ))

    # ── SEITE 3: Wie funktioniert es? ────────
    story.append(PageBreak())
    story += section_header("02", "Wie funktioniert die Software?")

    story.append(Paragraph(
        "Das System basiert auf einem einfachen Prinzip: Ein Ereignis loest eine Aktion aus. "
        "Dazwischen koennen Bedingungen und mehrstufige Ablaeufe (Makros) definiert werden.",
        S["body"]
    ))

    flow_img = make_flow_diagram()
    story.append(pil_to_rl(flow_img, 525, 136))
    story.append(Paragraph("Vereinfachter Datenfluss: Von einem externen Ereignis bis zur ausgefuehrten Aktion.", S["caption"]))

    story.append(Spacer(1, 4 * mm))

    # Concept explanations
    concepts = [
        ("Trigger", C_BLUE,
         "Eine Regel, die auf ein bestimmtes Ereignis wartet. Zum Beispiel: "
         "OBS wechselt zur Szene 'Gameplay' -- das loest den Trigger aus."),
        ("Bedingung", C_ORANGE,
         "Optional: Zusaetliche Prüfung, bevor die Aktion startet. "
         "Zum Beispiel: 'Nur wenn der Stream bereits laeuft.'"),
        ("Makro", C_GREEN,
         "Eine Kette von Schritten, die nacheinander ausgefuehrt werden. "
         "Zum Beispiel: Szene wechseln > Aufnahme starten > Musik abspielen."),
        ("Plugin", HexColor("#A855F7"),
         "Erweiterungen, die neue Integrationen hinzufuegen -- zum Beispiel Twitch, "
         "Discord oder benutzerdefinierte Webhooks."),
    ]
    for name, col, text in concepts:
        row_data = [
            [Paragraph(f'<font color="#{col.hexval()[2:]}"><b>{name}</b></font>', S["h2"]),
             Paragraph(text, S["body"])],
        ]
        ct = Table(row_data, colWidths=[80, 430])
        ct.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, -1), C_SURFACE),
            ("TOPPADDING",   (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
            ("LEFTPADDING",  (0, 0), (-1, -1), 10),
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
            ("GRID",         (0, 0), (-1, -1), 0.5, C_BORDER),
        ]))
        story.append(ct)
        story.append(Spacer(1, 2 * mm))

    # ── SEITE 4: Automations-Beispiele ───────
    story.append(PageBreak())
    story += section_header("03", "Beispiele fuer Automationen")

    story.append(Paragraph(
        "So sehen reale Automationen in TriggerHub aus. Jede Regel wird einmal "
        "konfiguriert -- danach laeuft sie vollautomatisch.",
        S["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    examples_row1 = [
        ("Stream starten", "Szene: Gameplay\ngestartet", "OBS: Aufnahme +\nMusik an", "Stream laeuft\nautomatisch", (31, 111, 235)),
        ("Clip exportieren", "Clip-Taste\ngerdrueckt", "Clip schneiden\n+ TikTok Export", "Fertige\nShort-Version", (34, 197, 94)),
        ("Musik-Info", "Spotify Track\nwechselt", "Overlay\naktualisieren", "Titel im\nStream sichtbar", (245, 158, 11)),
    ]
    story.append(automation_card_table(examples_row1))
    story.append(Spacer(1, 3 * mm))

    examples_row2 = [
        ("Hotkey Makro", "Tastenkuerzel\nStrg+F9", "5 Schritte\nnacheinander", "Vollautom.\nStream-Start", (120, 60, 200)),
        ("Twitch Event", "Subscription\nempfangen", "Sound + Overlay +\nSzene wechseln", "Reaktion in\nEchtzeit", (239, 68, 68)),
        ("Stream Ende", "Stream-Stop\nerkennen", "Aufnahme stoppen,\nDatei speichern", "Clips bereit\nzum Upload", (0, 160, 200)),
    ]
    story.append(automation_card_table(examples_row2))

    # ── SEITE 5: Architektur ─────────────────
    story.append(PageBreak())
    story += section_header("04", "Technische Architektur")

    story.append(Paragraph(
        "Das Projekt wurde von Grund auf mit einer sauberen, modularen Architektur gebaut. "
        "Jede Komponente ist unabhaengig und kann ausgetauscht oder erweitert werden.",
        S["body"]
    ))

    arch_img = make_architecture_diagram()
    story.append(pil_to_rl(arch_img, 525, 228))
    story.append(Paragraph(
        "Schichtenarchitektur: Jede Ebene kommuniziert nur mit der naechsten -- sauber, testbar, erweiterbar.",
        S["caption"]
    ))

    story.append(Spacer(1, 3 * mm))

    arch_rows = [
        ["Schicht", "Technologie", "Zweck"],
        ["Benutzer-\nOberfläche", "React 18 + TypeScript", "Dashboard, Editor, Plugin-Manager"],
        ["Desktop Runtime", "Electron 36", "Nativer App-Wrapper fuer Windows/Mac/Linux"],
        ["App Facade", "TypeScript / DI-Container", "Einheitliche API fuer die gesamte UI"],
        ["Kern-Engine", "TypeScript (Pure)", "Trigger, Makros, Event-Bus -- keine externen Abh."],
        ["Service-Adapter", "TypeScript", "OBS Studio, Spotify, Clip-Export"],
        ["Plugin-System", "TypeScript SDK", "Erweiterbar durch externe Entwickler"],
    ]
    arch_t = Table(arch_rows, colWidths=[120, 155, 245])
    arch_t.setStyle(status_table(arch_rows))
    story.append(arch_t)

    # ── SEITE 6: Screenshots ─────────────────
    story.append(PageBreak())
    story += section_header("05", "UI-Vorschau: Wie die App aussieht")

    story.append(Paragraph(
        "Die folgenden Ansichten zeigen, wie die Benutzeroberflaeche von TriggerHub 2.0 "
        "aufgebaut ist. Die Designs sind bereits implementiert.",
        S["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    dash = make_dashboard_mockup()
    editor = make_trigger_editor_mockup()

    row1 = [[pil_to_rl(dash, 262, 150), pil_to_rl(editor, 262, 150)]]
    t1 = Table(row1, colWidths=[263, 263])
    t1.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0),
                             ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                             ("TOPPADDING", (0, 0), (-1, -1), 0),
                             ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    story.append(t1)

    cap1 = [[Paragraph("Dashboard -- Aktive Trigger & Systemstatus im Überblick", S["caption"]),
             Paragraph("Trigger Editor -- Neue Automatisierungsregel erstellen", S["caption"])]]
    ct1 = Table(cap1, colWidths=[263, 263])
    ct1.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0),
                              ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                              ("TOPPADDING", (0, 0), (-1, -1), 0)]))
    story.append(ct1)
    story.append(Spacer(1, 4 * mm))

    plugins = make_plugin_manager_mockup()
    macro = make_macro_editor_mockup()

    row2 = [[pil_to_rl(plugins, 262, 138), pil_to_rl(macro, 262, 144)]]
    t2 = Table(row2, colWidths=[263, 263])
    t2.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0),
                             ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                             ("TOPPADDING", (0, 0), (-1, -1), 0),
                             ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    story.append(t2)

    cap2 = [[Paragraph("Plugin Manager -- Erweiterungen aktivieren & verwalten", S["caption"]),
             Paragraph("Makro Editor -- Mehrstufige Ablaeufe visuell aufbauen", S["caption"])]]
    ct2 = Table(cap2, colWidths=[263, 263])
    ct2.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0),
                              ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                              ("TOPPADDING", (0, 0), (-1, -1), 0)]))
    story.append(ct2)

    # ── SEITE 7: Projektstatus ───────────────
    story.append(PageBreak())
    story += section_header("06", "Aktueller Projektstatus")

    story.append(Paragraph(
        "Version 0.1.0 -- Die Grundarchitektur steht vollstaendig. "
        "106 automatische Tests bestaetigen die Stabilitaet der Kernsysteme.",
        S["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    status_data = [
        ["Bereich", "Status", "Details"],
        ["Trigger-Engine", "Fertig", "Ereignis-Erkennung, Bedingungen, Aktionen"],
        ["Makro-System", "Fertig", "Mehrstufige Ablaeufe mit Typsicherheit"],
        ["Event-Bus", "Fertig", "Pub/Sub-Messaging zwischen allen Modulen"],
        ["OBS-Integration", "Fertig (Adapter)", "WebSocket/HTTP-Anbindung vorbereitet"],
        ["Spotify-Integration", "Fertig (Adapter)", "Wiedergabe & Track-Infos"],
        ["Clip-Service", "Fertig (Adapter)", "Verarbeitung & Exportformate"],
        ["Plugin-System", "Grundstruktur fertig", "Registry, Lifecycle, Beispiel-Plugin"],
        ["Desktop-App (Electron)", "Bereit", "Windows-Build + NSIS-Installer konfiguriert"],
        ["Benutzeroberfläche", "In Entwicklung", "Dashboard, Editor, Seiten strukturiert"],
        ["Datenpersistenz", "Ausstehend", "Trigger/Makros nur im Arbeitsspeicher"],
        ["Auto-Update", "Geplant", "Spezifikation vorhanden, Implementierung folgt"],
        ["Automatische Tests", "106 bestanden", "Core, Services, Plugins, UI-Rendering"],
    ]

    # color the status column
    st_data_formatted = []
    for i, row in enumerate(status_data):
        if i == 0:
            st_data_formatted.append(row)
            continue
        status = row[1]
        if "Fertig" in status or "bestanden" in status:
            col_str = "#22C55E"
        elif "Entwicklung" in status or "Bereit" in status:
            col_str = "#F59E0B"
        else:
            col_str = "#64748B"
        st_data_formatted.append([
            row[0],
            Paragraph(f'<font color="{col_str}"><b>{status}</b></font>', S["body"]),
            row[2]
        ])

    st_t = Table(st_data_formatted, colWidths=[130, 110, 285])
    st_t.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0),  C_DARK),
        ("TEXTCOLOR",    (0, 0), (-1, 0),  C_CYAN),
        ("FONTNAME",     (0, 0), (-1, 0),  F_BOLD),
        ("FONTSIZE",     (0, 0), (-1, 0),  10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_SURFACE, C_DARK]),
        ("TEXTCOLOR",    (0, 1), (-1, -1), C_LIGHT),
        ("FONTNAME",     (0, 1), (-1, -1), F_REG),
        ("FONTSIZE",     (0, 1), (-1, -1), 10),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("GRID",         (0, 0), (-1, -1), 0.5, C_BORDER),
    ]))
    story.append(st_t)

    # ── SEITE 8: Roadmap + Vision ────────────
    story.append(PageBreak())
    story += section_header("07", "Nächste Schritte & Roadmap")

    story.append(Paragraph(
        "Die Entwicklung folgt einem klaren 6-Phasen-Plan. Phase 1 ist fast abgeschlossen.",
        S["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    road_img = make_roadmap_diagram()
    story.append(pil_to_rl(road_img, 525, 148))
    story.append(Paragraph("Die 6 Phasen fuehren von der lokalen Desktop-App bis zur KI-gestuetzten Creator-Plattform.", S["caption"]))

    story.append(Spacer(1, 3 * mm))

    next_data = [
        ["#", "Naechster Schritt", "Ziel"],
        ["1", "Build-Blockade beheben", "Technikfehler loesen, damit die App gebaut werden kann"],
        ["2", "Erstes Release (v0.1)", "Installierbare Windows-Version fuer erste Tester"],
        ["3", "Datenpersistenz", "Trigger & Makros dauerhaft speichern"],
        ["4", "Trigger-Editor fertig", "Visuelles Erstellen von Regeln ohne Code"],
        ["5", "Echte OBS-Verbindung", "Vollstaendiger Live-Test mit echter OBS-Instanz"],
        ["6", "Auto-Update", "App aktualisiert sich automatisch"],
    ]
    nd_t = Table(next_data, colWidths=[25, 170, 330])
    nd_t.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0),  C_DARK),
        ("TEXTCOLOR",    (0, 0), (-1, 0),  C_CYAN),
        ("FONTNAME",     (0, 0), (-1, 0),  F_BOLD),
        ("FONTSIZE",     (0, 0), (-1, 0),  10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_SURFACE, C_DARK]),
        ("TEXTCOLOR",    (0, 0), (0, -1),  C_CYAN),
        ("FONTNAME",     (0, 0), (0, -1),  F_BOLD),
        ("TEXTCOLOR",    (1, 1), (-1, -1), C_LIGHT),
        ("FONTNAME",     (1, 1), (-1, -1), F_REG),
        ("FONTSIZE",     (0, 1), (-1, -1), 10),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("GRID",         (0, 0), (-1, -1), 0.5, C_BORDER),
    ]))
    story.append(nd_t)

    # ── SEITE 9: Langfristige Vision ─────────
    story.append(PageBreak())
    story += section_header("08", "Langfristige Vision")

    story.append(Paragraph(
        "TriggerHub soll langfristig weit mehr sein als eine einfache Automations-App. "
        "Die Vision ist eine vollstaendige Plattform fuer den Creator-Bereich.",
        S["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    vision_items = [
        ("Creator-Plattform", C_BLUE,
         "Streamer, YouTuber und Podcaster haben eine einzige App fuer alle Automationen -- "
         "keine Inselloesungen mehr, kein staendiges Tool-Wechseln."),
        ("Plugin-Marketplace", HexColor("#A855F7"),
         "Entwickler koennen eigene Plugins bauen und im Marktplatz anbieten. "
         "Community-getriebenes Wachstum wie bei VS Code oder Obsidian."),
        ("KI-Integration", C_CYAN,
         "Kuenftige Versionen nutzen KI, um automatisch Highlights zu erkennen, "
         "Clips zu erstellen und sogar Trigger-Regeln vorzuschlagen."),
        ("Multi-Plattform", C_GREEN,
         "Neben Windows auch macOS und Linux -- sowie potenzielle Mobile-Companion-App "
         "fuer Streamers, die unterwegs reagieren muessen."),
        ("Community & Presets", C_ORANGE,
         "Vorgefertigte Workflow-Pakete: Ein Klick installiert komplette Stream-Setups, "
         "konfiguriert fuer Spiele wie Minecraft, Valorant, etc."),
    ]

    for vname, vcol, vtext in vision_items:
        vdata = [[
            Paragraph(f'<font color="#{vcol.hexval()[2:]}">  {vname}</font>', S["h2"]),
            Paragraph(vtext, S["body"]),
        ]]
        vt = Table(vdata, colWidths=[140, 380])
        vt.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, -1), C_SURFACE),
            ("TOPPADDING",   (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
            ("LEFTPADDING",  (0, 0), (-1, -1), 10),
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
            ("GRID",         (0, 0), (-1, -1), 0.5, C_BORDER),
        ]))
        story.append(vt)
        story.append(Spacer(1, 2 * mm))

    # Potential callout
    story.append(Spacer(1, 4 * mm))
    pot_data = [
        [Paragraph(
            "<b>Marktpotenzial</b>: Weltweit streamen ueber 8 Millionen Creator regelmaessig. "
            "Tools fuer Stream-Automatisierung wachsen stark -- TriggerHub positioniert sich "
            "als offene, erweiterbare Alternative zu proprietaeren Loesungen.",
            S["body"]
        )]
    ]
    pot_t = Table(pot_data, colWidths=[525])
    pot_t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), HexColor("#0D2B1A")),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("GRID",          (0, 0), (-1, -1), 0.5, C_GREEN),
    ]))
    story.append(pot_t)

    # ── SCHLUSSSEITE ─────────────────────────
    story.append(PageBreak())
    story += section_header("09", "Fazit")

    story.append(Spacer(1, 4 * mm))

    summary_points = [
        ("Solide Grundlage", C_GREEN,
         "Die gesamte Kernarchitektur ist gebaut und mit 106 Tests abgesichert. "
         "Das Fundament ist professionell und zukunftsfest."),
        ("Klare Vision", C_BLUE,
         "Von der lokalen Desktop-App bis zur KI-Plattform -- jede Phase baut "
         "logisch auf der vorherigen auf."),
        ("Ernsthaftes Projekt", C_CYAN,
         "20 dokumentierte Architekturentscheidungen, ein vollstaendiges Agent-System "
         "zur Entwicklungskoordination und eine Release-Pipeline zeigen: "
         "Das ist kein Hobbyprojekt."),
        ("Nahe am Release", C_ORANGE,
         "Zwei technische Blocker trennen das Projekt vom ersten oeffentlichen Release. "
         "Die Loesungen sind bekannt und planbar."),
    ]

    for title, col, text in summary_points:
        sd = [[
            Paragraph(f'<b>{title}</b>', ParagraphStyle("sh2", fontName=F_BOLD, fontSize=12,
                      textColor=col, leading=16)),
            Paragraph(text, S["body"]),
        ]]
        st2 = Table(sd, colWidths=[140, 380])
        st2.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, -1), C_DARK),
            ("TOPPADDING",   (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 10),
            ("LEFTPADDING",  (0, 0), (-1, -1), 10),
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
            ("GRID",         (0, 0), (-1, -1), 0.5, C_BORDER),
        ]))
        story.append(st2)
        story.append(Spacer(1, 3 * mm))

    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER))
    story.append(Spacer(1, 6 * mm))

    story.append(Paragraph(
        "TriggerHub 2.0 -- Automation for Creators",
        ParagraphStyle("final", fontName=F_BOLD, fontSize=16,
                       textColor=C_CYAN, alignment=TA_CENTER, leading=22)
    ))
    story.append(Paragraph(
        f"Entwicklungsstand {datetime.date.today().strftime('%B %Y')}  |  Version 0.1.0",
        ParagraphStyle("final2", fontName=F_REG, fontSize=10,
                       textColor=C_GREY, alignment=TA_CENTER, leading=14)
    ))

    # ── BUILD ────────────────────────────────
    doc.build(story)
    print(f"PDF gespeichert: {OUTPUT}")


if __name__ == "__main__":
    build()
