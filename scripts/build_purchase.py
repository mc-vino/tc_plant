#!/usr/bin/env python3
"""Turn the September purchase sheet into the site's catalogue JSON.

Photos are carried over from the previous list by article: the numbering is the
same, so an article that existed before points at the same plant.
"""
import openpyxl, json, re, difflib, os, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else 'price.xlsx'
OUT = 'src/data/purchase.json'
OLD = 'src/data/clones.json'   # photos are carried over from here, by article
PUBLIC = 'public'

ws = openpyxl.load_workbook(SRC, data_only=True)['основной']
rate = ws.cell(row=3, column=7).value  # "курс $" -> 100
rows = [r for r in ws.iter_rows(min_row=5, values_only=True)
        if any(v is not None and str(v).strip() for v in r[:7])]

CYR = re.compile(r'[а-яё]', re.I)

def clean_name(raw):
    """Collapse the sheet's line breaks; Russian asides become notes."""
    parts = [p.strip() for p in str(raw).split('\n') if p.strip()]
    names, asides = [], []
    for p in parts:
        (asides if CYR.search(p) else names).append(p)
    out = ''
    for p in names:
        if not out:
            out = p
        elif out.count('(') > out.count(')') or p.startswith('('):
            out += ' ' + p
        else:
            out += ' / ' + p
    return re.sub(r'\s+', ' ', out).strip(), asides

def norm(s):
    s = re.sub(r'\b[abc]\s*grade\b|\bgrade\b|\bmixed\b', ' ', s.replace('\n', ' '), flags=re.I)
    return ' '.join(re.sub(r'[^0-9a-zа-яё]+', ' ', s.lower()).split())

old = json.load(open(OLD))
photo, oldnorm = {}, {}
for p in old['products']:
    if not p.get('image'):
        continue
    info = (p['image'], p.get('imageW'), p.get('imageH'))
    for a in str(p['article']).split('/'):
        photo.setdefault(a.strip(), info)
    for v in p['variants']:
        if v.get('article'):
            photo.setdefault(str(v['article']).strip(), info)
    oldnorm.setdefault(norm(p['name']), info)
keys = list(oldnorm)

products, stats = [], {'article': 0, 'name': 0, 'fuzzy': 0, 'none': 0}
seen = set()
for r in rows:
    genus_col, article, raw_name, pack, min_packs, usd, rub, note = r[:8]
    article = str(article).strip()
    if not re.fullmatch(r'[0-9A-Za-z\-]+', article):
        sys.exit(f'unexpected article: {article!r}')
    if article in seen:
        sys.exit(f'duplicate article: {article}')
    seen.add(article)

    name, asides = clean_name(raw_name)
    notes = [str(note).strip()] if note else []
    notes += asides
    # The sheet has one misspelt genus; the name itself stays verbatim.
    genus = {'Anthrium': 'Anthurium'}.get(name.split()[0], name.split()[0])

    img = photo.get(article)
    if img:
        stats['article'] += 1
    else:
        k = norm(name)
        img = oldnorm.get(k)
        if img:
            stats['name'] += 1
        else:
            m = difflib.get_close_matches(k, keys, n=1, cutoff=0.93)
            if m:
                img = oldnorm[m[0]]
                stats['fuzzy'] += 1
            else:
                stats['none'] += 1
    if img and not os.path.exists(PUBLIC + img[0]):
        sys.exit(f'missing image file: {img[0]}')

    price = round(float(rub), 2) if rub else None
    products.append({
        'code': 'PR' + article,
        'article': article,
        'name': name,
        'genus': genus,
        'category': str(genus_col).strip() if genus_col else None,
        'image': img[0] if img else None,
        'imageW': img[1] if img else None,
        'imageH': img[2] if img else None,
        'pack': int(pack) if pack else 1,
        'minPacks': int(min_packs) if min_packs else None,
        'note': ', '.join(notes) if notes else None,
        'price': price,
        'priceUsd': round(float(usd), 2) if usd else None,
    })

products.sort(key=lambda p: (p['genus'], p['name']))
meta = {
    'id': 'purchase',
    'label': 'Основной',
    'description': (
        'Прайс закупки от 14 сентября 2026. Цены в рублях по ориентировочному курсу '
        f'{int(rate)} ₽ за доллар. У части позиций цена указана за упаковку, у большинства '
        'задан минимум упаковок в общем заказе. Фото перенесены из прошлого прайса по '
        'артикулу: поставщик приводит их как пример сорта, а не снимок конкретного растения.'
    ),
    'currency': 'RUB',
    'priceType': 'wholesale',
    'quotationDate': '2026-09-14',
    'usdRate': int(rate),
    'count': len(products),
}
json.dump({'meta': meta, 'products': products}, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('written', OUT, len(products), 'products')
print('photos:', stats, '| with photo:', sum(1 for p in products if p['image']))
print('no price:', [p['article'] for p in products if p['price'] is None])
print('packs > 1:', [p['article'] for p in products if p['pack'] > 1])
