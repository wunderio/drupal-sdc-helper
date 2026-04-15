// src/extension.ts
import * as vscode from "vscode";
import { ComponentCompletionItemProvider } from "./ComponentCompletionItemProvider";
import { ComponentPropsCompletionItemProvider } from "./ComponentPropsCompletionItemProvider";
import { ComponentDefinitionProvider } from "./ComponentDefinitionProvider";
import { refreshComponentIndex } from "./ComponentIndexer";
import { ComponentHoverProvider } from "./ComponentHoverProvider";
import { ComponentSlotsCompletionItemProvider } from "./ComponentSlotsCompletionItemProvider";

export function activate(context: vscode.ExtensionContext) {
  refreshComponentIndex();
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { language: "twig", scheme: "file" },
    new ComponentCompletionItemProvider(),
    ":",
    "'",
    '"',
    "/",
  );

  const propsCompletionProvider = vscode.languages.registerCompletionItemProvider(
    { language: "twig", scheme: "file" },
    new ComponentPropsCompletionItemProvider(),
    "{",
    " ",
    ",",
    "\n",
  );

  const slotsCompletionProvider = vscode.languages.registerCompletionItemProvider(
    { language: "twig", scheme: "file" },
    new ComponentSlotsCompletionItemProvider(),
    " ",
  );

  const definitionProvider = vscode.languages.registerDefinitionProvider(
    { language: "twig", scheme: "file" },
    new ComponentDefinitionProvider(),
  );

  const hoverProvider = vscode.languages.registerHoverProvider(
    { language: "twig", scheme: "file" },
    new ComponentHoverProvider(),
  );

  const watcher = vscode.workspace.createFileSystemWatcher("**/*.{twig,component.yml}");

  let debounceTimeout: NodeJS.Timeout;
  const debouncedRefresh = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      refreshComponentIndex();
    }, 500);
  };

  watcher.onDidChange(debouncedRefresh);
  watcher.onDidCreate(debouncedRefresh);
  watcher.onDidDelete(debouncedRefresh);

  const refreshCommand = vscode.commands.registerCommand("drupalSDCHelper.refreshIndex", () => {
    vscode.window.showInformationMessage("Refreshing Drupal SDC Index...");
    refreshComponentIndex();
  });

  context.subscriptions.push(
    completionProvider,
    propsCompletionProvider,
    slotsCompletionProvider,
    definitionProvider,
    hoverProvider,
    watcher,
    refreshCommand,
  );
}

export function deactivate() {
  // Clean up resources if necessary
}
