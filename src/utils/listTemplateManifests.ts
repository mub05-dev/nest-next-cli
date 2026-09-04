import path from 'node:path';
import fs from 'fs-extra';
import { readTemplateManifest, type TemplateManifest } from './templateManifest.js';
import { TEMPLATES_ROOT } from './templatesRoot.js';

export async function listTemplateManifests(): Promise<TemplateManifest[]> {
  const entries = await fs.readdir(TEMPLATES_ROOT, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const manifests: TemplateManifest[] = [];

  for (const dir of dirs) {
    const templateDir = path.join(TEMPLATES_ROOT, dir);
    if (await fs.pathExists(path.join(templateDir, 'template.json'))) {
      manifests.push(await readTemplateManifest(templateDir));
    }
  }

  return manifests;
}
