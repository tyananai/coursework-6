/* Print: open a new tab containing only the resume HTML + minimal styles, then trigger print.
   This avoids printing host page chrome and any URL header showing "claude". */

const RESUME_PRINT_CSS = `
  @page { margin: 14mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; background: white;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: oklch(0.18 0.01 270);
    font-size: 12.5px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  .resume-doc {
    background: white;
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 0;
  }
  .resume-name {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 4px;
    color: oklch(0.15 0.01 270);
  }
  .resume-meta { color: oklch(0.45 0.01 270); font-size: 12px; }
  .resume-section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: oklch(0.40 0.01 270);
    margin: 26px 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid oklch(0.90 0.005 270);
  }
  .resume-summary { color: oklch(0.28 0.01 270); font-size: 12.5px; line-height: 1.65; margin: 0; }
  .resume-timeline { position: relative; padding-left: 18px; }
  .resume-timeline::before {
    content: ""; position: absolute; left: 4px; top: 6px; bottom: 6px;
    width: 1px; background: oklch(0.88 0.005 270);
  }
  .resume-tl-item { position: relative; margin-bottom: 16px; page-break-inside: avoid; }
  .resume-tl-item::before {
    content: ""; position: absolute; left: -18px; top: 6px;
    width: 9px; height: 9px; border-radius: 99px;
    background: oklch(0.55 0.21 268);
    box-shadow: 0 0 0 3px white;
  }
  .resume-tl-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .resume-tl-title { font-weight: 600; color: oklch(0.16 0.01 270); font-size: 13px; }
  .resume-tl-org { color: oklch(0.40 0.01 270); font-size: 12px; }
  .resume-tl-date { color: oklch(0.50 0.01 270); font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .resume-skills-group { margin-bottom: 14px; }
  .resume-skills-label {
    font-size: 9.5px;
    color: oklch(0.50 0.01 270);
    margin-bottom: 8px;
    font-weight: 600;
    letter-spacing: 0.10em;
    text-transform: uppercase;
  }
  .resume-skill-chip {
    display: inline-flex;
    padding: 3px 9px;
    border-radius: 999px;
    background: oklch(0.96 0.005 270);
    border: 1px solid oklch(0.90 0.005 270);
    color: oklch(0.25 0.01 270);
    font-size: 11.5px;
    font-weight: 500;
    margin: 0 4px 4px 0;
  }
  .resume-contact-row {
    display: flex; flex-wrap: wrap; gap: 12px 16px;
    color: oklch(0.40 0.01 270);
    font-size: 11.5px;
    margin-top: 10px;
  }
  .resume-contact-row a {
    color: inherit; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
  }
  header { display: flex; gap: 24px; align-items: flex-start; }
  header > img {
    width: 84px; height: 84px; border-radius: 14px;
    object-fit: cover; flex-shrink: 0;
    border: 1px solid oklch(0.88 0.005 270);
  }
`;

function printResume() {
  const docEl = document.querySelector('.resume-doc');
  if (!docEl) {
    window.print();
    return;
  }
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Resume</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>${RESUME_PRINT_CSS}</style>
</head>
<body>${docEl.outerHTML}</body>
</html>`;

  // Use a hidden iframe — keeps the action in-page, and the iframe's
  // document.title becomes the print job title (no host URL leakage).
  let frame = document.getElementById('__rk-print-frame');
  if (frame) frame.remove();
  frame = document.createElement('iframe');
  frame.id = '__rk-print-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(frame);

  frame.onload = () => {
    try {
      const w = frame.contentWindow;
      // Give fonts a moment to load
      const go = () => {
        try {
          w.focus();
          w.print();
        } catch (e) {
          window.print();
        }
      };
      if (w.document.fonts && w.document.fonts.ready) {
        w.document.fonts.ready.then(go).catch(go);
      } else {
        setTimeout(go, 300);
      }
    } catch (e) {
      window.print();
    }
  };

  frame.srcdoc = html;
}

window.printResume = printResume;
