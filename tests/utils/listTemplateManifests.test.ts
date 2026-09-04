import { describe, expect, it } from 'vitest';
import { listTemplateManifests } from '../../src/utils/listTemplateManifests.js';

describe('listTemplateManifests', () => {
  it('devuelve los templates reales, ordenados, con name/version/description', async () => {
    const manifests = await listTemplateManifests();
    const names = manifests.map((manifest) => manifest.name);

    expect(names).toEqual(
      ['backend-nestjs-prisma', 'frontend-nextjs', 'frontend-nextjs-intl', 'monorepo-turborepo'].sort(),
    );

    for (const manifest of manifests) {
      expect(typeof manifest.name).toBe('string');
      expect(typeof manifest.version).toBe('string');
      expect(typeof manifest.description).toBe('string');
    }
  });
});
