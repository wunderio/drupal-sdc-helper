// src/extension.ts
import * as vscode from 'vscode';
import * as path from 'path';
import { ComponentCompletionItemProvider } from './ComponentCompletionItemProvider';
import { ComponentDefinitionProvider } from './ComponentDefinitionProvider';
import { refreshComponentIndex } from './ComponentIndexer';
import { ComponentHoverProvider } from './ComponentHoverProvider';

export function activate(context: vscode.ExtensionContext) {
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { language: 'twig', scheme: 'file' },
    new ComponentCompletionItemProvider(),
    ':', '\'', '"', '/', // Trigger characters
  );

  const definitionProvider = vscode.languages.registerDefinitionProvider(
    { language: 'twig', scheme: 'file' },
    new ComponentDefinitionProvider(),
  );

  const hoverProvider = vscode.languages.registerHoverProvider(
    { language: 'twig', scheme: 'file' },
    new ComponentHoverProvider(),
  );

  context.subscriptions.push(completionProvider, definitionProvider, hoverProvider);

  // Watch for changes in component files. Re-indexing is debounced so that
  // bursts of file changes (composer install, git checkout, npm builds) only
  // trigger a single re-index once things have settled. The existing index
  // stays in use until then.
  let reindexTimer: ReturnType<typeof setTimeout> | undefined;
  const cancelScheduledRefresh = () => {
    if (reindexTimer) {
      clearTimeout(reindexTimer);
      reindexTimer = undefined;
    }
  };
  const scheduleRefresh = () => {
    const delay = vscode.workspace
      .getConfiguration('drupalSDCHelper')
      .get<number>('reindexDelay', 5000);
    cancelScheduledRefresh();
    reindexTimer = setTimeout(() => {
      reindexTimer = undefined;
      refreshComponentIndex();
    }, Math.max(0, delay));
  };

  // Only watch the directories that are actually indexed. Changes elsewhere
  // (vendor/, node_modules/, contrib, ...) can never affect the index.
  let watchers: vscode.FileSystemWatcher[] = [];
  const disposeWatchers = () => {
    watchers.forEach((w) => w.dispose());
    watchers = [];
  };
  const createWatchers = () => {
    disposeWatchers();
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }
    const componentDirs = vscode.workspace
      .getConfiguration('drupalSDCHelper')
      .get<string[]>('componentDirectories') || [];
    for (const dirPattern of componentDirs) {
      const watcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceFolder, path.posix.join(dirPattern, '**/*.twig')),
      );
      watcher.onDidChange(scheduleRefresh);
      watcher.onDidCreate(scheduleRefresh);
      watcher.onDidDelete(scheduleRefresh);
      watchers.push(watcher);
    }
  };

  // Recreate the watchers and re-index right away. A pending debounced
  // refresh is canceled so it doesn't trigger a second scan.
  const rebuild = () => {
    cancelScheduledRefresh();
    createWatchers();
    if (vscode.workspace.workspaceFolders?.length) {
      refreshComponentIndex();
    }
  };

  createWatchers();

  const configListener = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('drupalSDCHelper.componentDirectories')) {
      rebuild();
    }
  });

  // The watchers are bound to the first workspace folder, so recreate them
  // if the folders change (for example when the first folder is removed).
  const foldersListener = vscode.workspace.onDidChangeWorkspaceFolders(rebuild);

  context.subscriptions.push(configListener, foldersListener, {
    dispose: () => {
      disposeWatchers();
      cancelScheduledRefresh();
    },
  });

  // Register the refresh index command
  const refreshCommand = vscode.commands.registerCommand('drupalSDCHelper.refreshIndex', () => {
    refreshComponentIndex();
    vscode.window.showInformationMessage('Drupal SDC component index refreshed.');
  });

  context.subscriptions.push(refreshCommand);
}

export function deactivate() {
  // Clean up resources if necessary
}
