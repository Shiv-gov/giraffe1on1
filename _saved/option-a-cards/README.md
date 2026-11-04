# Option A: photo cards

The 2 x 2 card layout for "Choose your wildlife adventure", saved in case the client
prefers it. The copy matches the live panels and it uses the same images.

To switch back:

1. In `index.html`, replace the whole `<section class="trail" id="experiences">` with
   the contents of `section.html`.
2. Paste `cards.css` into `css/styles.css`, above the "Packages and durations" block.
3. In `js/main.js`, take out the "Experience panels" and "Carousel arrows" blocks. They
   expect the panels to exist and would stop the rest of the script otherwise.
4. Bump the `?v=` numbers on the CSS and JS links in `index.html`.
