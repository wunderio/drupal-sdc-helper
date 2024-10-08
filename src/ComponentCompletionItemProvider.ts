import * as vscode from 'vscode';
import { getComponentIndex } from './ComponentIndexer';

export class ComponentCompletionItemProvider implements vscode.CompletionItemProvider {
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substr(0, position.character);

    // Check if the user is typing an include or embed statement
    if (!linePrefix.match(/({%|{{)\s*(include|embed)\s*\(?\s*[\'"]/)) {
      return [];
    }

    const components = await getComponentIndex();

    return components.map(component => {
      const item = new vscode.CompletionItem(
        component.id,
        vscode.CompletionItemKind.File, // Changed to File for IntelliSense-like completion
      );
      item.detail = 'Drupal SDC Component';
      item.documentation = new vscode.MarkdownString(`Path: ${component.path}`);

      const machineNameMatch = linePrefix.match(/[A-Za-z0-9_-]+:$/);
      let insertText = component.id;

      if (machineNameMatch) {
        const typedPrefix = machineNameMatch[0];
        if (component.id.startsWith(typedPrefix)) {
          insertText = component.id.replace(typedPrefix, ''); // Avoid re-adding the prefix
        }
      }

      // Set the insertText for the completion item
      item.insertText = insertText;

      // Optionally, re-trigger the suggestion list after a completion is inserted
      item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
      
      return item;
    });
  }
}
