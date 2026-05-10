import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function getMobileViewportContent() {
  const html = readProjectFile('m/index.html');
  const match = html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/);
  return match?.[1] ?? '';
}

function readProjectFile(path: string) {
  return readFileSync(path, 'utf8');
}

describe('mobile entry document', () => {
  it('disables page zoom on mobile browsers', () => {
    const viewport = getMobileViewportContent();

    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1.0');
    expect(viewport).toContain('maximum-scale=1.0');
    expect(viewport).toContain('minimum-scale=1.0');
    expect(viewport).toContain('user-scalable=no');
    expect(viewport).toContain('viewport-fit=cover');
  });

  it('lets updated mobile service workers activate without keeping a stale app shell waiting', () => {
    const config = readProjectFile('vite.config.ts');

    expect(config).toMatch(/skipWaiting:\s*true/);
    expect(config).toMatch(/clientsClaim:\s*true/);
  });

  it('does not keep registering the mobile service worker during local development', () => {
    const entry = readProjectFile('src/mobile/main.tsx');

    expect(entry).toContain('import.meta.env.PROD');
    expect(entry).toContain("type: 'SKIP_WAITING'");
    expect(entry).toContain('controllerchange');
  });

  it('coordinates service worker reloads through the mobile update guard', () => {
    const entry = readProjectFile('src/mobile/main.tsx');
    const controllerChangeHandler =
      entry.match(/addEventListener\('controllerchange'[\s\S]*?\n  \}\);/)?.[0] ?? '';

    expect(entry).toContain('requestMobileAppReload');
    expect(controllerChangeHandler).toContain('requestMobileAppReload');
    expect(controllerChangeHandler).not.toMatch(/\n\s*window\.location\.reload\(\);/);
  });
});
