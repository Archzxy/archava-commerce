# DOPAMINE — alternate palette research

The user subsequently supplied a purple/lime/pink brand board. That board is the
current selected direction, implemented in the storefront and documented in
[DOPAMINE_DESIGN.md](DOPAMINE_DESIGN.md). The alternatives below remain a record
of the earlier exploration, not the current recommendation.

The user found the first cobalt/lemon implementation uncomfortable and requested
new research. These are proposals for review; they do not replace the storefront
theme. An interactive comparison is available at
`/assets/dopamine-palettes.html` on the local storefront server.

## Findings

- [YesColours](https://studio.yescolours.com/blogs/news/how-to-dopamine-decor)
  offers several dopamine-decor combinations, including pink/olive/yellow and
  lilac/yellow/blue, and discusses balancing bold and lighter colours. This is
  first-party design guidance for interiors, not evidence of commerce conversion
  or a guaranteed neurological response.
- [Lekker Home](https://lekkerhome.com/the-dopamine-decor-edit/) presents both a
  pistachio/rose direction and orange anchored by purple. Its range supports
  exploring different intensities rather than treating one palette as mandatory.
- [Dopamine Decor](https://dopaminedecor.com/pages/find-your-colours) groups
  colours by undertone/intensity, with both vivid spring/winter and muted summer
  options. This is the retailer's styling approach, not a universal colour law.
- [Furniture And Choice's own press release](https://assets.ctfassets.net/x715brg11yrw/3GGWRaKIeQOWK19yLptj33/46fe6e58090c3eb088cd56ee85de504c/FC-dopamine_decor_colours_of_happiness-01082024.pdf)
  describes personal preference and neutral surfaces with colourful accents.

The references are inspiration for visual relationships. The exact names and
hex values below are original screen-design proposals, not official paint codes.
Applying the references to a shopping interface is a design judgment.

## Three alternatives

| Proposal | Base | Identity / CTA | Hero | Secondary | Accent |
| --- | --- | --- | --- | --- | --- |
| Peach & Plum | Cream `#FFF8F2` | Plum `#61314D` | Peach `#FFD1B5` | Pistachio `#D7E4CB` | Rose `#EE9CAB` |
| Pistachio & Rose | Cream `#FBF9F2` | Deep green `#365345` | Pistachio `#D7E6BD` | Rose `#F2C5CF` | Honey `#E9C97D` |
| Lilac & Butter | Paper `#FCFAF7` | Grape `#5A477D` | Lilac `#E1D8EF` | Butter `#F7E8B2` | Coral `#ECAEA6` |

Peach & Plum was the initial recommendation: warm peach and cream carry the larger
surfaces, plum gives the brand a distinctive anchor, and pink/green stay as
smaller collection accents. Pistachio & Rose is a fresher alternative; Lilac &
Butter is a softer alternative. These are aesthetic judgments, not measured
preferences or conversion results.

## Suggested application

- Use the pale base around product grids and filters.
- Use one darker identity colour consistently for logo, links and primary actions.
- Keep vivid/coloured fields concentrated in hero and editorial collections.
- Reuse two related category surfaces instead of assigning seven unrelated hues.
- Carry the selected identity colour into Ava while preserving the current avatar
  lifecycle, compact panel, microphone, optional chat and disconnect behaviour.
- Keep error/disconnect states semantically distinct.

The preview holds layout and product photographs constant across alternatives.
It does not allocate provider sessions, collect customer input or perform cart
operations. Its product names/prices are illustrative and do not update the
verified catalog.

## Contrast

[WCAG 2.2 contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
sets a 4.5:1 minimum for ordinary text at AA. The preview calculates the contrast
of the actual proposed pairs, including white text on the dark CTA and dark text
on the pale hero. Those pair checks do not constitute a full accessibility audit.
