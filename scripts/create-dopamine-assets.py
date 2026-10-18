"""Generate original SVG brand artwork from the bundled OFL Fredoka font.

Optional asset-authoring tool; requires fontTools, not the app runtime.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PURPLE, LIME, PINK, CREAM, INK = "#7B3DFF", "#D5FF4F", "#FF6BC7", "#FFF9F5", "#1F1F24"
font = instantiateVariableFont(TTFont(ASSETS / "fonts/fredoka.ttf"), {"wght": 700, "wdth": 100})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()


def lettering(text):
    pen = SVGPathPen(glyphs)
    bounds = BoundsPen(glyphs)
    x = 0
    for index, char in enumerate(text):
        name = cmap[ord(char)]
        offset = [0, 8, -9, 6, -4, 9, -3, 8][index % 8] if len(text) > 1 else 0
        transform = (1, 0, 0, 1, x, offset)
        glyphs[name].draw(TransformPen(pen, transform))
        glyphs[name].draw(TransformPen(bounds, transform))
        x += font["hmtx"][name][0] - (43 if len(text) > 1 else 22)
    return pen.getCommands(), bounds.bounds


letters, bounds = lettering("dopamine")
scale = 244 / (bounds[2] - bounds[0])
word = f'<g transform="translate(7 64) skewX(-12)"><path transform="scale({scale:.6f} {-scale*1.12:.6f})" d="{letters}" stroke-width="1.2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></g>'


def star(x, y, fill, size=16):
    return f'<path d="M{x} {y-size}L{x+4} {y-4}L{x+size} {y}L{x+4} {y+4}L{x} {y+size}L{x-4} {y+4}L{x-size} {y}L{x-4} {y-4}Z" fill="{fill}"/>'


def wordmark(fill, smile=LIME):
    return f'<g transform="rotate(-3 140 45)"><g fill="{fill}" stroke="{fill}">{word}</g><path d="M161 71Q192 91 223 69" fill="none" stroke="{smile}" stroke-width="7" stroke-linecap="round"/>{star(213, 16, smile, 9)}</g>'


for name, fill in [("dopamine-wordmark.svg", PURPLE), ("dopamine-wordmark-light.svg", "#FFFFFF")]:
    (ASSETS / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 90">{wordmark(fill)}</svg>\n')

d, d_bounds = lettering("d")
d_scale = 39 / (d_bounds[3] - d_bounds[1])
monogram = (
    f'<rect width="64" height="64" rx="18" fill="{LIME}"/>'
    f'<path transform="translate(13 48) scale({d_scale:.6f} {-d_scale:.6f})" d="{d}" fill="{PURPLE}"/>'
    f'<path d="M17 51Q30 61 44 50" stroke="{PINK}" stroke-width="4" fill="none" stroke-linecap="round"/>'
    f'{star(43, 13, PURPLE, 8)}'
)
for name in ["dopamine-mark.svg", "favicon.svg"]:
    (ASSETS / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{monogram}</svg>\n')

# The shopping artwork is a reusable vector composition, not a retail offer.
illustration = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 540" fill="none">
<defs>
 <linearGradient id="bagLight" x1="272" y1="132" x2="499" y2="397" gradientUnits="userSpaceOnUse"><stop stop-color="{LIME}"/><stop offset="1" stop-color="#B8E83C"/></linearGradient>
 <linearGradient id="bagPink" x1="40" y1="244" x2="305" y2="482" gradientUnits="userSpaceOnUse"><stop stop-color="#FF94D5"/><stop offset="1" stop-color="{PINK}"/></linearGradient>
 <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
 <g id="wordPurple">{wordmark(PURPLE)}</g><g id="wordWhite">{wordmark('#FFFFFF')}</g>
</defs>
<circle cx="329" cy="275" r="205" stroke="white" stroke-opacity=".13"/>
<circle cx="329" cy="275" r="253" stroke="white" stroke-opacity=".08"/>
<ellipse cx="316" cy="476" rx="215" ry="24" fill="#371479" opacity=".3" filter="url(#shadow)"/>
<g transform="rotate(9 402 276)">
 <path d="M278 151L470 137L497 391L278 405Z" fill="url(#bagLight)"/>
 <path d="M470 137L511 156L533 379L497 391Z" fill="#A5D22D"/>
 <path d="M278 151L303 164L511 156L470 137Z" fill="#EDFFA9"/>
 <path d="M319 171V126C319 58 416 58 416 126V163" stroke="#829F31" stroke-width="9" stroke-linecap="round"/>
 <path d="M322 169V125C322 63 413 63 413 125V163" stroke="#F0FFAC" stroke-width="5" stroke-linecap="round"/>
 <use href="#wordPurple" transform="translate(300 275) scale(.63)"/>
 {star(467, 213, PURPLE, 16)}
</g>
<g transform="rotate(-11 210 326)">
 <path d="M87 243L289 230L312 456L84 470Z" fill="url(#bagPink)"/>
 <path d="M289 230L326 248L349 443L312 456Z" fill="#D846A2"/>
 <path d="M87 243L113 255L326 248L289 230Z" fill="#FFB1E3"/>
 <path d="M130 257V216C130 151 229 151 229 216V250" stroke="#5C20BD" stroke-width="9" stroke-linecap="round"/>
 <path d="M133 257V216C133 155 226 155 226 216V250" stroke="#9157E9" stroke-width="4" stroke-linecap="round"/>
 <use href="#wordPurple" transform="translate(107 348) scale(.65)"/>
</g>
<g transform="rotate(6 425 430)">
 <path d="M345 401L514 383L559 418L383 439Z" fill="#A378FF"/>
 <path d="M383 439L559 418V489L383 510Z" fill="#5F24D7"/>
 <path d="M345 401L383 439V510L345 466Z" fill="#B897FF"/>
 <use href="#wordWhite" transform="translate(394 449) scale(.52)"/>
</g>
{star(97, 123, PINK, 27)}{star(544, 281, LIME, 22)}{star(349, 39, LIME, 13)}
<path d="M56 365Q39 353 32 366Q28 378 54 391Q79 369 67 362Q61 360 56 365Z" fill="{LIME}"/>
<g transform="translate(521 101) rotate(14)"><path d="M0 23Q26 48 53 22" stroke="{PINK}" stroke-width="6" stroke-linecap="round"/><ellipse cx="10" cy="8" rx="3" ry="5" fill="{PINK}"/><ellipse cx="42" cy="8" rx="3" ry="5" fill="{PINK}"/></g>
</svg>'''
(ASSETS / "dopamine-shopping.svg").write_text(illustration + "\n")
print("Generated five DOPAMINE SVG assets from the licensed Fredoka font.")
