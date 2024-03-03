import fs from "fs";
import { posix } from "path";
import * as vscode from "vscode";
import { globSync } from "glob";
import { getNonNullable } from "./utils";
import { FatalExtensionError } from "./extension-error";
import { FileCache } from "./file-cache";

export type FileSwapConfig = {
  baseFile: string;
  include: string[];
  exclude: string[];
};

export type WorkspaceState = {
  currentFile: string;
  baseFileCache: FileCache;
};

export class WorkspaceFileSwap {
  #config: FileSwapConfig;
  #workspaceFolder: vscode.WorkspaceFolder;
  #workspaceState: WorkspaceState;

  constructor(
    config: FileSwapConfig,
    workspaceFolder: vscode.WorkspaceFolder,
    workspaceState: WorkspaceState,
  ) {
    this.#config = config;
    this.#workspaceFolder = workspaceFolder;
    this.#workspaceState = workspaceState;
  }

  #getWorkspacePath(path: string) {
    return posix.join(this.#workspaceFolder.uri.fsPath, path);
  }

  #getFiles() {
    const include = this.#config.include.map(this.#getWorkspacePath, this);
    const exclude = this.#config.exclude.map(this.#getWorkspacePath, this);
    const files = globSync(include, { ignore: exclude })
      .map((file) => posix.relative(this.#workspaceFolder.uri.fsPath, file))
      .sort((a, b) => a.length - b.length);

    if (!files.length) {
      throw new FatalExtensionError("No files found.");
    }
    return files;
  }

  #getFileItem(file: string) {
    const isCurrentFile = file === this.#workspaceState.currentFile;
    return { label: file, description: isCurrentFile ? "current" : "" };
  }

  async swap() {
    const files = this.#getFiles();
    const fileItems = files.map(this.#getFileItem, this);
    const fileItem = await vscode.window.showQuickPick(fileItems);
    const { label: selectedFile } = getNonNullable(fileItem);

    if (selectedFile === this.#config.baseFile) {
      this.#workspaceState.baseFileCache.restore();
    } else {
      const baseFilePath = this.#getWorkspacePath(this.#config.baseFile);
      const selectedFilePath = this.#getWorkspacePath(selectedFile);

      if (this.#workspaceState.currentFile === this.#config.baseFile) {
        this.#workspaceState.baseFileCache.store(baseFilePath);
      }
      fs.copyFileSync(selectedFilePath, baseFilePath);
    }

    this.#workspaceState.currentFile = selectedFile;
    vscode.window.showInformationMessage(
      `${selectedFile} now active in ${this.#workspaceFolder.name}.`,
    );
  }
}
