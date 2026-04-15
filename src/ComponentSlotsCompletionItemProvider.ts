import * as vscode from "vscode";
import { COMPONENT_ID_REGEX, getComponentById, getComponentYamlData } from "./utils";

export class ComponentSlotsCompletionItemProvider implements vscode.CompletionItemProvider {
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    if (!linePrefix.match(/{%\s*block\s+$/)) {
      return [];
    }

    let targetComponentId: string | null = null;
    const maxLinesToScan = Math.max(0, position.line - 50);

    const embedRegex = /\{%\s*embed\s*['"](?<componentId>[A-Za-z0-9_:\/-]+)['"]/;

    for (let i = position.line; i >= maxLinesToScan; i--) {
      const lineText = document.lineAt(i).text;

      if (lineText.match(/{%\s*endembed\s*%}/) && i !== position.line) {
        break;
      }

      const embedMatch = lineText.match(embedRegex);
      if (embedMatch?.groups?.componentId) {
        targetComponentId = embedMatch.groups.componentId;
        break;
      }
    }

    if (!targetComponentId) {
      return [];
    }

    const component = await getComponentById(targetComponentId);
    if (!component?.path) {
      return [];
    }

    const yamlData = getComponentYamlData(component.path);
    const slots = yamlData?.slots;

    if (!slots) {
      return [];
    }

    const completionItems: vscode.CompletionItem[] = [];

    for (const [slotName, slotDescription] of Object.entries<any>(slots)) {
      const item = new vscode.CompletionItem(slotName, vscode.CompletionItemKind.Variable);

      item.detail = "SDC Slot";

      if (slotDescription.title) {
        item.detail += `: ${slotDescription.title}`;
      }
      if (slotDescription.description) {
        item.documentation = new vscode.MarkdownString(slotDescription.description);
      }

      item.insertText = new vscode.SnippetString(`${slotName} %}\n\t$0\n{% endblock %}`);
      item.sortText = `0-${slotName}`;

      completionItems.push(item);
    }

    return completionItems;
  }
}
