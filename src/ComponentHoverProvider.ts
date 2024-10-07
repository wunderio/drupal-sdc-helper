import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { getComponentIndex } from './ComponentIndexer';

export class ComponentHoverProvider implements vscode.HoverProvider {
  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Hover | null> {
    const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z0-9_:\/-]+/);
    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);

    // Check if the word is a component ID
    if (!word.includes(':')) {
      return null;
    }

    const components = await getComponentIndex();
    const component = components.find(c => c.id === word);

    if (component) {
      const uri = vscode.Uri.file(component.path);
      const ymlPath = component.path.replace(/\.twig$/, '.component.yml');
      let componentName = '';
      let ymlContent = '';

      // Read the .component.yml
      if (fs.existsSync(ymlPath)) {
        ymlContent = fs.readFileSync(ymlPath, 'utf8');
        const ymlData = yaml.load(ymlContent) as { name?: string; $schema?: string };

        componentName = ymlData.name || '';

        // Remove the $schema property for better readability
        delete ymlData.$schema;

        // Convert the YAML data back to a string
        ymlContent = yaml.dump(ymlData);
      }

      const markdownString = new vscode.MarkdownString(`[Open: ${component.id}](${uri.toString()})`);
      if (componentName) {
        markdownString.appendMarkdown(`\n\n**Name:** ${componentName}`);
      }
      if (ymlContent) {
        markdownString.appendMarkdown(`\n\n\`\`\`yaml\n${ymlContent}\n\`\`\``);
      }

      markdownString.isTrusted = true; // Allow the link to be clicked
      return new vscode.Hover(markdownString, wordRange);
    }

    return null;
  }
}