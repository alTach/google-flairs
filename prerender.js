import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destClient = path.resolve(__dirname, 'dist');
const destServer = path.resolve(__dirname, 'dist-server');

async function build() {
  // 1. Read index.html from dist
  const template = fs.readFileSync(path.resolve(destClient, 'index.html'), 'utf-8');
  
  // 2. Import the server entry
  const { render } = await import(path.resolve(destServer, 'entry-server.js'));
  
  // 3. Render app HTML
  const { html: appHtml } = render();
  
  // 4. Inject the app-rendered HTML into the template.
  const html = template.replace('<!--app-html-->', appHtml);
  
  // 5. Save the prerendered HTML 
  fs.writeFileSync(path.resolve(destClient, 'index.html'), html);
  
  console.log('Successfully prerendered index.html');
  
  // Optional cleanup
  fs.rmSync(destServer, { recursive: true, force: true });
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
