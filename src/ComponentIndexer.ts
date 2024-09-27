import * as vscode from 'vscode';
import * as path from 'path';

export interface Component {
  id: string;
  path: string;
}

let componentCache: Component[] | null = null;
const outputChannel = vscode.window.createOutputChannel('ComponentIndexer');

export async function getComponentIndex(): Promise<Component[]> {
  if (componentCache) {
    return componentCache;
  }

  const config = vscode.workspace.getConfiguration('drupalSDC');
  const componentDirs = config.get<string[]>('componentDirectories') || [];

  const components: Component[] = [];

  for (const dirPattern of componentDirs) {
    const pattern = new vscode.RelativePattern(
      vscode.workspace.workspaceFolders![0],
      path.join(dirPattern, '**/*.twig')
    );
    const files = await vscode.workspace.findFiles(pattern);

    for (const file of files) {
      const componentPath = file.fsPath;
      const componentId = getComponentId(componentPath);
      if (componentId) {
        components.push({ id: componentId, path: componentPath });
      }
    }
  }

  componentCache = components;

  // Debug output to Output window
  outputChannel.appendLine(`Components: ${JSON.stringify(components, null, 2)}`);
  outputChannel.show();

  return components;
}

export function refreshComponentIndex() {
  componentCache = null;
}

function getComponentId(componentPath: string): string | null {
  // Adjust this regex to match your project's structure
  const match = componentPath.match(/(?:\/|\\)([a-zA-Z0-9_]+)(?:\/|\\)components(?:\/|\\)(.+?)(?:\/|\\)([^\/\\]+\.twig)$/);

  if (match) {
    const moduleName = match[1];
    const componentName = match[2].replace(/\\/g, '/').replace(/^\d+-/, '');
    return `${moduleName}:${componentName}`;
  }

  return null;
}