Home category assets for `paramascotasec`

Responsive delivery

The frontend now uses `next/image` with responsive variants enabled from mobile up to 4K.
That means:

- small phones download smaller files
- tablets and laptops download medium files
- 2K and 4K screens can request larger variants

This only works well if the source master is large enough. If the original file is too small, Next.js cannot invent detail.

This project uses two different image blocks on the home page:

1. Top category carousel
Path:
`/public/images/collection/home-top`

Target aspect:
`4:5`

Recommended export size:
`1200x1500`

Minimum safe size:
`960x1200`

Expected file names:
- `catalogo-completo-para-mascotas-4x5.jpg`
- `ofertas-para-mascotas-4x5.jpg`
- `cuidado-para-mascotas-4x5.jpg`
- `productos-para-gatos-4x5.jpg`
- `productos-para-perros-4x5.jpg`
- `ropa-para-mascotas-4x5.jpg`

2. Secondary featured category block
Path:
`/public/images/collection/home-featured`

Recommended master aspect:
`1:1`

Recommended export size:
`2000x2000`

Minimum safe size:
`1600x1600`

Why square:
These images are cropped by the UI to square, `4:5` and `16:10` depending on layout and screen size. A square master gives the cleanest result across mobile, desktop and 4K.

Expected file names:
- `catalogo-completo-para-mascotas-square.jpg`
- `ofertas-para-mascotas-square.jpg`
- `cuidado-para-mascotas-square.jpg`
- `productos-para-gatos-square.jpg`
- `productos-para-perros-square.jpg`
- `ropa-para-mascotas-square.jpg`

Real render sizes used by the current UI

Top carousel:
- `0-639px`: up to about `128x160`
- `640-767px`: up to about `150x188`
- `768-991px`: up to about `230x288`
- `992-1199px`: up to about `222x278`
- `1200px+`: up to about `202x252`

Secondary featured block:
- mobile small cards: around `294x294`
- mobile main card: up to about `588x368`
- desktop main left card: up to about `630x630` or `496x620` depending on category count
- desktop right cards: up to about `630x295`

Replacement rule:
Keep the same file name and extension when replacing the asset. No code change is needed if you overwrite the existing file in the same path.

Current frontend responsive buckets

- phone: `360`, `420`, `576`, `640`
- tablet: `750`, `768`, `828`, `992`
- laptop: `1080`, `1200`, `1320`, `1536`
- desktop / 2K / 4K: `1920`, `2048`, `2560`, `3840`
