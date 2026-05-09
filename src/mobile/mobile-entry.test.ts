import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function getMobileViewportContent() {
  const html = readFileSync('m/index.html', 'utf8');
  const match = html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/);
  return match?.[1] ?? '';
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
});
