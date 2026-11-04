# Giraffe 1on1 SA microsite

One-page, enquiry-based microsite for the Giraffe House wildlife experiences.
Static site, no build step: `index.html`, `css/styles.css`, `js/main.js`, `assets/`.

Copy and structure come from the client's "Giraffe 1on1 SA Microsite Draft".
Follow that document's wording. No public prices.

## Run it

```bash
python3 -m http.server 4183
```

Then open http://localhost:4183.

## Design system

Tokens, type, buttons, form fields and GSAP motion are copied from the main
Giraffe House site. Olive `#5F7F2F` is the action colour. Neon `#1EF60B` is a
graphic colour, never body text. No em-dashes in copy. "1on1" keeps its lower
case, so that text is typed in capitals rather than using `text-transform`.

The nav is the logo and one button, nothing else. `assets/img/logo-1on1.jpg` is the
trimmed logo; `logo-1on1-original.jpg` is the copy as supplied. A vector or transparent
PNG from the client would look sharper.

## Hero

The giraffe is built from one photo (`Site Images/DSC07753.JPG`), levelled so the rail is
straight and cut into layers: `giraffe-back` sits behind the rail, `giraffe-front` and
`giraffe-tongue` sit in front of it, and `rail.jpg` tiles across the page. `giraffe-back` is a
JPEG cut out by `giraffe-back-mask.png` to keep it small. Do not export these as AVIF from
macOS: larger images lose their transparency in the browser. The tongue tip is rounded by hand because the photo crops it. Every
size comes from `--g` in `css/styles.css`, so change that one value to resize the giraffe.

The earlier dark olive hero is in the Git history at commit `205be09`.

## Experiences layouts

The live section is the expanding panels (a carousel with arrow buttons below 900px).
The earlier 2 x 2 card layout is kept in `_saved/option-a-cards/` in case the client
prefers it; its `README.md` has the swap steps.

## Still needed before launch

| What | Where |
|---|---|
| Camel photo (Gobi, Sahara or Namib) | `index.html`: search `PHOTO NEEDED`, swap the placeholder for an `<img>` |
| Business enquiry inbox | `FORM_ENDPOINT` at the top of `js/main.js`. Until it is set the form shows a "Preview only" message and sends nothing |

## Deploy

Push to a Git repo and import into Vercel: preset Other, no build command,
output directory `.`.
