# DOPAMINE campaign photographs

Generated with the built-in imagegen tool. Reference inputs were the user's
supplied moodboard and the current project wordmark. The model is a newly
generated adult, not a customer or an endorsement. These are brand campaign
visuals; packaging does not establish a real shipping service.

Delivered files:

- `assets/dopamine-campaign-v2.webp` — editorial fashion campaign, portrait.
- `assets/dopamine-packaging-v2.webp` — paper packaging still life.

Original PNGs remain in the image tool's generated-images directory and were
copied to ignored `.logs/dopamine/campaign/`. WebP delivery copies were encoded
with ImageMagick at quality 86, without retouching or compositing.

The supplied board is a style reference. Its surrounding messaging interface
and contact photos are excluded from the output.

## Campaign prompt

```text
Use case: ads-marketing. Create ONE new photorealistic editorial campaign photograph for the DOPAMINE shopping website, portrait 4:5 framing.
Input Image 1 is ONLY a mood and brand reference: use the central dopamine moodboard's fashion photograph, purple/lime/pink palette, playful styling and photographic material quality. Ignore all surrounding WhatsApp interface, contact portrait, browser controls and other thumbnails. Do not reproduce any real person's identity.
Input Image 2 is the exact current lowercase dopamine wordmark reference. Print this recognizably on the shopping bag, preserving the bouncy bold italic lowercase lettering, lime smile and small star.
Subject: one newly generated adult Indonesian woman aged about 25, natural skin texture, brown hair in a casual high bun, oversized bubblegum pink hoodie, small pink tinted fashion sunglasses, playful confident smile. She holds a large real matte purple paper shopping bag with twisted paper handles at torso level. Hands naturally grip handles; face and bag logo clearly visible.
Set: saturated purple studio backdrop around #7B3DFF, gently warmer magenta light at one edge, direct editorial flash and soft fill, real fabric folds, paper creases and contact shadows. Commercial fashion photography, tactile and candid, not a vector illustration or 3D render.
Composition: frame from just above head to hips, subject and bag centered, enough breathing room around face and bag for responsive website crops; bag logo faces camera. Only brand wordmark on bag. No headline, captions, UI, watermarks, frame, collage, sale percentages, extra people or unrelated brand logos. Use pink #FF6BC7, lime #D5FF4F and cream #FFF9F5 as accents.
```

## Packaging prompt

```text
Use case: product-mockup. Create ONE new photorealistic DOPAMINE packaging campaign still life, landscape 4:3 framing.
Input Image 1 is ONLY visual mood reference: the central brand board's lower-right photography of shopping bags and a box, not the browser or WhatsApp interface. Input Image 2 is the exact lowercase dopamine wordmark to print on packaging.
Scene: a large lime yellow-green matte paper shopping bag standing at the back right, a rich purple matte paper shopping bag at the front left, and a bubblegum pink rectangular shipping/gift box at the front right, on a warm cream studio surface and cream background. Twisted paper handles with real bends and shadows. A small smile and four-point star on the lime bag, white dopamine wordmark on the purple bag, purple dopamine wordmark on the pink box. Preserve Image 2's recognizable bouncy bold italic lowercase letters, smile underline and small star.
Art direction: fashion retail brand photography, tactile paper fibres, realistic packaging folds, warm directional daylight, beautiful soft grounded shadows. Eye-level three-quarter view. Purple #7B3DFF, lime #D5FF4F, pink #FF6BC7, cream #FFF9F5. Compact cohesive arrangement with all bags and box fully framed and a little breathing room. Photographic, not vector and not plasticky CGI.
No people, no UI, no headlines, no coupons, no invented retail claims, no watermarks, no extra products, no other brands. Exact visible brand text only: dopamine.
```
