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

    // Ensure there's a machine_name: prefix
    const machineNameMatch = linePrefix.match(/[A-Za-z0-9_-]+:$/);
    if (!machineNameMatch) {
      return [];
    }

    const components = await getComponentIndex();
    const machineNamePrefix = machineNameMatch[0];

    // Filter components to only those that match the machine name prefix exactly
    const matchedComponents = components.filter(component => component.id.startsWith(machineNamePrefix));

    if (matchedComponents.length === 0) {
      return [];
    }

    return matchedComponents.map(component => {
      const item = new vscode.CompletionItem(
        component.id,
        vscode.CompletionItemKind.File, // Changed to File for IntelliSense-like completion
      );
      item.detail = 'Drupal SDC Component';
      item.documentation = new vscode.MarkdownString(`Path: ${component.path}`);

      // Set the insertText for the completion item, excluding the machine_name prefix if already present
      item.insertText = component.id.replace(machineNamePrefix, '');

      // Optionally, re-trigger the suggestion list after a completion is inserted
      item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
      
      return item;
    });
  }
}