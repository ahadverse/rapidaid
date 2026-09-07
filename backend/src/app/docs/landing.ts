export const landingPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>RapidAid API</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #f6f7f9;
    --panel: #ffffff;
    --ink: #14181f;
    --muted: #5b6472;
    --line: #e3e6ea;
    --accent: #c8102e;
    --accent-ink: #ffffff;
    --chip: #eef0f3;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0e1116;
      --panel: #161b22;
      --ink: #e7ebf0;
      --muted: #9aa4b2;
      --line: #262d36;
      --chip: #1e242c;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    background: var(--bg);
    color: var(--ink);
    font: 15px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .card {
    width: 100%;
    max-width: 660px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 40px;
  }
  .mark {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .mark span {
    width: 9px; height: 9px; border-radius: 50%;
    background: var(--accent);
  }
  h1 { margin: 14px 0 6px; font-size: 30px; letter-spacing: -.02em; }
  .tagline { margin: 0 0 26px; color: var(--muted); }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 30px; }
  .btn {
    flex: 1 1 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 14px 20px;
    border-radius: 9px;
    border: 1px solid var(--line);
    font-weight: 600;
    font-size: 15px;
    text-decoration: none;
    color: var(--ink);
    background: var(--panel);
    transition: transform .12s ease, border-color .12s ease;
  }
  .btn:hover { transform: translateY(-1px); border-color: var(--accent); }
  .btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-ink);
  }
  .btn.primary:hover { border-color: var(--accent); }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-bottom: 28px;
  }
  .stat {
    background: var(--chip);
    border-radius: 9px;
    padding: 13px 15px;
  }
  .stat b { display: block; font-size: 20px; }
  .stat small { color: var(--muted); font-size: 12.5px; }
  h2 {
    font-size: 12px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 10px;
  }
  ul { margin: 0 0 26px; padding-left: 18px; color: var(--muted); }
  li { margin-bottom: 5px; }
  code {
    background: var(--chip);
    padding: 2px 6px;
    border-radius: 5px;
    font-size: 13px;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    color: var(--ink);
  }
  footer {
    border-top: 1px solid var(--line);
    padding-top: 16px;
    color: var(--muted);
    font-size: 13px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  a.plain { color: var(--muted); }
</style>
</head>
<body>
  <main class="card">
    <div class="mark"><span></span> RapidAid</div>
    <h1>Emergency Response API</h1>
    <p class="tagline">
      Priority-based ambulance dispatch, from the emergency call through pickup and
      hospital arrival to payment.
    </p>

    <div class="actions">
      <a class="btn primary" href="/api/v1/docs">Swagger API Docs</a>
      <a class="btn" href="/api/v1/docs/postman">Download Postman Collection</a>
    </div>

    <div class="grid">
      <div class="stat"><b>46</b><small>REST endpoints</small></div>
      <div class="stat"><b>3</b><small>roles</small></div>
      <div class="stat"><b>9</b><small>data models</small></div>
    </div>

    <h2>What it does</h2>
    <ul>
      <li>Transaction-safe dispatch that cannot double-book an ambulance</li>
      <li>Priority queue from CRITICAL down to LOW, matched to ambulance type</li>
      <li>A server-enforced trip state machine that rejects illegal jumps</li>
      <li>Fare settlement and SSLCommerz checkout with server-side validation</li>
    </ul>

    <h2>Try it</h2>
    <ul>
      <li>Health check: <code>GET /api/v1/health</code></li>
      <li>Log in: <code>POST /api/v1/auth/login</code></li>
      <li>Import the collection above, then run <b>Auth &rarr; Login as Patient</b></li>
    </ul>

    <footer>
      <span>RapidAid &middot; Built by Ahad Hossain</span>
      <a class="plain" href="/api/v1/health">Health</a>
    </footer>
  </main>
</body>
</html>`;
