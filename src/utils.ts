import { posix } from "path";
import * as vscode from "vscode";
import { globSync } from "glob";
import {
  ExtensionError,
  FatalExtensionError,
  NonFatalExtensionError,
} from "./extension-error";

export const commandWrapper = (command: () => Promise<void> | void) => {
  return async () => {
    try {
      await command();
    } catch (error) {
      if (error instanceof ExtensionError) {
        vscode.window.showErrorMessage(error.message);
      } else if (error instanceof Error) {
        vscode.window.showErrorMessage("An error has occurred");
        console.error(error);
      }
    }
  };
};

export const getNonNullable = <T>(value: T) => {
  if (!value) {
    throw new NonFatalExtensionError();
  }
  return value;
};

export const getWorkspaceFolder = async () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    throw new FatalExtensionError("Open a workspace to swap tsconfig");
  } else if (workspaceFolders.length === 1) {
    return workspaceFolders[0];
  } else {
    const workspaceFolder = await vscode.window.showWorkspaceFolderPick();
    return getNonNullable(workspaceFolder);
  }
};

export const getTsconfigFiles = (path: string) => {
  const getPatternPath = (pattern: string) => posix.join(path, pattern);
  const config = vscode.workspace.getConfiguration("swap-tsconfig");
  const include = config.include.map(getPatternPath);
  const exclude = config.exclude.map(getPatternPath);

  return globSync(include, { ignore: exclude })
    .map((tsconfigFile) => posix.relative(path, tsconfigFile))
    .sort((a, b) => a.length - b.length);
};
