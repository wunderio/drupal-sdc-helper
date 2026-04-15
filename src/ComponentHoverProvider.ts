import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { getComponentById, getComponentIdAtPosition, getComponentYamlData } from "./utils";

export class ComponentHoverProvider implements vscode.HoverProvider {
  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Hover | null> {
    const context = getComponentIdAtPosition(document, position);
    if (!context) {
      return null;
    }

    const component = await getComponentById(context.id);
    if (!component) {
      return null;
    }

    const uri = vscode.Uri.file(component.path);
    let componentName = "";
    let ymlStringContent = "";

    const ymlData = getComponentYamlData(component.path);

    if (ymlData) {
      componentName = ymlData.name || "";
      delete ymlData.$schema;
      ymlStringContent = yaml.dump(ymlData);
    }

    const markdownString = new vscode.MarkdownString(`[Open: ${component.id}](${uri.toString()})`);
    if (componentName) {
      markdownString.appendMarkdown(`\n\n**Name:** ${componentName}`);
    }
    if (ymlStringContent) {
      markdownString.appendMarkdown(`\n\n\`\`\`yaml\n${ymlStringContent}\n\`\`\``);
    }

    markdownString.isTrusted = true;
    return new vscode.Hover(markdownString, context.range);
  }
}
