from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
ps=sorted(Path('tmp/pdfs').glob('page-*.png'))
for start in range(0,len(ps),8):
    sheet=Image.new('RGB',(1280,960),'#cbd5df')
    for j,path in enumerate(ps[start:start+8]):
        im=ImageOps.contain(Image.open(path),(306,440))
        x=(j%4)*320;y=(j//4)*480
        sheet.paste(im,(x,y+25))
        ImageDraw.Draw(sheet).text((x+8,y+5),path.stem,fill='black')
    sheet.save(f'tmp/pdfs/contact-{start//8+1}.png')
