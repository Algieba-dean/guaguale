import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..');

const entryPoint = path.join(appRoot, 'src/mcp/worker.ts');

const buildOptions = {
  entryPoints: [entryPoint],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  minify: false,
  sourcemap: false,
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || 'sk-caf4c38fdeff46dc8b92dec16b54eb38'),
    'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL || 'https://api.deepseek.com'),
    'process.env.MODEL': JSON.stringify(process.env.MODEL || 'deepseek-chat'),
    'process.env': '{}'
  }
};

async function build() {
  console.log('[Worker Builder] Compiling cloud MCP worker...');

  // 1. 编译为 Cloudflare Pages _worker.js
  const distDir = path.join(appRoot, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const workerResult = await esbuild.build({
    ...buildOptions,
    outfile: path.join(distDir, '_worker.js')
  });

  // 2. 复制为仓库根目录 worker.js (用于直接部署 Cloudflare Worker)
  fs.copyFileSync(path.join(distDir, '_worker.js'), path.join(repoRoot, 'worker.js'));

  // 3. 同时打包为 Cloudflare Pages Functions 模式的纯 JS 入口:
  // functions/mcp.js 包装 fetch export
  const functionsCode = `
import worker from './_mcp_core.js';

export const onRequest = async (context) => {
  return worker.fetch(context.request, context.env, context);
};
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, mcp-version',
      'Access-Control-Max-Age': '86400',
    }
  });
};
`;

  // 部署到 divination-app/functions/ 和 repoRoot/functions/
  const funcsDirs = [
    path.join(appRoot, 'functions'),
    path.join(repoRoot, 'functions')
  ];

  for (const dir of funcsDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // 拷贝核心 bundle
    fs.copyFileSync(path.join(distDir, '_worker.js'), path.join(dir, '_mcp_core.js'));
    fs.writeFileSync(path.join(dir, 'mcp.js'), functionsCode, 'utf8');
  }

  console.log('[Worker Builder] Successfully generated:');
  console.log(' - divination-app/dist/_worker.js (Cloudflare Pages Advanced Mode)');
  console.log(' - worker.js (Standalone Cloudflare Worker)');
  console.log(' - divination-app/functions/mcp.js & functions/mcp.js (Pages Functions Fallback)');
}

build().catch(err => {
  console.error('[Worker Builder Error]:', err);
  process.exit(1);
});
