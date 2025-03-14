import express, { Express } from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer, createLogger } from 'vite';
import { Server } from 'http';
import { nanoid } from 'nanoid';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a Vite logger
const viteLogger = createLogger();

/**
 * Log a message with a timestamp
 */
export function log(message: string, source = 'express'): void {
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Set up Vite middleware for development
 */
export async function setupVite(app: Express, server: Server): Promise<void> {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: 'custom',
  });

  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(__dirname, '..', 'frontend', 'index.html');

      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, 'utf-8');
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/**
 * Serve static files in production
 */
export function serveStatic(app: Express): void {
  const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the frontend first`
    );
  }

  app.use(express.static(distPath));

  // Fall through to index.html if the file doesn't exist
  app.use('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} 