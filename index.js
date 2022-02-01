import { Router } from 'itty-router';
import statuses from "./lib/statuses.js";
const router = Router();

// Create the root HTML. This populates the <ul> with each entry in statuses.js
const htmlList = [];
for (const status in statuses) {
  htmlList.push(`<li><a href="/${statuses[status].code}">${statuses[status].code} (${statuses[status].message})</a></li>`);
}
const rootHTML = `<!DOCTYPE html>
<head>
  <title>TrasHTTPandas - Trash Panda HTTP Responses</title>
  <meta name="title" content="TrasHTTPandas">
  <meta name="description" content="Small API for HTTP Trash Pandas.">
  <meta name="theme-color" content="#bf2042">

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://api.onlyraccoons.com/">
  <meta property="og:title" content="TrasHTTPandas">
  <meta property="og:description" content="Small API for HTTP Trash Pandas.">
  <meta property="og:image" content="https://i.imgur.com/99g7BJA.png">

  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://api.onlyraccoons.com/">
  <meta property="twitter:title" content="TrasHTTPandas">
  <meta property="twitter:description" content="Small API for HTTP Trash Pandas.">
  <meta property="twitter:image" content="https://i.imgur.com/99g7BJA.png">
</head>
<body>
    <style>
      body {
		    font-family: "Arial";
      }
    </style>
    <h1>TrasHTTPandas - Trash Panda HTTP Responses</h1>
    <h3>Made by <a href="http://twitter.com/mozzyfx">Mozzy</a> (who sometimes dislikes frontend).</h3>
    <h3>I do not own any of the raccoon images. Full credits go to the respective owners.</h3>
    <p>
      To use, click of the supported codes below, or use https://api.onlyraccoons.com/[status_code](.png)
    </p>
    <ul>
      ${htmlList.join("\n")}
    </ul>
  </body>
</html>`

// Handle response for root domain
router.get('/', () => {
  return new Response(rootHTML, { headers: { 'Content-Type': 'text/html' }, status: 200 });
});

// Create a response for each valid HTTP code in statuses.js
for (const status in statuses) {

  // Handle both /[status_code] and /[status_code].png
  router.get(`/${statuses[status].code}`, HTTPHandler);
  router.get(`/${statuses[status].code}.png`, HTTPHandler);

  async function HTTPHandler() {
    // Get the Base64 data from KV
    const data = await CODES.get(`HTTP_${statuses[status].code}`);

    // If no KV found, return
    if (!data) return new Response(`Could not find results for HTTP ${statuses[status].code} (${statuses[status].message}). This is not expected and will only show if Cloudflare fails or if I forgot an image.`, {
      headers: { 'Content-Type': 'text/plain' },
      status: 404
    });

    // Build blob from Base64 and respond
    const img = getImageBlobFromBase64(data);
    return new Response(img, {
      headers: { 'content-type': 'image/png' },
      status: 200
    });
  }
}

// 404 for everything else
router.all('*', () => new Response(rootHTML, { headers: { 'Content-Type': 'text/html' }, status: 404 }));

function getImageBlobFromBase64(data) {
  const b64String = data.split(',')[1];
  const byteString = atob(b64String);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([intArray], { type: 'image/png' });
}

addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request));
});