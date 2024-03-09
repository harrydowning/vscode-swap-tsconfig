import * as vscode from "vscode";
import {
  ExtensionError,
  FatalExtensionError,
  NonFatalExtensionError,
} from "./extension-error";

export const logger = vscode.window.createOutputChannel("Swap Tsconfig", {
  log: true,
});

export const commandWrapper = (command: () => Promise<void> | void) => {
  return async () => {
    try {
      await command();
    } catch (error) {
      if (error instanceof ExtensionError) {
        vscode.window.showErrorMessage(error.message);
      } else if (error instanceof Error) {
        vscode.window.showErrorMessage("An error has occurred.");
        logger.error(error);
        logger.show();
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
    throw new FatalExtensionError("Open a workspace to swap tsconfig.");
  } else if (workspaceFolders.length === 1) {
    return workspaceFolders[0];
  } else {
    const workspaceFolder = await vscode.window.showWorkspaceFolderPick();
    return getNonNullable(workspaceFolder);
  }
};
