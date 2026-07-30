#!/usr/bin/env node
/*
 * Builds the Jekyll site, serves _site over local HTTP, renders /print/ with
 * headless Chrome (Puppeteer), and writes resume.pdf to the repo root.
 *
 * Usage:  npm run pdf
 * Requires: a working `bundle` (Ruby/Jekyll) and `npm install` already run.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const puppeteer = require("puppeteer");

const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const OUT = path.join(ROOT, "resume.pdf");
const PORT = 8099;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function buildSite() {
  console.log("• Building Jekyll site…");
  execSync("bundle exec jekyll build", { cwd: ROOT, stdio: "inherit" });
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split("?")[0]);
      let filePath = path.join(SITE, urlPath);
      // Directory -> index.html (handles /print/ -> /print/index.html)
      if (filePath.endsWith(path.sep) || !path.extname(filePath)) {
        filePath = path.join(filePath, "index.html");
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found: " + urlPath);
          return;
        }
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  buildSite();

  if (!fs.existsSync(path.join(SITE, "print", "index.html"))) {
    throw new Error("_site/print/index.html not found — did the Jekyll build succeed?");
  }

  const server = await startServer();
  console.log(`• Serving _site at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}/print/`, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");
    // Margins live here rather than in .page's padding so that every sheet
    // gets them — CSS padding applies once to the whole flow, which left
    // pages 2+ starting hard against the paper edge. print.html zeroes the
    // padding under @media print to match; on screen /print/ is unchanged.
    await page.pdf({
      path: OUT,
      format: "A4",
      printBackground: true,
      margin: { top: "0.5in", right: "0.6in", bottom: "0.5in", left: "0.6in" },
    });
    console.log(`✓ Wrote ${path.relative(ROOT, OUT)}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
