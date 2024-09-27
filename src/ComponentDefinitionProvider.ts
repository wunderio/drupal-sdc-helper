// src/ComponentDefinitionProvider.ts
import * as vscode from 'vscode';
import { getComponentIndex } from './ComponentIndexer';

export class ComponentDefinitionProvider implements vscode.DefinitionProvider {
  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Location | null> {
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
      const location = new vscode.Location(uri, new vscode.Position(0, 0));
      return location;
    }

    return null;
  }
}
