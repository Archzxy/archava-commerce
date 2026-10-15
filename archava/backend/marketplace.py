"""Bounded shopping tools backed by the local public catalog, never page text."""

import json
import re
import unicodedata
from dataclasses import dataclass, field

from config import ROOT

CATALOG = json.loads((ROOT / "config/catalog.json").read_text(encoding="utf-8"))
PRODUCTS = {product["id"]: product for product in CATALOG["products"]}
GROUPS = {group["id"]: group for group in CATALOG["groups"]}
CATEGORY_NAMES = [item["name"] for item in CATALOG["categories"]]
MARKET_TOPIC = "archava.market"
MARKET_ACK_TOPIC = "archava.market.ack"
MARKET_NAVIGATION_TOPIC = "archava.market.navigation"
MAX_REVISION = 9_007_199_254_740_991


def encoded(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def valid_page(page: object) -> bool:
    if not isinstance(page, str):
        return False
    if page in {"/", "/produk", "/kategori", "/promo", "/bandingkan", "/favorit", "/keranjang", "/checkout", "/akun", "/bantuan"}:
        return True
    return (page in {f"/produk/{key}" for key in PRODUCTS}
            or page in {f"/kategori/{item['slug']}" for item in CATALOG["categories"]})


def valid_ids(value: object, maximum: int) -> bool:
    return (isinstance(value, list) and len(value) <= maximum
            and all(isinstance(key, str) and key in PRODUCTS for key in value)
            and len(set(value)) == len(value))


def valid_comparison(ids: object, minimum: int = 2) -> bool:
    if not valid_ids(ids, 3) or len(ids) < minimum:
        return False
    groups = [PRODUCTS[key].get("comparison", {}).get("group") for key in ids]
    return bool(groups and groups[0] and all(group == groups[0] for group in groups))


@dataclass
class MarketplaceContext:
    guest_identity: str
    page: str | None = None
    revision: int = -1
    product_ids: list[str] = field(default_factory=list)
    comparison_ids: list[str] = field(default_factory=list)

    def accept_packet(self, topic: str | None, data: bytes, identity: str | None) -> bool:
        if topic != MARKET_TOPIC or identity != self.guest_identity or len(data) > 2048:
            return False
        try:
            payload = json.loads(data)
        except (UnicodeDecodeError, ValueError):
            return False
        if not isinstance(payload, dict) or set(payload) != {"page", "revision", "productIds", "comparisonIds"}:
            return False
        revision = payload["revision"]
        if (isinstance(revision, bool) or not isinstance(revision, int)
                or not self.revision < revision <= MAX_REVISION or revision < 0
                or not valid_page(payload["page"]) or not valid_ids(payload["productIds"], 12)
                or not valid_ids(payload["comparisonIds"], 3)
                or (payload["comparisonIds"] and not valid_comparison(payload["comparisonIds"], 1))):
            return False
        self.page, self.revision = payload["page"], revision
        self.product_ids, self.comparison_ids = payload["productIds"], payload["comparisonIds"]
        return True

    def describe(self) -> str:
        if self.page is None:
            return encoded({"status": "not_available", "message": "Konteks belanja belum diterima. Jangan menebak produk yang dibuka."})
        return encoded({"status": "received", "page": self.page, "revision": self.revision,
                        "products": [product_details(PRODUCTS[key]) if self.page == f"/produk/{key}" else product_summary(PRODUCTS[key]) for key in self.product_ids],
                        "comparison": [product_details(PRODUCTS[key]) for key in self.comparison_ids],
                        "demo": True, "notice": CATALOG["notice"]})

    def ack(self) -> bytes:
        return encoded({"page": self.page, "revision": self.revision}).encode("utf-8")


def product_summary(product: dict) -> dict:
    return {key: product[key] for key in ("id", "name", "brand", "category", "price", "demo")} | {
        "comparisonGroup": product.get("comparison", {}).get("group"),
        "highlights": product["specs"], "useCase": product.get("knowledge", {}).get("useCase")}


def catalog_briefing() -> str:
    """Give the model an inventory map, generated from the same snapshot as tools."""
    lines = ["DEMO CATALOG INDEX:",
             f"{len(PRODUCTS)} products. Currency IDR. These are demo listings, not manufacturer verification.",
             "Known names/IDs and highlights below identify products. Use get_catalog_product for full knowledge; missing details stay unknown.",
             "Exact search categories: " + ", ".join(CATEGORY_NAMES) + ". Product types belong in query, not category."]
    for category in CATEGORY_NAMES:
        lines.append(f"\n{category}:")
        for product in PRODUCTS.values():
            if product["category"] == category:
                lines.append(f"- {product['id']} | {product['brand']} — {product['name']} | IDR {product['price']} | {'; '.join(product['specs'])}")
    lines.append("\nCOMPARABLE GROUPS (exact catalog IDs):")
    for group in GROUPS.values():
        members = [key for key, product in PRODUCTS.items() if product.get("comparison", {}).get("group") == group["id"]]
        lines.append(f"- {group['label']}: {', '.join(members)}")
    return "\n".join(lines)


def product_details(product: dict) -> dict:
    """Only facts useful to the assistant; omit image paths and search internals."""
    return {key: product[key] for key in ("id", "name", "brand", "category", "price", "oldPrice", "stock", "rating", "demo", "description", "specs", "knowledge") if key in product} | {
        "currency": CATALOG["currency"], "comparisonGroup": product.get("comparison", {}).get("group"),
        **({"comparison": product["comparison"]} if "comparison" in product else {})}


def comparison_details(product: dict, group: dict) -> dict:
    profile = product['comparison']
    facts = []
    for field in group['fields']:
        value = profile['attributes'][field['key']]
        formatted = 'Ada' if value is True else 'Tidak ada' if value is False else str(value)
        facts.append(f"{field['label']} ({field['key']}): {formatted}{' ' + field['unit'] if field.get('unit') else ''}")
    return product_summary(product) | {'attributes': profile['attributes'], 'knownFacts': facts,
        'strengths': profile['strengths'], 'tradeoffs': profile['tradeoffs'],
        'unknowns': product.get('knowledge', {}).get('unknowns', []), 'source': profile['source']}


def catalog_product(product_id: str) -> str:
    product = PRODUCTS.get(product_id) if isinstance(product_id, str) else None
    if not product:
        return encoded({"error": "Produk tidak ada dalam katalog demo. Gunakan search_catalog untuk menemukan ID yang valid."})
    group = product.get("comparison", {}).get("group")
    peers = [product_summary(peer) for peer in PRODUCTS.values() if group and peer["id"] != product_id and peer.get("comparison", {}).get("group") == group]
    return encoded(product_details(product) | {"alternatives": peers})


def search_catalog(query: str, category: str = "", max_price: int = 0) -> str:
    if not isinstance(query, str) or len(query) > 120 or not isinstance(category, str):
        return encoded({"error": "Gunakan kata kunci singkat dan kategori katalog."})
    if isinstance(max_price, bool) or not isinstance(max_price, int) or not 0 <= max_price <= 100_000_000:
        return encoded({"error": "Batas harga harus bilangan rupiah antara 0 dan 100 juta."})
    category = category.strip()
    if category.casefold() == "all":
        category = ""
    canonical = next((item["name"] for item in CATALOG["categories"] if category.casefold() in {item["name"].casefold(), item["slug"].casefold(), item["label"].casefold()}), None) if category else ""
    if canonical is None:
        return encoded({"status": "invalid_filter", "errorCode": "unknown_category", "error": "Kategori tidak dikenal; ini bukan hasil pencarian kosong. Jenis produk seperti headphone adalah query, bukan kategori.",
                        "categories": CATEGORY_NAMES, "retry": {"query": query, "category": "all", "max_price": max_price}})
    normalize = lambda text: "".join(char for char in unicodedata.normalize("NFD", text.casefold()) if not unicodedata.combining(char))
    tokens = re.findall(r"\w+", normalize(query))
    result = []
    for product in PRODUCTS.values():
        if canonical and product["category"] != canonical:
            continue
        if max_price and product["price"] > max_price:
            continue
        words = re.findall(r"\w+", normalize(" ".join([product["name"], product["brand"], product["category"], product["keywords"]])))
        if all(any(word.startswith(token) for word in words) for token in tokens):
            result.append(product_summary(product))
    result.sort(key=lambda product: product["price"])
    return encoded({"status": "found" if result else "no_results", "demo": True, "total": len(result), "products": result[:6], "categories": CATEGORY_NAMES,
                    "filters": {"query": query, "category": canonical, "maxPrice": max_price or None},
                    **({"recovery": "Coba kata inti produk atau alias dari indeks katalog dengan budget yang sama. Jangan simpulkan seluruh jenis produk tidak ada dari satu pencarian."} if not result else {})})


def compare_products(product_ids: list[str], max_price: int = 0, priority: str = "") -> str:
    if not valid_comparison(product_ids):
        return encoded({"error": "Pilih dua atau tiga ID produk dalam kelompok perbandingan yang sama. Jangan mengarang spesifikasi produk lain."})
    if isinstance(max_price, bool) or not isinstance(max_price, int) or not 0 <= max_price <= 100_000_000 or not isinstance(priority, str) or priority not in {"", "battery", "weight", "price"}:
        return encoded({"error": "Gunakan budget rupiah yang valid dan prioritas battery, weight, price, atau kosong."})
    products = [PRODUCTS[key] for key in product_ids]
    group = GROUPS[products[0]["comparison"]["group"]]
    cheapest = min(product["price"] for product in products)
    rows = [{"key": field["key"], "label": field["label"], "unit": field.get("unit"), "type": field.get("type", "value"),
             "values": [product["comparison"]["attributes"][field["key"]] for product in products]}
            for field in group["fields"]]
    eligible = [product for product in products if not max_price or product["price"] <= max_price]
    ranking = None
    if priority:
        attributes = products[0]["comparison"]["attributes"]
        field = "price" if priority == "price" else next((key for key in ("weightG", "weightKg") if key in attributes), "") if priority == "weight" else next((key for key in ("batteryHours", "batteryDays") if key in attributes), "")
        def value(product):
            return product["price"] if field == "price" else product["comparison"]["attributes"].get(field)
        if field and all(isinstance(value(product), (int, float)) and not isinstance(value(product), bool) for product in eligible):
            ordered = sorted(eligible, key=lambda product: (-(value(product)) if priority == "battery" else value(product), product["price"]))
            ranking = {"priority": priority, "field": field, "order": "maximum" if priority == "battery" else "minimum", "eligibleIds": [product["id"] for product in ordered], "bestMatchId": ordered[0]["id"] if ordered else None,
                       "rule": "Hanya kandidat di dalam budget yang dirangking menurut prioritas ini; bukan pemenang universal."}
    recommended = next((product for product in eligible if ranking and product['id'] == ranking['bestMatchId']), None)
    return encoded({"demo": True, "recommendedProduct": comparison_details(recommended, group) if recommended else None,
                    "group": group["label"], "products": [comparison_details(product, group) for product in products], "rows": rows,
                    "budget": {"maxPrice": max_price or None, "eligibleIds": [product["id"] for product in eligible], "excludedIds": [product["id"] for product in products if product not in eligible], "rule": "Jangan merekomendasikan kandidat di atas budget tanpa izin pengguna untuk menaikkan budget."}, "ranking": ranking,
                    "lowestPriceIds": [product["id"] for product in products if product["price"] == cheapest],
                    "notice": "Semua spesifikasi adalah skenario demo. Tidak ada pemenang universal; sesuaikan rekomendasi dengan kebutuhan pengguna."})
