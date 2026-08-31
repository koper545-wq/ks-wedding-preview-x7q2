#!/usr/bin/env python3
"""
Generuje grafiki do wysyłki (WhatsApp) na bazie zaproszenia z Figmy,
w palecie strony.

  img/og.jpg           1200x630  — miniatura linku (Open Graph). To JĄ widać
                                   jako klikalną kartę, gdy wkleisz 60kopra.pl
                                   w WhatsAppie. JPEG, nie PNG, i lekki —
                                   scraper WhatsAppa potrafi po cichu odrzucić
                                   PNG-a oraz obrazek cięższy niż ~300 kB.
  img/zaproszenie.png  1080x1620 — pionowe zaproszenie do wysłania jako zdjęcie
                                   (link wtedy wkleja się w podpis).

PNG nie umie trzymać hiperlinku — stąd ten podział. Szczegóły w README.

Fonty pobiera z Google Fonts do scripts/.fonts/ (nie trzymamy ich w repo).
Uruchomienie:  python3 scripts/make-share-images.py
"""

import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FONT_DIR = os.path.join(HERE, '.fonts')
IMG = os.path.join(ROOT, 'img')

FONTS = {
    'BonaNovaSC-Regular.ttf': 'https://fonts.gstatic.com/s/bonanovasc/v1/mem5YaShyGWDiYdPG_c1Af4-VQ.ttf',
    'BonaNova-Regular.ttf':   'https://fonts.gstatic.com/s/bonanova/v12/B50NF7ZCpX7fcHfvIUBJiw.ttf',
    'BonaNova-Bold.ttf':      'https://fonts.gstatic.com/s/bonanova/v12/B50IF7ZCpX7fcHfvIUBxN4dOFA.ttf',
}

BG      = (35, 59, 37)     # #233B25 — jak --bg
DISPLAY = (250, 244, 228)  # #FAF4E4 — jak --fg-strong
BODY    = (242, 231, 204)  # #F2E7CC — jak --fg

SS = 2  # supersampling — rysujemy 2x i zmniejszamy, żeby ramka nie była poszarpana


def ensure_fonts():
    os.makedirs(FONT_DIR, exist_ok=True)
    for name, url in FONTS.items():
        path = os.path.join(FONT_DIR, name)
        if not os.path.exists(path):
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/4.0'})
            with urllib.request.urlopen(req) as r, open(path, 'wb') as f:
                f.write(r.read())


def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)


def mix(fg, bg, a):
    return tuple(round(fg[i] * a + bg[i] * (1 - a)) for i in range(3))


def grain_bg(w, h):
    """Tło = kafel ziarna z img/grain.png, ten sam co na stronie."""
    tile = Image.open(os.path.join(IMG, 'grain.png')).convert('RGB')
    out = Image.new('RGB', (w, h), BG)
    for y in range(0, h, tile.height):
        for x in range(0, w, tile.width):
            out.paste(tile, (x, y))
    return out


def text_w(draw, s, f, tracking=0):
    w = draw.textlength(s, font=f)
    return w + tracking * max(0, len(s) - 1)


def draw_centered(draw, cx, y, s, f, fill, tracking=0):
    """Rysuje tekst wyśrodkowany w cx. tracking = dodatkowy odstęp między znakami."""
    w = text_w(draw, s, f, tracking)
    x = cx - w / 2
    if tracking == 0:
        draw.text((x, y), s, font=f, fill=fill)
    else:
        for ch in s:
            draw.text((x, y), ch, font=f, fill=fill)
            x += draw.textlength(ch, font=f) + tracking
    return w


def tinted_logo(target_h, color):
    """Logo klubu z zaproszenia, przefarbowane na kolor tekstu strony."""
    logo = Image.open(os.path.join(IMG, 'wgc-logo.png')).convert('RGBA')
    w = round(logo.width * target_h / logo.height)
    logo = logo.resize((w, target_h), Image.LANCZOS)
    solid = Image.new('RGBA', logo.size, color + (255,))
    solid.putalpha(logo.split()[3])
    return solid


# ── pionowe zaproszenie ───────────────────────────────────────────────────

def make_invite(path, W=1080, H=1620):
    w, h = W * SS, H * SS
    im = grain_bg(w, h)
    d = ImageDraw.Draw(im)
    cx = w / 2

    pad = 46 * SS
    d.rounded_rectangle([pad, pad, w - pad, h - pad],
                        radius=40 * SS, outline=mix(BODY, BG, 0.85), width=2 * SS)

    f_big   = font('BonaNovaSC-Regular.ttf', 300 * SS)
    f_word  = font('BonaNovaSC-Regular.ttf', 122 * SS)
    f_date  = font('BonaNova-Regular.ttf', 52 * SS)
    f_venue = font('BonaNova-Regular.ttf', 44 * SS)
    f_badge = font('BonaNova-Regular.ttf', 30 * SS)
    f_url   = font('BonaNovaSC-Regular.ttf', 46 * SS)
    f_cta   = font('BonaNova-Regular.ttf', 28 * SS)

    y = 196 * SS
    draw_centered(d, cx, y, '60', f_big, DISPLAY)
    y += 330 * SS
    draw_centered(d, cx, y, 'URODZINY', f_word, DISPLAY, tracking=4 * SS)
    y += 190 * SS

    draw_centered(d, cx, y, '07/11/26, 18:00', f_date, DISPLAY)
    y += 98 * SS

    rule_w = w - 2 * pad - 150 * SS
    d.line([cx - rule_w / 2, y, cx + rule_w / 2, y], fill=mix(BODY, BG, 0.8), width=2)
    y += 46 * SS

    draw_centered(d, cx, y, 'Wrocław Golf Club,', f_venue, DISPLAY)
    y += 62 * SS
    draw_centered(d, cx, y, 'Golfowa 2, 55-114 Kryniczno', f_venue, DISPLAY)
    y += 108 * SS

    logo = tinted_logo(64 * SS, BODY)
    im.paste(logo, (round(cx - logo.width / 2), round(y)), logo)
    y += 158 * SS

    badges = 'Elegancki dress code  ·  Bez kwiatów  ·  Bezpłatny transport powrotny'
    draw_centered(d, cx, y, badges, f_badge, mix(BODY, BG, 0.92))

    # stopka: dokąd iść
    y = h - pad - 262 * SS
    draw_centered(d, cx, y, 'potwierdź obecność na', f_cta, mix(BODY, BG, 0.75))
    y += 52 * SS
    uw = draw_centered(d, cx, y, '60KOPRA.PL', f_url, DISPLAY, tracking=6 * SS)
    d.line([cx - uw / 2, y + 66 * SS, cx + uw / 2, y + 66 * SS], fill=DISPLAY, width=2 * SS)

    im.resize((W, H), Image.LANCZOS).save(path, optimize=True)
    return path


# ── pozioma miniatura linku (Open Graph) ──────────────────────────────────

def make_og(path, W=1200, H=630):
    """Zapisujemy jako JPEG — WhatsApp bywa wybredny wobec PNG w og:image."""
    w, h = W * SS, H * SS
    im = grain_bg(w, h)
    d = ImageDraw.Draw(im)
    cx = w / 2

    pad = 30 * SS
    d.rounded_rectangle([pad, pad, w - pad, h - pad],
                        radius=26 * SS, outline=mix(BODY, BG, 0.85), width=2 * SS)

    f_big   = font('BonaNovaSC-Regular.ttf', 150 * SS)
    f_word  = font('BonaNovaSC-Regular.ttf', 62 * SS)
    f_date  = font('BonaNova-Regular.ttf', 38 * SS)
    f_venue = font('BonaNova-Regular.ttf', 32 * SS)

    y = 86 * SS
    draw_centered(d, cx, y, '60', f_big, DISPLAY)
    y += 166 * SS
    draw_centered(d, cx, y, 'URODZINY KOPRA', f_word, DISPLAY, tracking=3 * SS)
    y += 106 * SS

    rule_w = 420 * SS
    d.line([cx - rule_w / 2, y, cx + rule_w / 2, y], fill=mix(BODY, BG, 0.8), width=2)
    y += 34 * SS

    draw_centered(d, cx, y, 'sobota, 7 listopada 2026, 18:00', f_date, DISPLAY)
    y += 56 * SS
    draw_centered(d, cx, y, 'Wrocław Golf Club, Kryniczno', f_venue, mix(BODY, BG, 0.92))

    out = im.resize((W, H), Image.LANCZOS)
    # schodzimy z jakością, aż zmieścimy się bezpiecznie poniżej 300 kB
    for q in (88, 82, 76, 70):
        out.save(path, quality=q, optimize=True, progressive=False, subsampling=0)
        if os.path.getsize(path) <= 200_000:
            break
    return path


if __name__ == '__main__':
    ensure_fonts()
    for p in (make_og(os.path.join(IMG, 'og.jpg')),
              make_invite(os.path.join(IMG, 'zaproszenie.png'))):
        size = os.path.getsize(p)
        print(f'{os.path.relpath(p, ROOT):24s} {Image.open(p).size}  {size/1024:.0f} KB')
