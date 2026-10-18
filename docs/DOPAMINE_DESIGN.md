# DOPAMINE — visual direction and layout

Current direction follows the DOPAMINE brand board supplied by the user. DOPAMINE is the storefront brand;
Ava remains its shopping assistant. This adapts the existing KALA marketplace,
which uses the Archava avatar/session foundation.

## Direction

An expressive, curated everyday store: tightly spaced italic lowercase purple
lettering, handwritten campaign copy, lime and pink accents, cream reading
surfaces, original catalog photographs and generated brand campaign photography.
“Good things. Happier you.” is a brand line,
not a medical claim or a claim that buying raises dopamine.

The palette and layout below are original design decisions. “Dopamine” does not
identify one prescribed set of hex values. References informed the direction;
no third-party brand artwork, interface, or product catalog was copied.

## Research translated into decisions

| Reference | Observation / scope | Our decision |
| --- | --- | --- |
| User-supplied DOPAMINE brand board | Purple, lime, pink, cream, a dense slanted wordmark, handwritten notes, a fashion campaign, real-looking paper packaging and a compact mobile retail example. This is the selected visual direction. | Original tight italic wordmark, a lowercase d icon, generated photographic campaign assets, brush lettering, and a compact lime retail banner. |
| [Pinterest's 2026 Manifestival](https://newsroom.pinterest.com/en-ca/news/cannes-2026-pinterest-manifestival/) and its [FunHaus reference](https://business.pinterest.com/pinterest-predicts/2026/funhaus/) | Earlier research into expressive, personal styling and playful objects. | Supporting context; the supplied board takes priority over the earlier cobalt/lemon proposal. |
| [ban.do](https://www.bando.com/) | A retail reference for a broad lifestyle assortment with a cheerful editorial voice. No conversion result is inferred from its appearance. | A friendly store voice, curated collections and category discovery. |
| [BAGGU](https://baggu.com/) | A retail reference for putting actual products and collections at the center. | Product photographs and names remain the main content of product cards. |
| [Baymard homepage and category navigation research](https://baymard.com/research/homepage-and-category-usability) | Product discovery and category clarity matter to shopping usability. | Search and categories stay visible; product grids keep a consistent structure. |
| [Baymard mobile category navigation](https://baymard.com/research-articles/main-navigation-product-categories) | Exposing product categories directly reduces the effort needed to begin browsing. | Keep category links in the mobile menu and a visible seven-category homepage section. |
| [WCAG 2.2 contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Normal text requires at least 4.5:1 contrast at level AA, with different thresholds for large text. | Use dark text on bright accents and white on purple. Ratios below are calculated from our tokens, not a full accessibility certification. |

## Palette

| Token | Hex | Use | Intended text pairing / contrast |
| --- | --- | --- | --- |
| Purple | `#7B3DFF` | Wordmark, CTA, links, Ava header, footer and campaign photography | White: 5.31:1 |
| Lime | `#D5FF4F` | Icon tile, hero background, packaging, selected accents | Charcoal: 14.26:1 |
| Pink | `#FF6BC7` | Bag artwork, smiles, discount labels | Charcoal: 6.39:1 |
| Cream | `#FFF9F5` | Main reading background | Purple: 5.09:1; muted `#6B6172`: 5.62:1 |
| Charcoal | `#1F1F24` | Main reading text | Use on light surfaces |

Primary interactions use purple throughout. Accent colors organize collections;
they do not change the meaning of purchase, navigation or call controls.
Fredoka is used for the custom slanted rounded wordmark. Caveat Brush supplies
handwritten campaign headings; DM Sans and Plus Jakarta Sans handle utility and
reading text. [Fredoka's OFL license](https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/OFL.txt)
is bundled as `assets/fonts/Fredoka-OFL.txt`. The wordmark uses original vector
outlines generated from this licensed font; favicon, icon and bag artwork are
original SVG assets. `scripts/create-dopamine-assets.py` can regenerate them
with fontTools installed. Caveat Brush's license is bundled in
`assets/fonts/CaveatBrush-OFL.txt`. The supplied board itself is not shipped as
an asset. The original vector bag illustration remains an earlier exploration;
the live hero uses photographic packaging. See
[campaign assets and exact image prompts](DOPAMINE_IMAGE_PROMPTS.md).

## Layout

1. Compact announcement and sticky header with brand, search, favorites and cart.
2. Two-column hero: lime with purple brush lettering and shopping/Ava entry
   points on the left; photographic packaging on the right. Mobile keeps a
   compact side-by-side banner with accessible shopping and Ava buttons.
3. A static brand strip, followed by all seven categories as colored icon circles
   on the cream page. Mobile uses a horizontally scrollable category row. The
   category colors repeat related pink, lime and lilac tints.
4. Eight curated products in a regular four-column desktop / two-column mobile grid.
5. A compact introduction to Ava with an existing voice-call entry point.
6. A handwritten brand poster and a fashion campaign card, a demo-price promotion collection, brand editorial,
   product comparison paths and a clearly labelled newsletter preview.
7. Compact Ava overlay with microphone, optional chat and disconnect. Its canvas
   and connection lifecycle remain the existing implementation.

Product detail, search, filters, comparison, cart and checkout inherit the palette.
The former example countdown and unsupported hero social proof are absent from the
new homepage; catalog prices, ratings and stock remain explicitly demo data.

## Scope and compatibility

- Updated public storefront labels, demo catalog labels, page titles, assistant
  brand/host configuration, verified knowledge and prompt together.
- Kept product IDs, URLs, storage keys, transport topics and room/project namespace
  identifiers to preserve existing cart, favorites, comparisons and session binding.
- Existing photographs retain their source credits in the root README.
- This change is local development work; Google Cloud deployment is separate.
- The subsequent October 18 full-stack Cloud Run deployment and live browser
  checks are recorded in [the GCP runbook](GCP_DEPLOYMENT.md); the visual rebrand
  itself did not perform that deployment.
- No measured conversion improvement, account eligibility, medical benefit or new
  provider reliability is claimed by this visual rebrand.

## Verification

Current command results and browser captures are recorded locally under
`.logs/dopamine/campaign/` for this photographic refinement and
`.logs/dopamine/reference/` for the earlier avatar/prompt integration (excluded
from Git). Browser checks use intercepted session
allocation unless a live call is explicitly identified. Rebranding does not imply
that a new paid voice session or a Google Cloud deployment occurred.

- The purple-theme integration passed the production widget build, standalone
  source export, 75 Node tests, 25 Python tests and 13 offline SDK integrations.
  The later photographic refinement changes storefront layout and assets only.
- Existing shopping browser suite: 17 scenarios passed at each of 1440, 390 and
  320 pixels. The suite simulates assistant transport rather than a live model.
- Seven storefront routes passed at five widths (1440, 1024, 768, 390 and 320
  pixels), with no horizontal overflow or browser JavaScript errors.
- Isolated Brave renderer checks passed for initial render, restart after
  disconnect, cached capability failure, recovery and cancellation.
- The first full renderer run timed out while waiting for the deliberately forced
  GPU-error state. A focused rerun passed recovery and cancellation without a
  renderer-source change. Both runs are retained in the local verification logs.
- Final desktop and mobile captures show the actual rendered Ava with no voice
  provider rooms allocated. Panel heights were approximately 436 and 410 pixels;
  the launcher hid when open and all three call controls remained visible.
- Every homepage image decoded successfully for the final captures.
