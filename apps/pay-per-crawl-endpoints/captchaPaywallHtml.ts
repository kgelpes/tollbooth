export const captchaPaywallHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Simple Captcha Gate</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:#0f172a; color:#e2e8f0; display:grid; place-items:center; min-height:100vh; margin:0; }
      .card { background:#111827; padding:24px; border-radius:16px; width:min(420px, 92vw); box-shadow:0 10px 30px rgba(0,0,0,.35); }
      h1 { margin:0 0 8px; font-size:20px; }
      p { margin:0 0 16px; color:#94a3b8; }
      .challenge { font-variant-numeric: tabular-nums; background:#0b1020; border:1px solid #1f2937; padding:12px; border-radius:12px; margin:0 0 12px; width:100%; box-sizing:border-box; }
      label { display:block; margin:8px 0 6px; font-size:14px; color:#cbd5e1; }
      input[type="text"] { width:100%; padding:12px; border-radius:10px; border:1px solid #334155; background:#0b1020; color:#e2e8f0; outline:none; box-sizing:border-box; display:block; }
      input[type="text"]::placeholder { color:#64748b; }
      .row { display:flex; gap:8px; margin-top:12px; }
      button { cursor:pointer; padding:10px 14px; border:none; border-radius:10px; background:#2563eb; color:white; font-weight:600; }
      button.secondary { background:#334155; }
      .hint { font-size:12px; color:#94a3b8; margin-top:10px; }
      .error { color:#fca5a5; min-height:1.25em; margin-top:6px; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Quick check</h1>
      <p>Prove you're human by solving this:</p>

      <div class="challenge" id="challengeText">What is …?</div>

      <form id="captchaForm" novalidate>
        <label for="answer">Your answer</label>
        <input id="answer" type="text" inputmode="numeric" autocomplete="off" placeholder="Type the result" />
        <div id="error" class="error"></div>
        <div class="row">
          <button id="submitBtn" type="submit">Verify</button>
          <button id="refreshBtn" type="button" class="secondary">New challenge</button>
        </div>
        <div class="hint">Pass → continue. Fail → redirect to <code>?captcha=fail</code>.</div>
      </form>
    </div>

    <script>
      (function() {
        function $(id) {
          var el = document.getElementById(id);
          if (!el) throw new Error('Missing element #' + id);
          return el;
        }

        function randInt(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function makeChallenge() {
          var useMultiply = Math.random() < 0.35;
          if (useMultiply) {
            var a = randInt(2, 12);
            var b = randInt(2, 12);
            return { a: a, b: b, op: '×', answer: a * b };
          } else {
            var a2 = randInt(10, 99);
            var b2 = randInt(10, 99);
            return { a: a2, b: b2, op: '+', answer: a2 + b2 };
          }
        }

        var challenge;
        var form = $('captchaForm');
        var input = $('answer');
        var challengeText = $('challengeText');
        var refreshBtn = $('refreshBtn');
        var submitBtn = $('submitBtn');

        function regenerate() {
          challenge = makeChallenge();
          var a = challenge.a, b = challenge.b, op = challenge.op;
          challengeText.textContent = 'What is ' + a + ' ' + op + ' ' + b + '?';
          input.value = '';
          setTimeout(function(){ input.focus(); }, 0);
        }

        function verify() {
          var raw = input.value.trim();
          var provided = Number(raw);
          var ok = Number.isFinite(provided) && provided === challenge.answer;

          submitBtn.disabled = true;
          var basePath = window.location.pathname;
          if (ok) {
            // On success, ask the server to set a one-time token cookie, then continue
            fetch('/api/captcha/solve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: basePath }) })
              .then(function (response) { 
                if (response.ok) {
                  window.location.href = basePath; 
                } else {
                  window.location.href = basePath + '?captcha=fail';
                }
              })
              .catch(function () { 
                window.location.href = basePath + '?captcha=fail'; 
              });
          } else {
            // On failure, show the paywall
            window.location.href = basePath + '?captcha=fail';
          }
        }

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          verify();
        });
        refreshBtn.addEventListener('click', regenerate);

        regenerate();
      })();
    </script>
  </body>
</html>`;
