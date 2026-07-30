# DuncanCSt.github.io

Personal resume site, built with Jekyll and published via GitHub Pages at
<https://duncancst.github.io>. Pushing to `main` deploys it — GitHub Pages runs
the Jekyll build natively, with no Actions workflow.

Content lives in `_data/*.yml`, not in the HTML; each of those files documents
its own fields at the top. [index.html](index.html) renders the website and
[print.html](print.html) the PDF, both from that same data.

## Run locally

Needs Ruby 3.3.5 via rbenv

```bash
bundle install            # first time only
bundle exec jekyll serve
```

<http://localhost:4000> for the site, <http://localhost:4000/print/> for the
PDF layout.

## Regenerate the PDF

`resume.pdf` is committed to the repo and served at `/resume.pdf`. It is **not**
rebuilt on deploy, so regenerate and commit it whenever content changes.

Needs Node 22 — Puppeteer won't run on older versions.

```bash
npm install               # first time only
nvm use 22 && npm run pdf
```
