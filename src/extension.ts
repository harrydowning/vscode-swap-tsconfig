import * as vscode from "vscode";
import { BASE_TSCONFIG_FILE } from "./constants";
import { commandWrapper } from "./utils";
import { SafeMap } from "./safe-map";
import { FileCache } from "./file-cache";
import { FileSwap, WorkspaceState } from "./file-swap";

const tsconfigWorkspaceStateMap = new SafeMap<string, WorkspaceState>(() => ({
  currentFile: BASE_TSCONFIG_FILE,
  baseFileCache: new FileCache(),
}));

const swapTsconfig = commandWrapper(async () => {
  const { include, exclude } =
    vscode.workspace.getConfiguration("swap-tsconfig");
  const tsconfigFileSwap = new FileSwap(
    { baseFile: BASE_TSCONFIG_FILE, include, exclude },
    tsconfigWorkspaceStateMap,
  );
  tsconfigFileSwap.swap();
});

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand("swap-tsconfig", swapTsconfig),
  );
};

export const deactivate = () => {
  for (const [, workspaceState] of tsconfigWorkspaceStateMap) {
    workspaceState.baseFileCache.restore();
  }
};
