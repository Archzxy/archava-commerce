import json
import unittest
from marketplace import MarketplaceContext, MARKET_TOPIC, catalog_product, search_catalog, compare_products


class MarketplaceTests(unittest.TestCase):
    def packet(self, **updates):
        return json.dumps(dict(page='/produk/headphones', revision=1, productIds=['headphones'], comparisonIds=['headphones', 'ritme-lite']) | updates).encode()

    def test_context_is_exact_guest_bound_and_monotonic(self):
        context = MarketplaceContext('guest-owner')
        self.assertFalse(context.accept_packet(MARKET_TOPIC, self.packet(), 'guest-other'))
        self.assertTrue(context.accept_packet(MARKET_TOPIC, self.packet(), 'guest-owner'))
        self.assertFalse(context.accept_packet(MARKET_TOPIC, self.packet(), 'guest-owner'))
        self.assertEqual(json.loads(context.ack()), {'page': '/produk/headphones', 'revision': 1})
        self.assertEqual(json.loads(context.describe())['products'][0]['price'], 429000)
        facts = {fact['key']: fact['value'] for fact in json.loads(context.describe())['products'][0]['knowledge']['specifications']}
        self.assertEqual(facts['batteryHours'], 30)
        self.assertIs(facts['anc'], False)
        self.assertIs(facts['multipoint'], True)

    def test_rejects_unknown_private_mixed_and_oversized_payloads(self):
        context = MarketplaceContext('guest-owner')
        for changes in [dict(address='private'), dict(page='https://example.com'), dict(productIds=['invented']), dict(comparisonIds=['headphones', 'smartwatch']), dict(revision=True), dict(productIds=['headphones', 'headphones'])]:
            self.assertFalse(context.accept_packet(MARKET_TOPIC, self.packet(**changes), 'guest-owner'))
        self.assertFalse(context.accept_packet(MARKET_TOPIC, b' ' * 2049, 'guest-owner'))
        self.assertEqual(json.loads(context.describe())['status'], 'not_available')

    def test_budget_search_and_exact_product_facts(self):
        result = json.loads(search_catalog('headphone', max_price=500000))
        self.assertGreater(result['total'], 0)
        self.assertTrue(all(product['price'] <= 500000 for product in result['products']))
        self.assertIn('error', json.loads(catalog_product('invented')))
        self.assertIn('error', json.loads(search_catalog('', max_price=-1)))

    def test_wrong_product_type_category_is_recoverable_without_losing_budget(self):
        # These are the exact filters emitted in a failed live headphone conversation.
        for category in ('headphones', 'wireless headphones'):
            result = json.loads(search_catalog('wireless headphone', category, 500000))
            self.assertEqual(result['status'], 'invalid_filter')
            self.assertNotIn('total', result)  # Failed filters are not a claim of product absence.
            recovered = json.loads(search_catalog(**result['retry']))
            self.assertEqual({p['id'] for p in recovered['products']}, {'headphones', 'ritme-lite'})
            self.assertEqual(recovered['filters']['maxPrice'], 500000)

    def test_local_category_labels_and_missing_results_remain_distinct(self):
        for category in ('Rumah', 'rumah', 'Rumah & Living'):
            result = json.loads(search_catalog('blender', category))
            self.assertEqual(result['total'], 3)
            self.assertTrue(all(p['category'] == 'Rumah' for p in result['products']))
        empty = json.loads(search_catalog('headphone', max_price=300000))
        self.assertEqual(empty['status'], 'no_results')
        self.assertEqual(empty['total'], 0)

    def test_product_knowledge_is_available_beyond_comparison_groups(self):
        beats = json.loads(catalog_product('beats-flex-wireless-earphones'))
        self.assertEqual(beats['price'], 700000)
        self.assertIn('Baterai hingga 12 jam', beats['specs'])
        self.assertIn('ketahanan air', ' '.join(beats['knowledge']['unknowns']))
        self.assertEqual(beats['alternatives'], [])
        laptop = json.loads(catalog_product('apple-macbook-pro-14-inch-space-grey'))
        self.assertIn('RAM', ' '.join(laptop['knowledge']['unknowns']))
        self.assertFalse(any('16 GB' in str(fact) for fact in laptop['knowledge']['specifications']))

    def test_headphone_knowledge_contains_boolean_units_and_real_alternatives(self):
        result = json.loads(catalog_product('headphones'))
        facts = {fact['key']: fact for fact in result['knowledge']['specifications']}
        self.assertIs(facts['anc']['value'], False)
        self.assertEqual((facts['batteryHours']['value'], facts['batteryHours']['unit']), (30, 'jam'))
        self.assertEqual({p['id'] for p in result['alternatives']}, {'audia-focus-one', 'ritme-lite'})

    def test_comparison_preserves_units_values_and_demo_status(self):
        result = json.loads(compare_products(['headphones', 'audia-focus-one', 'ritme-lite']))
        self.assertTrue(result['demo'])
        self.assertEqual(result['lowestPriceIds'], ['ritme-lite'])
        self.assertEqual(len(result['products']), 3)
        self.assertTrue(all(len(row['values']) == 3 for row in result['rows']))
        self.assertIn('error', json.loads(compare_products(['headphones', 'smartwatch'])))

    def test_budget_is_applied_before_priority_ranking(self):
        result = json.loads(compare_products(['headphones', 'audia-focus-one', 'ritme-lite'], 500000, 'battery'))
        self.assertEqual(result['budget']['excludedIds'], ['audia-focus-one'])
        self.assertEqual(result['ranking']['bestMatchId'], 'headphones')
        self.assertEqual(result['recommendedProduct']['id'], 'headphones')
        self.assertIs(result['recommendedProduct']['attributes']['multipoint'], True)
        self.assertIs(result['recommendedProduct']['attributes']['anc'], False)
        self.assertEqual(result['recommendedProduct']['tradeoffs'], ['Belum punya ANC untuk meredam suara sekitar'])
        self.assertEqual(result['ranking']['eligibleIds'], ['headphones', 'ritme-lite'])
        empty = json.loads(compare_products(['headphones', 'ritme-lite'], 300000, 'battery'))
        self.assertIsNone(empty['ranking']['bestMatchId'])

    def test_blender_weight_ranking_uses_kilograms_and_budget(self):
        result = json.loads(compare_products(['boxed-blender', 'dapur-rasa-mix', 'sedari-blend-mini'], 600000, 'weight'))
        self.assertEqual(result['ranking']['field'], 'weightKg')
        self.assertEqual(result['ranking']['bestMatchId'], 'sedari-blend-mini')
        self.assertEqual(result['budget']['excludedIds'], ['dapur-rasa-mix'])


if __name__ == '__main__':
    unittest.main()
