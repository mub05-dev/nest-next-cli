import path from 'node:path';
import fs from 'fs-extra';
import ejs from 'ejs';

export interface TemplateVars {
  projectName: string;
  year: number;
  author: string;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

export async function renderTemplateFiles(targetDir: string, vars: TemplateVars): Promise<void> {
  const files = await walk(targetDir);
  const ejsFiles = files.filter((file) => file.endsWith('.ejs'));

  for (const file of ejsFiles) {
    const rendered = await ejs.renderFile(file, vars);
    const outputPath = file.slice(0, -'.ejs'.length);
    await fs.writeFile(outputPath, rendered);
    await fs.remove(file);
  }
}
