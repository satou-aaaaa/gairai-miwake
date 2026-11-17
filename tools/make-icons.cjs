// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、緑の葉と「？」の丸（見わける）。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#123554"/>
      <path d="M50 16 C72 30 78 58 50 86 C22 58 28 30 50 16 Z" fill="#7fc28a"/>
      <path d="M50 22 V82" stroke="#123554" stroke-width="4" fill="none"/>
      <circle cx="72" cy="72" r="16" fill="#f6d77a"/><path d="M64 72 h16 M72 64 v16" stroke="#123554" stroke-width="0"/><text x="72" y="79" font-size="20" font-weight="900" text-anchor="middle" fill="#123554">?</text></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
