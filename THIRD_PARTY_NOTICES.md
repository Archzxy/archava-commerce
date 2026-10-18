# Sources and third-party materials

DOPAMINE adapts the Archava template into a commerce experience. The store was
previously called KALA. The standalone `archava/` module, its authorship/history
and compatible internal identifiers are retained; this is not a claim that the
underlying avatar platform was created for this entry.

## Fonts and images

- Fonts: DM Sans, Plus Jakarta Sans, Fredoka and Caveat Brush. Keep the supplied
  OFL files in [assets/fonts](assets/fonts/) with redistributed font files.
- Initial product/editorial photographs: Unsplash; see its
  [license](https://unsplash.com/license). The download source is recorded in
  [scripts/download-assets.mjs](scripts/download-assets.mjs).
- Additional sample products and photos: [DummyJSON Products](https://dummyjson.com/docs/products).
  Source selections are recorded in `data/catalog-source.json` and
  `data/catalog-source-products.json`. Prices and product comparisons are demo
  scenarios, not manufacturer or merchant guarantees. A public sample API is not
  a blanket grant to third-party brand assets; review image rights before using
  them outside this prototype.
- Campaign photographs: generated for this project. Their reference treatment
  and prompts are recorded in [docs/DOPAMINE_IMAGE_PROMPTS.md](docs/DOPAMINE_IMAGE_PROMPTS.md).
- Local wordmarks, icons and fictional competitor illustrations: project assets.
  Supporting generation scripts and design notes are retained.

## Runtime dependencies and licensing status

LiveKit, Gemini and Spatius are external services. SDKs/dependencies retain their
own terms and notices. In particular, the installed `@spatius/avatarkit` package
declares `UNLICENSED`; do not describe the entire dependency bundle as MIT or
vendor Spatius binaries into source. Installation/build retrieves its package
through the project's pinned dependency configuration.

The repository has no selected top-level source license at this checkpoint.
Choose an appropriate license after confirming the rights to the adapted code;
this notice does not relicense that code or any third-party material.
