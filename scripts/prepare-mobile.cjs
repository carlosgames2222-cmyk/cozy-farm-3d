const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'fazenda.html.html');
const pwaRoot = path.join(root, 'pwa');
const webRoot = path.join(root, 'www');
const vendorRoot = path.join(webRoot, 'vendor');
const threeSource = path.join(root, 'node_modules', 'three', 'build', 'three.min.js');
const updaterSource = path.join(root, 'node_modules', '@capgo', 'capacitor-updater', 'dist', 'esm', 'index.js');
const threeTag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
const pwaBuild = process.argv.includes('--pwa');

for (const requiredPath of [source, pwaRoot]) {
    if (!fs.existsSync(requiredPath)) {
        throw new Error(`Required game/PWA source was not found: ${requiredPath}`);
    }
}
for (const dependency of pwaBuild ? [threeSource] : [threeSource, updaterSource]) {
    if (!fs.existsSync(dependency)) {
        throw new Error(`Mobile dependency is missing; run npm install first: ${dependency}`);
    }
}

fs.mkdirSync(vendorRoot, { recursive: true });
if (!pwaBuild) {
    require('esbuild').buildSync({
        entryPoints: [updaterSource],
        bundle: true,
        platform: 'browser',
        format: 'iife',
        globalName: 'CapgoUpdaterModule',
        target: 'es2020',
        outfile: path.join(vendorRoot, 'capacitor-updater.js')
    });
}

const html = fs.readFileSync(source, 'utf8');
if (!html.includes(threeTag)) {
    throw new Error('Expected Three.js CDN script tag was not found in the game HTML.');
}

const localScripts = pwaBuild
    ? '<script src="./vendor/three.min.js"></script>'
    : [
        '<script src="./vendor/three.min.js"></script>',
        '<script src="./vendor/capacitor-updater.js"></script>'
    ].join('\n    ');
fs.writeFileSync(path.join(webRoot, 'index.html'), html.replace(threeTag, localScripts));
fs.copyFileSync(threeSource, path.join(vendorRoot, 'three.min.js'));
fs.cpSync(pwaRoot, webRoot, { recursive: true });
console.log(pwaBuild
    ? 'PWA assets are ready in www/.'
    : 'Mobile web assets and Capgo updater are ready in www/.');
