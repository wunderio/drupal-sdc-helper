import * as vscode from 'vscode';
import * as path from 'path';

export interface Component {
  id: string;
  path: string;
}

let componentCache: Component[] | null = null;
const outputChannel = vscode.window.createOutputChannel('Drupal SDC');

const HIDE_EMPTY_INDEX_HINT_KEY = 'drupalSDCHelper.hideEmptyIndexHint';
let workspaceState: vscode.Memento | undefined;
let emptyIndexHintShown = false;

export function initComponentIndexer(context: vscode.ExtensionContext) {
  workspaceState = context.workspaceState;
}

/**
 * Tells the user that no components were found, which usually means that
 * `componentDirectories` does not match the project's layout (for example a
 * docroot other than `web/`, or components inside an install profile).
 * Shown at most once per session, and never again for this workspace once
 * dismissed with "Don't Show Again".
 */
async function showEmptyIndexHint() {
  if (emptyIndexHintShown || workspaceState?.get<boolean>(HIDE_EMPTY_INDEX_HINT_KEY)) {
    return;
  }
  emptyIndexHintShown = true;

  const openSettings = 'Open Settings';
  const showOutput = 'Show Output';
  const dontShowAgain = "Don't Show Again";
  const choice = await vscode.window.showWarningMessage(
    'Drupal SDC Helper found no components. Check that "drupalSDCHelper.componentDirectories" matches where your components are.',
    openSettings,
    showOutput,
    dontShowAgain,
  );

  if (choice === openSettings) {
    vscode.commands.executeCommand('workbench.action.openSettings', 'drupalSDCHelper.componentDirectories');
  } else if (choice === showOutput) {
    outputChannel.show();
  } else if (choice === dontShowAgain) {
    await workspaceState?.update(HIDE_EMPTY_INDEX_HINT_KEY, true);
  }
}

export async function getComponentIndex(): Promise<Component[]> {
  if (componentCache) {
    return componentCache;
  }

  const config = vscode.workspace.getConfiguration('drupalSDCHelper');
  const componentDirs = config.get<string[]>('componentDirectories') || [];
  const excludePatterns = config.get<string[]>('excludePatterns') || [];
  // findFiles takes a single exclude glob, so combine them with {a,b}.
  const exclude = excludePatterns.length > 1
    ? `{${excludePatterns.join(',')}}`
    : excludePatterns[0];

  const components: Component[] = [];

  outputChannel.appendLine(`Directories: ${JSON.stringify(componentDirs, null, 2)}`);
  outputChannel.appendLine(`Excluded: ${JSON.stringify(excludePatterns, null, 2)}`);

  for (const dirPattern of componentDirs) {
    const pattern = new vscode.RelativePattern(
      vscode.workspace.workspaceFolders![0],
      path.join(dirPattern, '**/*.twig')
    );
    const files = await vscode.workspace.findFiles(pattern, exclude);

    for (const file of files) {
      const componentPath = file.fsPath;

      // Exclude *.stories.twig files
      if (componentPath.endsWith('.stories.twig')) {
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
    outputChannel.appendLine('No components found in the project');
    showEmptyIndexHint();
  }
  // outputChannel.show();

  return components;
}

export function refreshComponentIndex() {
  outputChannel.appendLine('Refreshing component index...');
  componentCache = null;
  getComponentIndex().then(components => {
    outputChannel.appendLine(`Component index refreshed with ${components.length} components.`);
  });
}

function getComponentId(componentPath: string): string | null {
  // Adjust this regex to match your project's structure
  const match = componentPath.match(/(?:\/|\\)([a-zA-Z0-9_]+)(?:\/|\\)components(?:\/|\\)(.+?)(?:\/|\\)([^\/\\]+)\.twig$/);

  if (match) {
    const moduleName = match[1];
    const componentName = match[3].replace(/\\/g, '/').replace(/^\d+-/, '').replace(/\.twig$/, '');
    return `${moduleName}:${componentName}`;
  }

  return null;
}