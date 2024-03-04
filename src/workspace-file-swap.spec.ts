import fs from "fs";
import { posix } from "path";
import * as glob from "glob";
import * as vscode from "vscode";
import { WorkspaceFileSwap, WorkspaceState } from "./workspace-file-swap";
import { FileCache } from "./file-cache";
import { FatalExtensionError } from "./extension-error";

jest.mock("fs");
jest.mock("glob");
jest.mock("./file-cache");

const globSyncSpy = jest.spyOn(glob, "globSync");

const mockWorkspacePath = "/path";
const getMockWorkspacePath = (path: string) => {
  return posix.join(mockWorkspacePath, path);
};
const getMockWorkspacePaths = (paths: string[]) => {
  return paths.map(getMockWorkspacePath);
};

describe("workspace-file-swap", () => {
  const mockConfig = { baseFile: "baseFile", include: [], exclude: [] };
  const mockWorkspaceFolder = {
    name: "workspace",
    uri: { fsPath: mockWorkspacePath },
  } as vscode.WorkspaceFolder;
  let mockWorkspaceState: WorkspaceState;

  beforeEach(() => {
    mockWorkspaceState = {
      currentFile: mockConfig.baseFile,
      baseFileCache: new FileCache(),
    };
  });

  it("correctly swaps the base file with the selected file", async () => {
    const [mockFile, mockSelectedFile] = ["file", "selectedFile"];
    const mockFiles = [mockFile, mockConfig.baseFile, mockSelectedFile];
    globSyncSpy.mockImplementationOnce(() => getMockWorkspacePaths(mockFiles));
    jest
      .mocked(vscode.window.showQuickPick)
      .mockImplementationOnce(async () => ({ label: mockSelectedFile }));

    const mockBaseFilePath = getMockWorkspacePath(mockConfig.baseFile);
    const mockSelectedFilePath = getMockWorkspacePath(mockSelectedFile);

    const workspaceFileSwap = new WorkspaceFileSwap(
      mockConfig,
      mockWorkspaceFolder,
      mockWorkspaceState,
    );
    await workspaceFileSwap.swap();

    expect(glob.globSync).toHaveBeenCalledTimes(1);
    expect(glob.globSync).toHaveBeenCalledWith(mockConfig.include, {
      ignore: mockConfig.exclude,
    });

    expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
    expect(vscode.window.showQuickPick).toHaveBeenCalledWith([
      { label: mockConfig.baseFile, description: "current" },
      { label: mockFile, description: "" },
      { label: mockSelectedFile, description: "" },
    ]);

    expect(mockWorkspaceState.baseFileCache.restore).not.toHaveBeenCalled();
    expect(mockWorkspaceState.baseFileCache.store).toHaveBeenCalledTimes(1);
    expect(mockWorkspaceState.baseFileCache.store).toHaveBeenCalledWith(
      mockBaseFilePath,
    );
    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      mockSelectedFilePath,
      mockBaseFilePath,
    );

    expect(mockWorkspaceState.currentFile).toBe(mockSelectedFile);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      `${mockSelectedFile} now active in ${mockWorkspaceFolder.name}.`,
    );
  });

  it("throws a FatalExtensionError when no files are found", async () => {
    globSyncSpy.mockImplementationOnce(() => []);
    const workspaceFileSwap = new WorkspaceFileSwap(
      mockConfig,
      mockWorkspaceFolder,
      mockWorkspaceState,
    );

    await expect(workspaceFileSwap.swap()).rejects.toThrow(FatalExtensionError);
  });

  it("throws a FatalExtensionError when only the base file is found", async () => {
    globSyncSpy.mockImplementationOnce(() =>
      getMockWorkspacePaths([mockConfig.baseFile]),
    );
    const workspaceFileSwap = new WorkspaceFileSwap(
      mockConfig,
      mockWorkspaceFolder,
      mockWorkspaceState,
    );

    await expect(workspaceFileSwap.swap()).rejects.toThrow(FatalExtensionError);
  });
});
