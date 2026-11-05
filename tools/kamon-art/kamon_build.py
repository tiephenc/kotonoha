import json,subprocess,io,re,sys
d=json.load(open('kamon-art.json',encoding='utf-8'))
hand=json.loads(subprocess.check_output(['node','-e',"process.stdout.write(JSON.stringify(require('./kamon_hand.js')))"]).decode())
M=('Mukai','CC BY-SA 3.0','https://creativecommons.org/licenses/by-sa/3.0/deed.fr')
G=('Gameposo, vectorisé par Marnanel','CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0/deed.fr')
L=('Los688 (vectorisation)','domaine public','')
KS=('Mukai et Senu','CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0/deed.fr')
F={'katabami':('Japanese Crest Katabami.svg',M),'kaji':('Japanese Crest Suwa Kajinoha Shimosha White Background.svg',KS),'myoga':('Japanese Crest Maru ni Daki Myouga.svg',G),
'tachibana':('Japanese Crest Yakushiji Maru ni Mitsu Tachibana.svg',G),'tomoe':('Japanese Crest mitu Tomoe 1.svg',M),'hikiryo':('Japanese Crest Marunouti ni Futatu Hiki.svg',M),
'janome':('Japanese Crest janome.svg',L),'umebachi':('Japanese Crest Kenumebachi.svg',G),'rokumonsen':('Japanese Crest rokumonsen.svg',L),'kuyo':('Japanese Crest Hosokawa Kuyou.svg',M),
'uroko':('Japanese Crest mitu Uroko.svg',M),'mokko':('Japanese Crest Oda ka.svg',M),'ageha':('Japanese Crest Bizenn Chou.svg',M),'hishi':('Japanese Crest Takedabishi.svg',L),
'aoi':('Japanese Crest Maru ni mitu ura Aoi.svg',M),'kiri':('Japanese Crest Maru ni Goshichi no Kiri.svg',G),'jumonji':('Japanese Crest maru ni jyuji.svg',M),
'fuji':('Japanese Crest Maru ni Sagari Fuji.svg',G),'kiku':('Japanese Crest Jyuuroku Kiku.svg',M)}
def fix(svg):
    def tag(m):
        t=m.group(0); st=[]
        def rep(mm):
            st.append(mm.group(1)+':'+mm.group(2)); return ''
        t=re.sub(r'\s(fill|stroke)="(var\(--kmp[^"]*\))"',rep,t)
        if st:
            end='/>' if t.endswith('/>') else '>'
            t=t[:-len(end)]+' style="'+';'.join(st)+'"'+end
        return t
    return re.sub(r'<[a-z]+\b[^>]*>',tag,svg)
out={}
for k,(f,(a,l,u)) in F.items():
    out[k]={'vb':d[k]['vb'],'svg':fix(d[k]['svg']),'cr':{'file':f,'url':'https://commons.wikimedia.org/wiki/File:'+f.replace(' ','_'),'author':a,'lic':l,'licUrl':u,'mod':'couleurs adaptées au thème du site (formes inchangées)'}}
for k,v in hand.items():
    out[k]={'vb':'0 0 100 100','svg':fix(v),'cr':None}
assert not any('="var(' in v['svg'] for v in out.values())
js='''/* KOTONOHA · dessins des kamon.
   - 19 kamon reprennent fidèlement des fichiers SVG de Wikimedia Commons (série « Japanese Crest »). Seules les couleurs
     sont adaptées au thème (noir -> couleur du sceau, blanc -> papier) ; le fond carré est retiré ; les formes ne sont pas modifiées.
     Les fichiers sous CC BY-SA restent sous la même licence, avec l'auteur crédité sur chaque fiche (champ cr) et dans LICENCES-KAMON.md.
   - 5 kamon (kikyō, mitsuboshi, takanoha, tsuru, rindō) sont redessinés pour KOTONOHA d'après le motif traditionnel (cr: null).
   Fichier généré depuis les SVG d'origine (outils : tools/kamon-art/) ; ne pas éditer à la main. */
window.KX_KAMON_ART = ''' + json.dumps(out,ensure_ascii=False,separators=(',',':')) + ';\n'
io.open(sys.argv[1],'w',encoding='utf-8',newline='\n').write(js)
print(out['janome']['svg']); print(len(js))
