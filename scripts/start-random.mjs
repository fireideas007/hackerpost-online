import net from 'net';
import { spawn } from 'child_process';

const s = net.createServer();
s.listen(0, () => {
  const port = s.address().port;
  s.close(() => {
    console.log(`[HackerPost] Selected random port: ${port}`);
    console.log(`[HackerPost] Launching Next.js on http://localhost:${port} ...`);

    const child = spawn(
      'node',
      ['./node_modules/.bin/next', 'start', '-p', String(port), '-H', '0.0.0.0'],
      {
        stdio: 'inherit',
        env: { ...process.env, PORT: String(port) },
      }
    );

    child.on('exit', (code) => {
      console.log(`Next.js process exited with code ${code}`);
      process.exit(code ?? 0);
    });
  });
});
