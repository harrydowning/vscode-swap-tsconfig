import fs from "fs";
import { posix } from "path";
import * as vscode from "vscode";
import { BASE_TSCONFIG_FILE } from "./constants";
import {
  commandWrapper,
  getWorkspaceFolder,
  getNonNullable,
  getTsconfigFiles,
} from "./utils";
import { WorkspaceStateMap } from "./workspace-state-map";

const workspaceStateMap = new WorkspaceStateMap();

const swapTsconfig = commandWrapper(async () => {
  const workspaceFolder = await getWorkspaceFolder();
  const workspacePath = workspaceFolder.uri.fsPath;
  const workspaceState = workspaceStateMap.get(workspaceFolder.name);

  const tsconfigFiles = getTsconfigFiles(workspacePath);
  const tsconfigItems = tsconfigFiles.map((tsconfigFile) => {
    const isCurrent = tsconfigFile === workspaceState.currentTsconfigFile;
    return { label: tsconfigFile, description: isCurrent ? "current" : "" };
  });

  const tsconfigItem = await vscode.window.showQuickPick(tsconfigItems);
  const { label: selectedTsconfigFile } = getNonNullable(tsconfigItem);

  const baseTsconfigPath = posix.join(workspacePath, BASE_TSCONFIG_FILE);
  const selectedTsconfigPath = posix.join(workspacePath, selectedTsconfigFile);

  if (selectedTsconfigFile === BASE_TSCONFIG_FILE) {
    workspaceState.baseTsconfigFileCache.restore();
  } else {
    if (workspaceState.currentTsconfigFile === BASE_TSCONFIG_FILE) {
      workspaceState.baseTsconfigFileCache.store(baseTsconfigPath);
    }
    fs.copyFileSync(selectedTsconfigPath, baseTsconfigPath);
  }

  workspaceState.currentTsconfigFile = selectedTsconfigFile;
  vscode.window.showInformationMessage(`${selectedTsconfigFile} now active.`);
});

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand("swap-tsconfig", swapTsconfig),
  );
};

export const deactivate = () => {
  for (const [, workspaceState] of workspaceStateMap) {
    workspaceState.baseTsconfigFileCache.restore();
  }
};
