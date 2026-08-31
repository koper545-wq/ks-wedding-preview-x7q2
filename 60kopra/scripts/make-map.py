#!/usr/bin/env python3
"""
Buduje img/map.jpg z ilustrowanej mapy ze strony weselnej (../img/map.jpg).

Poprawki względem oryginału:
  1. usuwa gałązkę, duży napis „wrocław golf club" z kreską oraz pinezkę
     z podpisem — nazwa klubu powtarzała się na mapie trzy razy. Zostaje
     jedno duże logo,
  2. usuwa „Ostatnio oglądane" — resztkę interfejsu Google Maps, która
     została wypalona w ilustracji,
  3. przenosi znacznik „P" ze środka pola golfowego na parking przy klubie.

Kasowanie robimy klonowaniem czystego kawałka tła, nie wypełnieniem jednym
kolorem — papier ma delikatną fakturę i płaska łata byłaby widoczna.

Uruchomienie:  python3 scripts/make-map.py
"""

import os
import random

from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(os.path.dirname(ROOT), 'img', 'map.jpg')   # oryginał weselny
OUT = os.path.join(ROOT, 'img', 'map.jpg')
LOGO = os.path.join(ROOT, 'img', 'wgc-logo.png')

OUT_W = 1200          # mapa renderuje się w ~600 px, 1200 starcza na ekrany 2x

# ── obszary do wyczyszczenia (współrzędne w oryginale 1965x1802) ──────────
# Cały blok etykiety: gałązka, napis serifowy, kreska, pinezka z podpisem.
# Zamalowujemy go w całości i wstawiamy w to miejsce samo logo.
LABEL     = (120, 265, 760, 745)
OLD_P     = (804, 636, 892, 724)

# lewy górny róg logo w miejscu gałązki (niezależny od TWIG, żeby zmiana
# maski nie przesuwała logo)
LOGO_POS = (150, 400)
LOGO_W = 620

# środek nowego „P" — wąski prostokąt przylegający do budynku klubu,
# podpięty pod drogę dojazdową
NEW_P_CENTER = (1237, 698)


def sample_bg(im, box, bg):
    """Mediana koloru z ramki wokół obszaru — dopasowuje się do lokalnego tła."""
    xs = list(range(box[0], box[2], 7))
    ys = list(range(box[1], box[3], 7))
    px = ([im.getpixel((x, max(0, box[1] - 12))) for x in xs] +
          [im.getpixel((x, min(im.height - 1, box[3] + 12))) for x in xs] +
          [im.getpixel((max(0, box[0] - 12), y)) for y in ys] +
          [im.getpixel((min(im.width - 1, box[2] + 12), y)) for y in ys])
    px = [p for p in px if all(abs(p[i] - bg[i]) < 18 for i in range(3))] or [bg]
    return tuple(sorted(p[i] for p in px)[len(px) // 2] for i in range(3))


def erase(im, box, bg):
    """Zamalowuje obszar płaskim tłem + drobnym ziarnem.

    Wcześniej klonowałem tu kawałki tła z maską — zostawiało to poziome
    pasma na stykach kafelków. Tło mapy w tym miejscu jest praktycznie
    jednolite, więc płaskie wypełnienie z lekkim szumem jest i prostsze,
    i czystsze.
    """
    fill = sample_bg(im, box, bg)
    w, h = box[2] - box[0], box[3] - box[1]
    patch = Image.new('RGB', (w, h), fill)
    px = patch.load()
    rnd = random.Random(1107)
    for y in range(h):
        for x in range(w):
            d = rnd.randint(-2, 2)
            px[x, y] = (max(0, min(255, fill[0] + d)),
                        max(0, min(255, fill[1] + d)),
                        max(0, min(255, fill[2] + d)))
    im.paste(patch, (box[0], box[1]))


def main():
    im = Image.open(SRC).convert('RGB')
    bg = im.getpixel((im.width - 40, 40))   # róg = czyste tło
    print('oryginał:', im.size, '| kolor tła:', bg)

    # 3a. „P" — najpierw kopiujemy oryginalny znacznik, żeby zachować styl
    p_patch = im.crop(OLD_P)
    pw, ph = p_patch.size
    p_mask = Image.new('L', (pw, ph), 0)
    ImageDraw.Draw(p_mask).ellipse([2, 2, pw - 3, ph - 3], fill=255)
    p_mask = p_mask.filter(ImageFilter.GaussianBlur(2))

    # 1 + 2 + 3b. czyścimy gałązkę, „Ostatnio oglądane" i stare „P"
    for box in (LABEL, OLD_P):
        erase(im, box, bg)

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
