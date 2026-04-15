import * as vscode from "vscode";
import { getComponentIndex } from "./ComponentIndexer";
import * as fs from "fs";
import * as yaml from "js-yaml";

export const COMPONENT_ID_REGEX = /[A-Za-z0-9_:\/-]+/;

export const getComponentIdAtPosition = (
  document: vscode.TextDocument,
  position: vscode.Position,
): { id: string; range: vscode.Range } | null => {
  const range = document.getWordRangeAtPosition(position, COMPONENT_ID_REGEX);

  if (!range) {
    return null;
  }

  const id = document.getText(range);

  if (!id.includes(":")) {
    return null;
  }

  return { id, range };
};

export async function getComponentById(id: string) {
  const components = await getComponentIndex();
  return components.find((c) => c.id === id) || null;
}

export const getComponentYamlPath = (twigPath: string): string => {
  return twigPath.replace(/\.twig$/, ".component.yml");
};

export function getComponentYamlData(twigPath: string): any | null {
  const ymlPath = getComponentYamlPath(twigPath);

  if (!fs.existsSync(ymlPath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(ymlPath, "utf8");
    return yaml.load(fileContent);
  } catch (e) {
    console.error(`Failed to parse SDC YAML at ${ymlPath}`, e);
    return null;
  }
}
