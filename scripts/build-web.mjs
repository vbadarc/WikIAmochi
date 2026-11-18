import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcAppDir = path.join(rootDir, 'resources', 'app');
const outWebDir = path.join(rootDir, 'www');

// Limpiar carpeta www/ previa
if (fs.existsSync(outWebDir)) {
    fs.rmSync(outWebDir, { recursive: true, force: true });
}
fs.mkdirSync(outWebDir, { recursive: true });

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

// 1. Copiar archivos raíz web estrictamente necesarios (EXCLUYENDO main.js, preload.js, bin/, voice_cache/, node_modules/)
const allowedFiles = ['index.html', 'icon.svg', 'icon.png'];
for (const file of allowedFiles) {
    const srcFile = path.join(srcAppDir, file);
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(outWebDir, file));
    }
}

// 2. Copiar código fuente modular web (src/)
copyRecursive(path.join(srcAppDir, 'src'), path.join(outWebDir, 'src'));

// 3. Copiar únicamente los artefactos WebAssembly de libzim (EXCLUYENDO libzimNodeWorker.cjs de Node)
const libWasmDir = path.join(srcAppDir, 'lib', 'www', 'js');
if (fs.existsSync(libWasmDir)) {
    copyRecursive(libWasmDir, path.join(outWebDir, 'lib', 'www', 'js'));
    // Colocar zimWorkerBootstrap.js junto a libzim-wasm.wasm para que scriptDirectory resuelva el .wasm
    const bootstrapSrc = path.join(srcAppDir, 'src', 'platform', 'zimWorkerBootstrap.js');
    if (fs.existsSync(bootstrapSrc)) {
        fs.copyFileSync(bootstrapSrc, path.join(outWebDir, 'lib', 'www', 'js', 'zimWorkerBootstrap.js'));
    }
}

console.log('[build:web] Carpeta www/ generada limpiamente en:', path.relative(rootDir, outWebDir));
