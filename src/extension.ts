import * as vscode from "vscode";
import { commandWrapper, logger } from "./utils";
import { FileSwap } from "./file-swap";

const settings = vscode.workspace.getConfiguration("swap-tsconfig");
const tsconfigFileSwap = new FileSwap({
  baseFile: "tsconfig.json",
  include: settings.include,
  exclude: settings.exclude,
});

export const activate = (context: vscode.ExtensionContext) => {
  const disposable = vscode.commands.registerCommand(
    "swap-tsconfig",
    commandWrapper(async () => tsconfigFileSwap.swap()),
  );

  context.subscriptions.push(disposable, logger);
};

export const deactivate = () => {
  tsconfigFileSwap.restore();
};
