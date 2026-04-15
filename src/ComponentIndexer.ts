import * as vscode from "vscode";
import * as path from "path";
import { Component } from "./types/component";

let componentCache: Component[] | null = null;
const outputChannel = vscode.window.createOutputChannel("Drupal SDC");

export const getComponentIndex = async (): Promise<Component[]> => {
  if (componentCache) {
    return componentCache;
  }

  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    return [];
  }

  const config = vscode.workspace.getConfiguration("drupalSDCHelper");
  const componentDirs = config.get<string[]>("componentDirectories") || [];

  const components: Component[] = [];

  outputChannel.appendLine(`Directories: ${JSON.stringify(componentDirs, null, 2)}`);

  for (const dirPattern of componentDirs) {
    const pattern = new vscode.RelativePattern(
      vscode.workspace.workspaceFolders![0],
      path.join(dirPattern, "**/*.twig"),
    );
    const files = await vscode.workspace.findFiles(pattern);

    for (const file of files) {
      const componentPath = file.fsPath;

      // Exclude *.stories.twig files
      if (componentPath.endsWith(".stories.twig")) {
        continue;
      }

      const componentId = getComponentId(componentPath);
      if (componentId) {
        components.push({ id: componentId, path: componentPath });
      }
    }
  }

  componentCache = components;

  // Debug output to Output window
  outputChannel.appendLine(`Components: ${JSON.stringify(components, null, 2)}`);
  // If no components were found, show a message in the Output window
  if (components.length === 0) {
    outputChannel.appendLine("No components found in the project");
  }
  // outputChannel.show();

  return components;
};

export const refreshComponentIndex = () => {
  outputChannel.appendLine("Refreshing component index...");
  componentCache = null;
  getComponentIndex().then((components) => {
    outputChannel.appendLine(`Component index refreshed with ${components.length} components.`);
  });
};

const getComponentId = (componentPath: string): string | null => {
  /**
   * Matches: /<module_name>/components/.../<component_name>.twig
   * Captures named groups for moduleName and componentName
   */
  const COMPONENT_PATH_REGEX =
    /(?:[/\\])(?<moduleName>[a-zA-Z0-9_]+)(?:[/\\])components(?:[/\\])(?:.+?)(?:[/\\])(?<componentName>[^/\\]+)\.twig$/;

  const match = componentPath.match(COMPONENT_PATH_REGEX);

  if (!match || !match.groups) {
    return null;
  }

  const { moduleName, componentName: rawComponentName } = match.groups;

  // Remove any digits from the raw component name
  const componentName = rawComponentName.replace(/^\d+-/, "");
  return `${moduleName}:${componentName}`;
};
