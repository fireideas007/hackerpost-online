import http from 'http';

const PROXY_PORT = 123;
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: req.headers.host || `localhost:${PROXY_PORT}`,
      'x-forwarded-host': req.headers.host || `localhost:${PROXY_PORT}`,
      'x-forwarded-port': String(PROXY_PORT),
      'x-forwarded-proto': 'http'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error connecting to Next.js on port ${TARGET_PORT}: ${err.message}`);
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[Proxy] http://localhost:${PROXY_PORT} forwarding to http://localhost:${TARGET_PORT}`);
});
