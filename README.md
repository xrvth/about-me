# Julia Ziemba :: personal site

A static portfolio site. No build step, no dependencies, no framework.

```
index.html
assets/
  css/style.css     all styling + both colour themes
  js/main.js        all behaviour (vanilla, no libraries)
  img/me.webp       the chibi ← replace this with your own drawing
  img/pattern.svg   your Ignihyde triangle lattice, from TwisteOptimizer
  files/Julia_Ziemba_CV.pdf
```

## Viewing it

Double-click `index.html`. That's it, every path is relative, so it works
straight off the filesystem.

If you'd rather serve it (needed only if you later add `fetch`-based features):

```bash
npx serve julia-ziemba-portfolio
```

## Things you'll want to change

| What | Where |
|---|---|
| The chibi | replace `assets/img/me.webp` (keep the filename, or update the `<img src>` and the `width`/`height` attributes) |
| CV PDF | replace `assets/files/Julia_Ziemba_CV.pdf` |
| Skill percentages | `index.html`, the `data-v="92"` attributes on `.meters li`, and `--v:92%` on the character-card bars |
| Colours | `assets/css/style.css`, the `:root` block (dark) and `html[data-theme="light"]` block (light) |
| Background lattice | swap `assets/img/pattern.svg`; `--pattern-strength` and `--pattern-scale` on `.bg-pattern` are the two dials |
| TwisteOptimizer repo link | once it's public, add a `.proj__repo` link to that card and drop the `.proj__soon` badge |

Every link on the page points somewhere real.

## Deploying

Any static host. Drag the folder onto [Netlify Drop](https://app.netlify.com/drop),
or:

```bash
npx vercel deploy --prod julia-ziemba-portfolio
```

For GitHub Pages: push the folder contents to a repo, then Settings → Pages →
deploy from branch root.

## Notes on how it's built

- **Themes**: dark by default. The toggle writes to `localStorage` under
  `jz-theme`. Both palettes are plain CSS custom properties; every colour pair
  clears WCAG AA (min contrast 4.58 dark / 5.07 light).
- **Reveals**: `IntersectionObserver` adds `.is-in`; skill meters and the
  hero counters animate off the same signal. Everything falls back to visible
  if JS is off or `prefers-reduced-motion` is set.
- **Contact form**: builds a `mailto:` link. No backend, nothing to host.
  If you ever want real form submission, swap the submit handler in
  `main.js` for a POST to Formspree/Basin.
- **Accessibility**: skip link, focus-visible rings, real landmarks,
  `aria-expanded` on the menu, and the whole page is keyboard-navigable.
- **Easter egg**: konami code (↑↑↓↓←→←→ b a).
