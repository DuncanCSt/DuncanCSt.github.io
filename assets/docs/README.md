# Supporting documents

Drop the PDFs produced by your LaTeX builds in this directory. They are served
directly (e.g. <https://duncancst.github.io/assets/docs/chord-thesis.pdf>) and
linked from the project cards on the homepage.

## Expected filenames

These paths are referenced by `_data/projects.yml`:

| File | Project | Doc |
| --- | --- | --- |
| `chord-thesis.pdf` | Radio Recombination Line Forecasts with CHORD | Thesis |
| `chord-slides.pdf` | Radio Recombination Line Forecasts with CHORD | Slides |
| `bdl-slides.pdf` | Belief Distribution Learning | Slides |
| `hmm-report.pdf` | HMM Volatility Forecasting | Report |
| `hmm-slides.pdf` | HMM Volatility Forecasting | Slides |

A PDF that is not present here is **skipped automatically** — the card simply
renders without that button, never a broken link. Add the file and it appears
on the next build.

## Why PDFs rather than converted HTML

The PDF is a build artifact of the `.tex` source, so it can never drift from it.
A Pandoc HTML conversion would be a second copy needing re-conversion and
re-cleanup on every edit — and two of these documents are still actively
changing. The LaTeX typesetting of math, figures, and citations is also better
than anything KaTeX will reproduce.

The exception is the **Belief Distribution Learning poster**, which is being
rebuilt as a responsive HTML page at `/projects/bdl/poster/`. Poster classes
(`tikzposter`, `beamerposter`) are absolutely-positioned layouts that Pandoc
cannot meaningfully convert, and an A0 page is the worst possible PDF to read on
a phone — so that one is worth rebuilding by hand.

## Behaviour

PDF links open in the modal viewer on desktop, and in a new tab below 992px,
where mobile browsers render PDFs poorly (or not at all) inside an iframe.

## If you later want one converted to HTML

For an `article`-class report or thesis:

```bash
pandoc report.tex -o report.html --katex --toc \
    --extract-media=assets/img/projects/hmm
```

For a Beamer deck (produces a standalone reveal.js page):

```bash
pandoc slides.tex -t revealjs -s -o slides.html --katex
```

Add front matter (`layout: document`, a `permalink`, `title`, `subtitle`) and
point the entry in `_data/projects.yml` at the new page instead of the PDF. A
reveal.js deck should replace the page wholesale rather than sit inside the
`document` layout, since it takes over the whole document.

To extract figures from a PDF or TikZ source:

```bash
pdf2svg poster.pdf figure-%d.svg
dvisvgm --pdf poster.pdf
```
