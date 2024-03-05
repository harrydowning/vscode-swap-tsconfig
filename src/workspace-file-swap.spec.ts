import fs from "fs";
import { posix } from "path";
import * as glob from "glob";
import * as vscode from "vscode";
import { WorkspaceFileSwap, WorkspaceState } from "./workspace-file-swap";
import { FileCache } from "./file-cache";
import { FatalExtensionError, NonFatalExtensionError } from "./extension-error";

jest.mock("fs");
jest.mock("glob");
jest.mock("./file-cache");

const globSyncSpy = jest.spyOn(glob, "globSync");

const mockWorkspacePath = "/path";
const getMockWorkspacePath = (path: string) => {
  return posix.join(mockWorkspacePath, path);
};

describe("workspace-file-swap", () => {
  const mockConfig = { baseFile: "baseFile", include: [], exclude: [] };
  const mockWorkspaceFolder = {
    name: "workspace",
    uri: { fsPath: mockWorkspacePath },
  } as vscode.WorkspaceFolder;
  let mockWorkspaceState: WorkspaceState;

  const setup = (mockFiles: string[], mockSelectedFile?: string) => {
    globSyncSpy.mockImplementation(() => mockFiles.map(getMockWorkspacePath));
    jest
      .mocked(vscode.window.showQuickPick)
      .mockImplementation(async () =>
        mockSelectedFile ? { label: mockSelectedFile } : undefined,
      );

    return new WorkspaceFileSwap(
      mockConfig,
      mockWorkspaceFolder,
      mockWorkspaceState,
    );
  };

  beforeEach(() => {
    mockWorkspaceState = {
      currentFile: mockConfig.baseFile,
      baseFileCache: new FileCache(),
    };
  });

  it("correctly swaps the base file with the selected file", async () => {
    const [mockFile, mockSelectedFile] = ["file", "selectedFile"];
    const mockFiles = [mockFile, mockConfig.baseFile, mockSelectedFile];
    const mockBaseFilePath = getMockWorkspacePath(mockConfig.baseFile);
    const mockSelectedFilePath = getMockWorkspacePath(mockSelectedFile);

    const workspaceFileSwap = setup(mockFiles, mockSelectedFile);
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

  it("correctly restores the base file when selected", async () => {
    const mockFile = "file";
    const mockFiles = [mockFile, mockConfig.baseFile];
    mockWorkspaceState.currentFile = mockFile;

    const workspaceFileSwap = setup(mockFiles, mockConfig.baseFile);
    await workspaceFileSwap.swap();

    expect(glob.globSync).toHaveBeenCalledTimes(1);
    expect(glob.globSync).toHaveBeenCalledWith(mockConfig.include, {
      ignore: mockConfig.exclude,
    });

    expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
    expect(vscode.window.showQuickPick).toHaveBeenCalledWith([
      { label: mockConfig.baseFile, description: "original" },
      { label: mockFile, description: "current" },
    ]);

    expect(mockWorkspaceState.baseFileCache.restore).toHaveBeenCalledTimes(1);
    expect(mockWorkspaceState.baseFileCache.store).not.toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();

    expect(mockWorkspaceState.currentFile).toBe(mockConfig.baseFile);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      `${mockConfig.baseFile} now active in ${mockWorkspaceFolder.name}.`,
    );
  });

  it("throws a NonFatalExtensionError when no file item is selected", async () => {
    const workspaceFileSwap = setup(["file", mockConfig.baseFile]);
    await expect(workspaceFileSwap.swap()).rejects.toThrow(
      NonFatalExtensionError,
    );
  });

  it("throws a FatalExtensionError when no files are found", async () => {
    const workspaceFileSwap = setup([]);
    await expect(workspaceFileSwap.swap()).rejects.toThrow(FatalExtensionError);
  });

  it("throws a FatalExtensionError when only the base file is found", async () => {
    const workspaceFileSwap = setup([mockConfig.baseFile]);
    await expect(workspaceFileSwap.swap()).rejects.toThrow(FatalExtensionError);
  });
});
