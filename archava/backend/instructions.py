"""Render the editable system prompt without importing any paid provider SDK."""

from string import Template
import json

from config import BRAND, ROOT, SECTIONS
from knowledge import FACTS, product_knowledge
from marketplace import catalog_briefing, GROUPS, PRODUCTS, compare_products


def sales_examples() -> str:
    """Ground demonstrations in current catalog data, including after client edits."""
    examples = [
        "Visitor: 'Aku cuma lihat-lihat.'\nAnswer: 'Boleh, santai aja. Kalau ada pilihan yang bikin penasaran, aku bisa bantu jelaskan bedanya.' No cart tool or repeated closing request.",
        "Visitor: 'Bagus juga.'\nAction: Offer one relevant next step, such as showing the important specification. Do not prepare or confirm a cart merely from this remark.",
        "Visitor: 'Masukkan pilihan kedua satu.'\nAction: get_shopping_plan to resolve the visible second ID, then request_cart_add(product_id=that_ID, quantity=1). Explain the returned preview item/amount and ask for confirmation. Only a NEW explicit confirmation after the proposal permits confirm_cart_add. A pending/unknown outcome is not success.",
    ]
    for group in GROUPS.values():
        ids = [key for key, product in PRODUCTS.items() if product.get('comparison', {}).get('group') == group['id']][:3]
        if len(ids) < 2:
            continue
        prices = sorted(PRODUCTS[key]['price'] for key in ids)
        budget = ((prices[len(prices) // 2] + 99_999) // 100_000) * 100_000
        battery = all(any(key in PRODUCTS[product_id]['comparison']['attributes'] for key in ('batteryHours', 'batteryDays')) for product_id in ids)
        priority = 'battery' if battery else 'price'
        comparison = json.loads(compare_products(ids, max_price=budget, priority=priority))
        winner = comparison.get('recommendedProduct')
        if not winner:
            continue
        brief = {'budget': budget, 'use_case': PRODUCTS[winner['id']]['comparison']['useCase'], 'priority': priority, 'query': group['label'].lower()}
        shortlist = [winner['id'], *(key for key in comparison['budget']['eligibleIds'] if key != winner['id'])]
        evidence = {'id': winner['id'], 'name': winner['name'], 'price': winner['price'], 'facts': winner['knownFacts'], 'tradeoffs': winner['tradeoffs']}
        examples.insert(0, f"Visitor: 'Bantu pilih {group['label'].lower()} sesuai kebutuhan dan budget {budget} rupiah, prioritas {priority}.'\nActions: update_shopping_brief({json.dumps(brief, ensure_ascii=False)}); compare_catalog_products(product_ids={json.dumps(ids)}, max_price={budget}, priority='{priority}'); show_shopping_recommendations(product_ids={json.dumps(shortlist)}).\nCurrent catalog evidence: {json.dumps(evidence, ensure_ascii=False)}\nAnswer: Recommend this fit with its price, one relevant benefit and one of ITS tradeoffs. Offer one next step such as showing the decisive specification. No cart mutation yet.")
        cheaper = sorted((PRODUCTS[key] for key in comparison['budget']['eligibleIds'] if PRODUCTS[key]['price'] < winner['price']), key=lambda product: product['price'])
        if cheaper:
            option = cheaper[0]
            facts = {'id': option['id'], 'name': option['name'], 'price': option['price'], 'useCase': option['comparison']['useCase'], 'attributes': option['comparison']['attributes'], 'tradeoffs': option['comparison']['tradeoffs']}
            examples.insert(1, "Visitor: 'Yang tadi kemahalan, ada yang lebih murah?'\nActions: Read saved needs; compare or fetch this actual lower-price option and update the visible shortlist. Current catalog evidence: " + json.dumps(facts, ensure_ascii=False) + "\nAnswer: Acknowledge the concern, name its price and the relevant tradeoff, and offer one useful next step. Preserve the original budget.")
        break
    return '\n\n'.join(examples)


def make_instructions(*, provider: str = "voice", seconds: int = 120) -> str:
    rendering = {
        "spatius": "Spatius renders the live avatar.",
        "tavus": "Tavus renders the live avatar.",
        "voice": "This is a voice-only session; there is no live avatar video.",
    }[provider]
    return Template((ROOT / "prompts/system.md").read_text(encoding="utf-8")).substitute(
        host_name=BRAND["hostName"], brand_name=BRAND["name"],
        default_language=BRAND["defaultLanguage"], topics=", ".join(FACTS),
        section_ids=", ".join(SECTIONS), knowledge=product_knowledge(),
        catalog=catalog_briefing(),
        shopping_examples=sales_examples(),
        session_context=f"This conversation is already active. Its configured time window is {seconds} seconds. {rendering} The website issues public guest sessions without sign-in. Never request an account or payment during this call.",
    )


if __name__ == "__main__":
    import os
    print(make_instructions(provider=os.getenv("AVATAR_PROVIDER", "spatius"), seconds=int(os.getenv("SESSION_SECONDS", "120"))))
