// src/ComponentCompletionItemProvider.ts
import * as vscode from 'vscode';
import { getComponentIndex } from './ComponentIndexer';

export class ComponentCompletionItemProvider implements vscode.CompletionItemProvider {
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substr(0, position.character);

    // Check if the user is typing an include or embed statement
    if (!linePrefix.match(/({%|{{)\s*(include|embed)\s*['"]/)) {
      return [];
    }

    const components = await getComponentIndex();

    return components.map(component => {
      const item = new vscode.CompletionItem(
        component.id,
        vscode.CompletionItemKind.Module,
      );
      item.detail = 'Drupal SDC Component';
      item.documentation = new vscode.MarkdownString(`Path: ${component.path}`);
      return item;
    });
  }
}
