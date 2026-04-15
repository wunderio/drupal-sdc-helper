import * as vscode from "vscode";
import { getComponentIndex } from "./ComponentIndexer";
import { COMPONENT_ID_REGEX, getComponentById, getComponentYamlData } from "./utils";

export class ComponentPropsCompletionItemProvider implements vscode.CompletionItemProvider {
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[]> {
    let textBeforeCursor = "";
    let foundStart = false;

    for (let i = position.line; i >= Math.max(0, position.line - 20); i--) {
      const lineText =
        i === position.line
          ? document.lineAt(i).text.substring(0, position.character)
          : document.lineAt(i).text;

      textBeforeCursor = i === position.line ? lineText : lineText + "\n" + textBeforeCursor;

      if (/(?:include|embed)\b/.test(lineText)) {
        foundStart = true;
        break;
      }
    }

    if (!foundStart) {
      return [];
    }

    // Matches: include 'module:comp' with { ...
    // Matches: include('module:comp', { ...
    const contextRegex =
      /(?:include|embed)\s*(?:\(\s*)?['"](?<componentId>[A-Za-z0-9_:\/-]+)['"](?:\s*\))?(?:\s*,\s*|\s+with\s+)\{[^}]*$/;

    const match = textBeforeCursor.match(contextRegex);

    if (!match?.groups?.componentId) {
      return [];
    }

    const targetComponentId = match.groups.componentId;

    const component = await getComponentById(targetComponentId);
    if (!component?.path) {
      return [];
    }

    const yamlData = getComponentYamlData(component.path);
    const props = yamlData?.props?.properties;

    if (!props) {
      return [];
    }

    const completionItems: vscode.CompletionItem[] = [];

    for (const [propName, propSchema] of Object.entries<any>(props)) {
      const item = new vscode.CompletionItem(propName, vscode.CompletionItemKind.Property);

      item.detail = propSchema.type ? `SDC Prop (${propSchema.type})` : "SDC Prop";

      if (propSchema.description) {
        item.documentation = new vscode.MarkdownString(propSchema.description);
      }

      item.insertText = new vscode.SnippetString(`${propName}: \${1:value}`);

      if (yamlData.props.required && yamlData.props.required.includes(propName)) {
        item.detail += " [Required]";
        item.sortText = `0-${propName}`;
      } else {
        item.sortText = `1-${propName}`;
      }

      completionItems.push(item);
    }

    return completionItems;
  }
}
