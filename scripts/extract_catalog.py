#!/usr/bin/env python3
"""Extract the TC Plant catalog (products, prices, images) from the source quotation PDF."""
import fitz, re, json, os, sys

PDF = sys.argv[1] if len(sys.argv)>1 else "source_quotation.pdf"
OUT_JSON = "src/data/catalog.json"
IMG_DIR = "public/plants"
TIERS = ["05-09","10-19","20-49","50-99","100-299"]
PRICE_X = [300,338,375,413,451]
CODE_RE = re.compile(r'^[A-Z]{2,3}\d{2,3}[A-Z]?$')
CAT_RE  = re.compile(r'^[A-Z][A-Z ]{2,30}$')

def tier_idx(x):
    b = min(range(5), key=lambda i: abs(PRICE_X[i]-x))
    return b if abs(PRICE_X[b]-x) < 18 else None

def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    doc = fitz.open(PDF)
    products = []
    for pno in range(doc.page_count):
        page = doc[pno]
        d = page.get_text("dict")
        spans = []
        for b in d["blocks"]:
            for l in b.get("lines", []):
                for s in l["spans"]:
                    t = s["text"].strip()
                    if t and s["bbox"][1] > 210:
                        spans.append((s["bbox"][0], s["bbox"][1], t))
        images = [im for im in page.get_image_info(xrefs=True) if im["bbox"][0] > 400]
        codes = sorted([(x,y,t) for x,y,t in spans if 200<=x<240 and CODE_RE.match(t)], key=lambda z:z[1])
        for cx, cy, code in codes:
            name = " ".join(t for x,y,t in sorted(spans, key=lambda z:(z[1],z[0]))
                            if x<200 and cy-10<=y<=cy+24 and not (CAT_RE.match(t) and "'" not in t)).strip()
            note = " ".join(t for x,y,t in spans if 240<=x<292 and cy-6<=y<=cy+20 and not t.startswith('$')).strip()
            prices = {}
            for x,y,t in spans:
                if t.startswith('$') and cy-6<=y<=cy+20:
                    ti = tier_idx(x)
                    if ti is not None:
                        try: prices[TIERS[ti]] = float(t.replace('$','').replace(',',''))
                        except: pass
            genus = re.sub(r'[^A-Za-z]','', name.split()[0]) if name else "Other"
            # map nearest image by vertical center
            img_file = None
            if images:
                best = min(images, key=lambda im: abs((im["bbox"][1]+im["bbox"][3])/2 - cy))
                if abs((best["bbox"][1]+best["bbox"][3])/2 - cy) < 60:
                    ext = doc.extract_image(best["xref"])
                    img_file = f"{code}.{ext['ext']}"
                    with open(os.path.join(IMG_DIR, img_file), "wb") as f:
                        f.write(ext["image"])
            products.append({
                "code": code, "name": name, "genus": genus,
                "note": note or None, "prices": prices,
                "image": f"/plants/{img_file}" if img_file else None,
            })
    # sort: genus then name
    products.sort(key=lambda p:(p["genus"], p["name"]))
    meta = {
        "supplier": "Xanh Xanh Urban Forest Co., Ltd",
        "currency": "USD",
        "incoterm": "EXW (INCOTERM 2020)",
        "quotation_date": "2026-07-01",
        "tiers": TIERS,
        "count": len(products),
    }
    json.dump({"meta": meta, "products": products}, open(OUT_JSON,"w"), indent=1, ensure_ascii=False)
    print(f"Wrote {len(products)} products to {OUT_JSON}")
    print(f"Images: {sum(1 for p in products if p['image'])}/{len(products)} in {IMG_DIR}/")

if __name__ == "__main__":
    main()
