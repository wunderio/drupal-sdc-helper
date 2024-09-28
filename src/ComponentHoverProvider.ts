// src/ComponentHoverProvider.ts
import * as vscode from 'vscode';
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
      const markdownString = new vscode.MarkdownString(`[Open ${component.id}](${uri.toString()})`);
      markdownString.isTrusted = true; // Allow the link to be clicked
      return new vscode.Hover(markdownString, wordRange);
    }

    return null;
  }
}