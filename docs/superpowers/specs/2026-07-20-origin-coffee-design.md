# ORIGIN — practice landing page design spec

**Date:** 2026-07-20
**Status:** Approved by user ("acum fa tot")
**Scope:** One static practice page in `desing/` (separate from the AQUORA practice page and separate from the real ViviSpa site). Not linked to any real business.

## Why

Second design-training exercise. First exercise (AQUORA, water brand) used a "liquid glass" maximalist aqua aesthetic — the user found it too much ("arată oribil"). This exercise deliberately goes the opposite direction: simple, restrained, client-safe, but still with one distinctive, subject-grounded signature rather than a templated AI-cream-and-terracotta default.

## Subject

Fictional brand: **ORIGIN**, a specialty coffee roastery. Audience: people buying coffee online who care about traceability/quality but want a clean, trustworthy, non-gimmicky site. Page's single job: build enough trust and clarity in the roasting/sourcing story to make someone click through to a product.

## Design tokens

**Color** (explicit user choice, validated for WCAG contrast via ui-ux-pro-max color search):
- Background (cream): `#FAF6F0`
- Foreground/text (charcoal-brown): `#2B211B`
- Accent / CTA (terracotta): `#9A3412`
- Alternate section background (warm beige): `#F2E6E2`
- Border: `#E5DDD3`

**Type** (2 families, 3 roles):
- Display + body: **Inter** — display role uses weight 800 with tight tracking (headlines, section titles only, used with restraint); body role uses weight 400/500. One family across both roles is a deliberate choice for this brief (client wants "simplu"/trustworthy, not decorative), not a default.
- Utility/data: **IBM Plex Mono** — used only for small provenance tags (origin coordinates, altitude, roast date), styled like real specialty-coffee bag stamps. This is the subject-grounded, non-generic typographic choice.

**Layout:** single-column minimal pattern — sticky minimal nav, hero (headline + roast-line signature + CTA), 3 product cards (Light/Medium/Dark roast, each with an origin-stamp data tag), 3-step process (Sourced → Roasted → Shipped — numbered 01/02/03, justified because it's a real sequence), CTA banner, footer.

**Signature element — "The Roast Line":** a horizontal gradient bar (light tan → dark umber) that:
1. Draws itself once under the hero headline on load (the one animated "moment").
2. Reappears smaller on each product card, with a marker showing where that roast sits on the light→dark scale.
3. Appears as a tiny accent next to the logo wordmark.

It's the single memorable element; everything else on the page stays quiet.

**Motion:** micro-animations only — scroll fade-in (translateY + opacity, IntersectionObserver-based, same pattern as the existing AQUORA/ViviSpa scripts), simple hover states on cards/buttons (150–300ms), the one-time roast-line draw-in on the hero. No parallax, no particle/bubble effects, no glass/blur. `prefers-reduced-motion` respected (disable the draw-in and fades, show content statically).

**Style system:** Flat Design — no shadows, no gradients except the roast-line itself, no border-radius extremes (small/moderate radii only), fast transitions (150–300ms ease).

## Non-goals

- Not replacing or touching the real ViviSpa site.
- Not replacing the AQUORA practice page — both stay as separate comparison pieces in `desing/`.
- No backend/forms — footer CTA is a plain `mailto:` link, same pattern as AQUORA.

## Files

- `desing/origin.html`
- `desing/origin-styles.css`
- `desing/origin-script.js`

Kept as separate files (not overwriting `index.html`/`styles.css`/`script.js`) so both AQUORA and ORIGIN remain viewable side by side.
