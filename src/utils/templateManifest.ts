import path from 'node:path';
import fs from 'fs-extra';
import semver from 'semver';

export interface TemplateManifest {
  name: string;
  version: string;
  cliMinVersion: string;
  description: string;
}

export class TemplateManifestError extends Error {}

export async function readTemplateManifest(templateDir: string): Promise<TemplateManifest> {
  const manifestPath = path.join(templateDir, 'template.json');

  if (!(await fs.pathExists(manifestPath))) {
    throw new TemplateManifestError(`No se encontró template.json en ${templateDir}.`);
  }

  const manifest = (await fs.readJson(manifestPath)) as TemplateManifest;

  for (const field of ['name', 'version', 'cliMinVersion', 'description'] as const) {
    if (!manifest[field]) {
      throw new TemplateManifestError(`template.json en ${templateDir} no define "${field}".`);
    }
  }

  return manifest;
}

export function assertCliCompatibility(manifest: TemplateManifest, cliVersion: string): void {
  if (!semver.gte(cliVersion, manifest.cliMinVersion)) {
    throw new TemplateManifestError(
      `El template "${manifest.name}" requiere nest-next-cli >= ${manifest.cliMinVersion}, pero estás usando la versión ${cliVersion}.`,
    );
  }
}
