"""Full-page captures of the APG site served locally. Scrolls through the page first so in-view animations fire."""
import asyncio, sys, json
from playwright.async_api import async_playwright
BASE = sys.argv[1]; OUT = sys.argv[2]
ROUTES = json.loads(sys.argv[3])
FONT_CSS = open('/home/claude/apg-promo/site/fonts/all.css').read()
W = int(sys.argv[4]) if len(sys.argv) > 4 else 1440

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': W, 'height': 900 if W>600 else 844}, device_scale_factor=1 if W>600 else 2, is_mobile=W<=600, has_touch=W<=600)
        async def route(r):
            u = r.request.url
            if 'fonts.googleapis.com' in u:
                await r.fulfill(status=200, content_type='text/css', body=FONT_CSS)
            elif 'fonts.cdnfonts.com/css/good-times' in u:
                await r.fulfill(status=200, content_type='text/css', body="@font-face{font-family:'Good Times';src:url('/__fonts/goodtimes/GoodTimes-Regular.otf') format('opentype');font-weight:400 900;}")
            elif 'images.unsplash.com' in u:
                await r.fulfill(status=200, content_type='image/png', body=open('/home/claude/apg-promo/site/fonts/avatar.png','rb').read())
            elif 'cdnjs.cloudflare.com/__fonts/fa/webfonts/' in u:
                await r.fulfill(status=200, content_type='font/woff2', body=open('/home/claude/apg-promo/site/fonts/fa/webfonts/'+u.rsplit('/',1)[1].split('?')[0],'rb').read())
            elif 'font-awesome/6.0.0/css/all.min.css' in u:
                await r.fulfill(status=200, content_type='text/css', body=open('/home/claude/apg-promo/site/fonts/fa/css/all.min.css').read().replace('../webfonts/','/__fonts/fa/webfonts/'))
            elif u.startswith(BASE) or u.startswith('http://127.0.0.1'):
                await r.continue_()
            else:
                await r.abort()
        await ctx.route('**/*', route)
        page = await ctx.new_page()
        failed=set()
        page.on('requestfailed', lambda r: failed.add(r.url))
        page.on('response', lambda r: failed.add(r.url) if r.status>=400 and r.request.resource_type=='image' else None)
        await page.add_init_script("""
          // make scroll-triggered reveals instant
          try{localStorage.setItem("apg-co\u2026sent", JSON.stringify({choice:'declined',at:1}));}catch(e){}
          const s=document.createElement('style'); s.textContent='html{scroll-behavior:auto!important} [data-aos]{opacity:1!important;transform:none!important;transition:none!important} *{animation-play-state:paused!important}';
          document.addEventListener('DOMContentLoaded',()=>document.head.appendChild(s));
        """)
        for name, path in ROUTES.items():
            try:
                await page.goto(BASE + path, wait_until='networkidle', timeout=60000)
            except Exception as e:
                print('goto', name, e)
            await page.wait_for_timeout(1500)
            # scroll through to trigger in-view animations
            h = await page.evaluate('document.documentElement.scrollHeight')
            y = 0
            while y < h:
                await page.evaluate(f'window.scrollTo(0,{y})'); await page.wait_for_timeout(250); y += 400
                h = await page.evaluate('document.documentElement.scrollHeight')
            await page.evaluate('window.scrollTo(0,0)'); await page.wait_for_timeout(1200)
            # settle scroll-linked reveals (framer useScroll sections): force their finished state
            await page.add_style_tag(content='#realty [style*="opacity"],#swift-clear [style*="opacity"],#dynamic-tree [style*="opacity"],#luxe-prime [style*="opacity"],#alta-venture [style*="opacity"],#construction [style*="opacity"],[id="88-prime"] [style*="opacity"]{opacity:1!important;transform:none!important}')
            await page.wait_for_timeout(800)
            h = await page.evaluate('document.documentElement.scrollHeight')
            out = f'{OUT}/{name}.png'
            await page.screenshot(path=out, full_page=True, animations='disabled')
            print(name, 'height', h, '->', out); [print('  FAILED', u) for u in sorted(failed) if 'fonts.g' not in u]; failed.clear()
        await b.close()
asyncio.run(main())
