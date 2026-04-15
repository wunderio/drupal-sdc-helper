import * as vscode from "vscode";
import { getComponentById, getComponentIdAtPosition } from "./utils";

export class ComponentDefinitionProvider implements vscode.DefinitionProvider {
  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Location | null> {
    const context = getComponentIdAtPosition(document, position);
    if (!context) {
      return null;
    }

    const component = await getComponentById(context.id);
    if (!component) {
      return null;
    }

    return new vscode.Location(vscode.Uri.file(component.path), new vscode.Position(0, 0));
  }
}
