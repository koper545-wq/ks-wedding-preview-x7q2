#!/usr/bin/env python3
"""
Buduje img/map.jpg z ilustrowanej mapy ze strony weselnej (../img/map.jpg).

Poprawki względem oryginału:
  1. usuwa gałązkę i wstawia w to miejsce logo Wrocław Golf Club,
  2. usuwa „Ostatnio oglądane" — resztkę interfejsu Google Maps, która
     została wypalona w ilustracji,
  3. przenosi znacznik „P" ze środka pola golfowego na parking przy klubie.

Kasowanie robimy klonowaniem czystego kawałka tła, nie wypełnieniem jednym
kolorem — papier ma delikatną fakturę i płaska łata byłaby widoczna.

Uruchomienie:  python3 scripts/make-map.py
"""

import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(os.path.dirname(ROOT), 'img', 'map.jpg')   # oryginał weselny
OUT = os.path.join(ROOT, 'img', 'map.jpg')
LOGO = os.path.join(ROOT, 'img', 'wgc-logo.png')

OUT_W = 1200          # mapa renderuje się w ~600 px, 1200 starcza na ekrany 2x

# ── obszary do wyczyszczenia (współrzędne w oryginale 1965x1802) ──────────
TWIG      = (140, 265, 640, 492)   # cała gałązka, łącznie z dolnym pędem
RECENTLY  = (240, 692, 470, 740)
OLD_P     = (804, 636, 892, 724)

# lewy górny róg logo w miejscu gałązki (niezależny od TWIG, żeby zmiana
# maski nie przesuwała logo)
LOGO_POS = (150, 282)
LOGO_W = 470

# środek nowego „P" — wąski prostokąt przylegający do budynku klubu,
# podpięty pod drogę dojazdową
NEW_P_CENTER = (1237, 698)


def is_clean(im, box, bg, tol=14):
    """Czy wycinek to samo tło (bez tuszu)?"""
    px = im.crop(box).getdata()
    return all(abs(p[0]-bg[0]) < tol and abs(p[1]-bg[1]) < tol and abs(p[2]-bg[2]) < tol
               for p in px)


def find_clean_patch(im, w, h, bg, avoid):
    """Szuka czystego kawałka tła o zadanym rozmiarze, z dala od stref `avoid`."""
    step = 20
    for y in range(0, im.height - h, step):
        for x in range(0, im.width - w, step):
            box = (x, y, x + w, y + h)
            if any(not (box[2] < a[0] or box[0] > a[2] or box[3] < a[1] or box[1] > a[3])
                   for a in avoid):
                continue
            if is_clean(im, box, bg):
                return box
    raise RuntimeError('nie znalazłem czystego kawałka tła %dx%d' % (w, h))


def erase(im, box, bg, avoid):
    """Zamalowuje obszar sklonowanym tłem, z miękką krawędzią."""
    w, h = box[2] - box[0], box[3] - box[1]
    src = find_clean_patch(im, w, h, bg, avoid)
    patch = im.crop(src)
    mask = Image.new('L', (w, h), 255)
    ImageDraw.Draw(mask).rectangle([0, 0, w - 1, h - 1], outline=0, width=3)
    im.paste(patch, (box[0], box[1]), mask.filter(ImageFilter.GaussianBlur(2)))


def main():
    im = Image.open(SRC).convert('RGB')
    bg = im.getpixel((im.width - 40, 40))   # róg = czyste tło
    print('oryginał:', im.size, '| kolor tła:', bg)

    avoid = [TWIG, RECENTLY, OLD_P, (100, 470, 760, 620), (150, 640, 640, 745),
             (1100, 580, 1320, 800)]

    # 3a. „P" — najpierw kopiujemy oryginalny znacznik, żeby zachować styl
    p_patch = im.crop(OLD_P)
    pw, ph = p_patch.size
    p_mask = Image.new('L', (pw, ph), 0)
    ImageDraw.Draw(p_mask).ellipse([2, 2, pw - 3, ph - 3], fill=255)
    p_mask = p_mask.filter(ImageFilter.GaussianBlur(2))

    # 1 + 2 + 3b. czyścimy gałązkę, „Ostatnio oglądane" i stare „P"
    for box in (TWIG, RECENTLY, OLD_P):
        erase(im, box, bg, avoid)

    # 3c. wklejamy „P" na parkingu
    im.paste(p_patch, (NEW_P_CENTER[0] - pw // 2, NEW_P_CENTER[1] - ph // 2), p_mask)

    # 1b. logo klubu w miejscu gałązki, przefarbowane na kolor tuszu mapy
    logo = Image.open(LOGO).convert('RGBA')
    lw = LOGO_W
    lh = round(logo.height * lw / logo.width)
    logo = logo.resize((lw, lh), Image.LANCZOS)
    ink = Image.new('RGBA', logo.size, (74, 74, 66, 255))
    ink.putalpha(logo.split()[3])
    im.paste(ink, LOGO_POS, ink)

    out_h = round(im.height * OUT_W / im.width)
    im.resize((OUT_W, out_h), Image.LANCZOS).save(
        OUT, quality=82, optimize=True, progressive=True)
    print('zapisano:', os.path.relpath(OUT, ROOT), Image.open(OUT).size,
          '%.0f KB' % (os.path.getsize(OUT) / 1024))


if __name__ == '__main__':
    main()
