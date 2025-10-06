export default function handler(req, res) {
    const { html, name, icon } = req.method === 'POST' ? req.body : req.query;

    if (!html) {
        return res.status(400).json({ error: 'No HTML provided' });
    }

    const appName = name || 'LApp';
    const appIcon = icon || '📱';

    const page = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName} installieren</title>
    <style>
        body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px;
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               min-height: 100vh; color: white; text-align: center; }
        .card { background: white; color: #333; border-radius: 20px; padding: 30px;
                max-width: 350px; margin: 50px auto; }
        .icon { font-size: 60px; margin-bottom: 20px; }
        h1 { font-size: 20px; margin-bottom: 20px; }
        .btn { display: block; width: 100%; padding: 15px; margin: 10px 0;
               background: #007AFF; color: white; border: none; border-radius: 10px;
               font-size: 16px; cursor: pointer; }
        .btn.secondary { background: #f0f0f0; color: #333; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">${appIcon}</div>
        <h1>${appName}</h1>
        <p>Installation über LibraHub:</p>

        <button class="btn" onclick="window.location.href='librahub://import'">
            🚀 LibraHub öffnen
        </button>

        <button class="btn secondary" onclick="window.location.href='https://github.com/libra-ai/librahub/releases'">
            📱 LibraHub APK Download
        </button>

        <p style="font-size: 12px; color: #666; margin-top: 20px;">
            1. LibraHub installieren<br>
            2. Import LApp antippen<br>
            3. HTML-Datei auswählen
        </p>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(page);
}