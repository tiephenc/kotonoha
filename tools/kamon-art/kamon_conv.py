"""Convertit les SVG de kamon (Wikimedia Commons) en fragments sûrs et thémables pour KOTONOHA.
Usage : python -I kamon_conv.py <dossier_svg> <sortie.js>
- garde uniquement les éléments de dessin SVG (aucun script, lien, image, texte) ;
- noir -> currentColor, blanc -> var(--kmp) (couleur du papier), pour suivre le thème jour/nuit ;
- arrondit les coordonnées pour alléger ; ne modifie pas les formes."""
import sys, os, re, json
import xml.etree.ElementTree as ET

SVGNS = 'http://www.w3.org/2000/svg'
KEEP = {'g', 'path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line'}
GEOM = {'d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'points', 'x1', 'y1', 'x2', 'y2', 'transform'}
PAINT = {'fill', 'stroke', 'stroke-width', 'fill-rule', 'clip-rule', 'stroke-linejoin', 'stroke-linecap', 'stroke-miterlimit', 'opacity', 'fill-opacity', 'stroke-opacity'}
NAMED = {'black': (0, 0, 0), 'white': (255, 255, 255)}

def rgb(c):
    c = c.strip().lower()
    if c in NAMED: return NAMED[c]
    m = re.fullmatch(r'#([0-9a-f]{3})', c)
    if m: return tuple(int(x * 2, 16) for x in m.group(1))
    m = re.fullmatch(r'#([0-9a-f]{6})', c)
    if m: return tuple(int(m.group(1)[i:i + 2], 16) for i in (0, 2, 4))
    m = re.fullmatch(r'rgb\((\d+),\s*(\d+),\s*(\d+)\)', c)
    if m: return tuple(int(x) for x in m.groups())
    return None

INV = [False]
INK, PAPER = 'currentColor', 'var(--kmp,#FCF7EE)'
def light(v):
    c = rgb(v)
    return c is not None and (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 >= .5
def color(v):
    if v.strip().lower() in ('none', 'currentcolor', 'inherit'): return v.strip()
    l = light(v)
    if INV[0]: l = not l
    return PAPER if l else INK

def num(s, dec):
    return re.sub(r'-?\d*\.\d+(?:e-?\d+)?|-?\d+(?:e-?\d+)?', lambda m: fmt(float(m.group(0)), dec), s)

def fmt(x, dec):
    t = ('%.' + str(dec) + 'f') % x
    t = t.rstrip('0').rstrip('.') if '.' in t else t
    return '0' if t in ('-0', '') else t

def local(tag): return tag.split('}', 1)[1] if tag.startswith('{') else tag

def paint_of(el):
    out = {}
    for k, v in el.attrib.items():
        k = local(k)
        if k in PAINT: out[k] = v
    st = el.attrib.get('style', '')
    for part in st.split(';'):
        if ':' in part:
            k, v = [x.strip() for x in part.split(':', 1)]
            if k in PAINT: out[k] = v
    for k in ('fill', 'stroke'):
        if k in out: out[k] = color(out[k])
    return out

def ser(el, dec):
    tag = local(el.tag)
    if el.tag.startswith('{') and not el.tag.startswith('{' + SVGNS): return ''
    if tag not in KEEP: return ''
    attrs = {}
    for k, v in el.attrib.items():
        k2 = local(k)
        if ('}' in k and not k.startswith('{' + SVGNS)): continue
        if k2 in GEOM: attrs[k2] = num(v, dec) if k2 != 'transform' else num(v, 4)
    attrs.update(paint_of(el))
    inner = ''.join(ser(c, dec) for c in el)
    if tag == 'g' and not inner: return ''
    a = ''.join(' %s="%s"' % (k, v.replace('"', '&quot;')) for k, v in attrs.items())
    return '<%s%s>%s</%s>' % (tag, a, inner, tag) if inner else '<%s%s/>' % (tag, a)

def css_ids(root):
    rules = {}
    for st in root.iter('{%s}style' % SVGNS):
        for sel, body in re.findall(r'([^{}]+)\{([^}]*)\}', st.text or ''):
            for one in sel.split(','):
                one = one.strip()
                if one.startswith('#'): rules[one[1:]] = rules.get(one[1:], '') + ';' + body
    for el in root.iter():
        i = el.attrib.get('id')
        if i in rules: el.attrib['style'] = rules[i] + ';' + el.attrib.get('style', '')

def drawables(el):
    for c in el:
        t = local(c.tag)
        if t == 'g': yield from drawables(c)
        elif t in KEEP: yield c, el

def numv(v): return float(re.match(r'-?[\d.]+', v).group(0))

def eff_fill(el, parents):
    f = paint_of(el).get('fill')
    return f

def convert(path):
    root = ET.parse(path).getroot()
    css_ids(root)
    INV[0] = False
    vb = root.attrib.get('viewBox')
    if not vb:
        w = float(re.match(r'[\d.]+', root.attrib['width']).group(0)); h = float(re.match(r'[\d.]+', root.attrib['height']).group(0))
        vb = '0 0 %s %s' % (fmt(w, 2), fmt(h, 2))
    W, H = [float(x) for x in vb.replace(',', ' ').split()[2:]]
    size = max(W, H)
    first = next(drawables(root), None)
    if first:
        el, par = first; t = local(el.tag); bg = False
        if t == 'rect' and numv(el.attrib.get('width', '0')) >= .95 * W and numv(el.attrib.get('height', '0')) >= .95 * H: bg = True
        if t == 'path' and re.match(r'\s*m\s*0[ ,]0\s*h\s*' + str(int(W)), el.attrib.get('d', ''), re.I): bg = True
        if bg:
            raw = {}
            for part in el.attrib.get('style', '').split(';'):
                if ':' in part: k, v = [x.strip() for x in part.split(':', 1)]; raw[k] = v
            fv = raw.get('fill', el.attrib.get('fill', '#000'))
            if not light(fv): INV[0] = True
            if t == 'path':
                el.attrib['d'] = re.sub(r'^\s*m\s*0[ ,]0\s*h\s*[\d.]+\s*v\s*[\d.]+\s*H\s*0', 'M0,0', el.attrib['d'])
                if el.attrib['d'].strip() == 'M0,0': par.remove(el)
            else: par.remove(el)
    dec = 1 if size > 300 else 2
    body = ''.join(ser(c, dec) for c in root)
    p = paint_of(root)
    if INV[0] and 'fill' not in p: p['fill'] = PAPER
    if p:
        a = ''.join(' %s="%s"' % (k, v) for k, v in p.items())
        body = '<g%s>%s</g>' % (a, body)
    return {'vb': ' '.join(fmt(float(x), 2) for x in vb.replace(',', ' ').split()), 'svg': body}

if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    res = {}
    for f in sorted(os.listdir(src)):
        if f.endswith('.svg'):
            res[f[:-4]] = convert(os.path.join(src, f))
            print(f, len(res[f[:-4]]['svg']))
    json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
