// src/extension.ts
import * as vscode from 'vscode';
import { ComponentCompletionItemProvider } from './ComponentCompletionItemProvider';
import { ComponentDefinitionProvider } from './ComponentDefinitionProvider';
import { refreshComponentIndex } from './ComponentIndexer';

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

  context.subscriptions.push(completionProvider, definitionProvider);

  // Watch for changes in component files
  const watcher = vscode.workspace.createFileSystemWatcher('**/*.twig');

  watcher.onDidChange(refreshComponentIndex);
  watcher.onDidCreate(refreshComponentIndex);
  watcher.onDidDelete(refreshComponentIndex);

  context.subscriptions.push(watcher);

  // Register the refresh index command
  const refreshCommand = vscode.commands.registerCommand('drupalSDC.refreshIndex', () => {
    refreshComponentIndex();
    vscode.window.showInformationMessage('Drupal SDC component index refreshed.');
  });

  context.subscriptions.push(refreshCommand);
}

export function deactivate() {
  // Clean up resources if necessary
}
