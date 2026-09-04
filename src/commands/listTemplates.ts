import { Command } from 'commander';
import { listTemplateManifests } from '../utils/listTemplateManifests.js';

export function registerListTemplatesCommand(program: Command): void {
  program
    .command('list-templates')
    .description('Lista los templates disponibles')
    .action(async () => {
      const manifests = await listTemplateManifests();

      console.log('Templates disponibles:\n');
      for (const manifest of manifests) {
        console.log(`  ${manifest.name} (v${manifest.version})`);
        console.log(`    ${manifest.description}`);
      }
    });
}
