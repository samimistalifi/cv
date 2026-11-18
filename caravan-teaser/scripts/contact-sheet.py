# Builds a labelled contact sheet of preview stills with the safe-zone guides drawn in red.
import sys, glob, os
from PIL import Image, ImageDraw
comp, cols = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 8
safe = {'TeaserEN': (250, 400, 1920), 'TeaserFA': (250, 400, 1920), 'TeaserENSquare': (90, 90, 1080), 'TeaserENWide': (90, 90, 1080)}[comp]
files = sorted(glob.glob(f'out/previews/{comp}-*.png'))
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size
k = h / safe[2]
sheet = Image.new('RGB', (cols * w, ((len(ims) + cols - 1) // cols) * (h + 24)), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 24)
    sheet.paste(im, (x, y + 24))
    d.text((x + 6, y + 6), os.path.basename(f), fill=(255, 255, 0))
    for yy in (safe[0] * k, h - safe[1] * k):
        d.line([(x, y + 24 + yy), (x + w, y + 24 + yy)], fill=(255, 0, 0), width=1)
sheet.save(f'out/previews/sheet-{comp}.jpg', quality=85)
print(sheet.size)
