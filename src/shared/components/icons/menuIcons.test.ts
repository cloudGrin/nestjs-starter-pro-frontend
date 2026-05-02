import { describe, expect, it } from 'vitest';
import { getMenuIcon } from './menuIcons';

describe('menu icons', () => {
  it('resolves backend bootstrap icon aliases', () => {
    [
      'setting',
      'user',
      'team',
      'menu',
      'safety',
      'api',
      'folder',
      'notification',
      'check-square',
      'clock-circle',
    ].forEach((iconName) => {
      expect(getMenuIcon(iconName)).not.toBeNull();
    });
  });
});
