#!/usr/bin/env python3
"""Descarga SOLO fotos aprobadas manualmente y con licencias reutilizables.
Uso: python descargar_fotos.py --limite 20
Requiere Internet en tu ordenador; no necesita instalar paquetes.
"""
import json,urllib.request,urllib.parse,html,re,argparse,time,os
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--limite',type=int,default=20);args=p.parse_args()
base=Path(__file__).parent; places=json.loads((base/'lugares.json').read_text(encoding='utf-8'))
manifest_path=base/'fotos'/'manifest.json'; manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
headers={'User-Agent':'PlanazoEducationalPhotoCurator/1.0 (educational local project)'}
def get(url):
 req=urllib.request.Request(url,headers=headers)
 with urllib.request.urlopen(req,timeout=18) as response:return response.read()
def clean(x):return re.sub(r'<[^>]+>','',html.unescape(x or '')).strip()
def allowed(lic):return bool(re.match(r'^(CC0|CC BY(?:-SA)?(?: |$)|Public domain|Dominio público)',lic,re.I))
count=0
for place in places:
 if count>=args.limite:break
 key=str(place['id'])
 if key in manifest:continue
 query='intitle:"'+place['nombre']+'" '+place['ciudad']+' filetype:bitmap'
 params={'action':'query','generator':'search','gsrsearch':query,'gsrnamespace':6,'gsrlimit':8,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':640,'format':'json'}
 try:
  data=json.loads(get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)))
  pages=list(data.get('query',{}).get('pages',{}).values())
  choices=[]
  for item in pages:
   inf=(item.get('imageinfo') or [{}])[0];meta=inf.get('extmetadata',{})
   lic=clean(meta.get('LicenseShortName',{}).get('value',''))
   if not allowed(lic) or not inf.get('thumburl') or not re.search(r'\.(jpe?g|png|webp)$',item['title'],re.I):continue
   choices.append((item,inf,lic,clean(meta.get('Artist',{}).get('value',''))))
  print('\n',place['nombre'],'—',place['ciudad'])
  for idx,(item,inf,lic,artist) in enumerate(choices,1):print(idx,item['title'],lic,inf.get('descriptionurl'))
  if not choices:print('Sin resultados con licencia identificable');continue
  answer=input('Abre los enlaces y comprueba que corresponde al lugar. Elige número o Enter para omitir: ').strip()
  if not answer.isdigit() or not (1<=int(answer)<=len(choices)):continue
  item,inf,lic,artist=choices[int(answer)-1]
  ext='.jpg' if re.search(r'\.jpe?g$',item['title'],re.I) else ('.png' if item['title'].lower().endswith('.png') else '.webp')
  filename='fotos/'+key+ext
  image=get(inf['thumburl'])
  if len(image)>2_500_000:print('Imagen demasiado grande, omitida');continue
  (base/filename).write_bytes(image)
  manifest[key]={'src':filename,'source':inf['descriptionurl'],'author':artist or 'Consultar autor en Wikimedia Commons','license':lic}
  manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
  count+=1;print('Guardada:',filename);time.sleep(.5)
 except Exception as e:print('No se pudo procesar:',e)
print('Fotos locales aprobadas en esta ejecución:',count)
