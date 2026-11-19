"""Regenerates public/og-image.png (1200x630 social share image). Run: python3 scripts/make-og-image.py
Requires: pip install playwright && playwright install chromium, and node_modules installed."""
import asyncio, base64, os
from playwright.async_api import async_playwright
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fd = root + '/node_modules/@fontsource/'
SITE = os.environ.get('SITE_HOST', 'pesus-tracker.vercel.app')
def face(fam, path, w):
    d = base64.b64encode(open(fd + path, 'rb').read()).decode()
    return f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{d}) format('woff2')}}"
faces = ''.join([
    face('FG', 'familjen-grotesk/files/familjen-grotesk-latin-700-normal.woff2', 700),
    face('FG', 'familjen-grotesk/files/familjen-grotesk-latin-ext-700-normal.woff2', 700),
    face('FG', 'familjen-grotesk/files/familjen-grotesk-latin-500-normal.woff2', 500),
    face('PM', 'ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 400),
    face('PM', 'ibm-plex-mono/files/ibm-plex-mono-latin-ext-400-normal.woff2', 400),
    face('PM', 'ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2', 600),
])
html = f"""<html><head><style>{faces}
*{{box-sizing:border-box}} body{{margin:0}}
.c{{width:1200px;height:630px;background:#e6ebef;position:relative;overflow:hidden;font-family:FG;color:#14213d;display:grid;grid-template-columns:1.25fr .75fr;padding:64px 70px}}
.brand{{display:flex;align-items:center;gap:14px;font-weight:700;font-size:36px;letter-spacing:-.03em}}
.coin{{width:52px;height:52px;border-radius:50%;background:#f5b700;display:grid;place-items:center;font-size:28px;box-shadow:inset 0 0 0 2px rgba(20,33,61,.18),inset 0 0 0 6px #f5b700,inset 0 0 0 7.5px rgba(20,33,61,.18)}}
h1{{font-size:112px;line-height:.93;letter-spacing:-.045em;margin:54px 0 0;font-weight:700}}
p{{font-size:30px;font-weight:500;margin:30px 0 0;color:#2b3a5c;letter-spacing:-.01em}}
.r{{position:relative;align-self:center;justify-self:end;width:330px;transform:rotate(3deg);margin-top:30px}}
.slot{{height:22px;border-radius:12px;background:#14213d;margin:0 -14px}}
.paper{{background:#fff;margin-top:-8px;padding:30px 22px 28px;font-family:PM;font-size:16px;line-height:1.75;color:#1d2433;box-shadow:0 30px 50px -28px rgba(20,33,61,.45);
-webkit-mask:conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50%/20px 100%}}
.h{{text-align:center;border-bottom:1.5px dashed #c8cfd8;padding-bottom:12px;margin-bottom:10px;font-weight:600;font-size:19px}}
.row{{display:flex;justify-content:space-between}} .sep{{border-top:1.5px dashed #c8cfd8;margin:10px 0}}
.t{{font-weight:600;font-size:19px}} .g{{color:#2f7a4f}}
.stamp{{position:absolute;right:-30px;top:-58px;background:#f5b700;font:700 22px/1.1 FG;padding:12px 14px;border-radius:12px;transform:rotate(-8deg);box-shadow:0 14px 30px -14px rgba(20,33,61,.55)}}
.url{{position:absolute;left:70px;bottom:56px;font-size:24px;font-weight:500;color:#5a6a7e}}
</style></head><body><div class=c>
<div><div class=brand><span class=coin>₱</span>pesus</div><h1>Where did my<br>pesos go?</h1><p>Free expense tracker for the Philippines.</p></div>
<div class=r><div class=slot></div><div class=paper><div class=h>PESUS</div>
<div class=row><span>Jeep fare</span><span>₱13.00</span></div><div class=row><span>Kape sa umaga</span><span>₱120.00</span></div>
<div class=row><span>Lunch</span><span>₱95.00</span></div><div class=row><span>Grab pauwi</span><span>₱238.00</span></div>
<div class=sep></div><div class="row t"><span>Total today</span><span>₱466.00</span></div><div class="row g"><span>Left this month</span><span>₱6,534.00</span></div></div>
<div class=stamp>Under<br>budget</div></div>
<div class=url>{SITE}</div></div></body></html>"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1200, "height": 630})
        await pg.set_content(html); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=root + '/public/og-image.png')
        await b.close()
asyncio.run(main())
