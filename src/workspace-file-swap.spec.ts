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
const getWorkspaceFiles = (files: string[]) => {
  return files.map((file) => posix.join(mockWorkspacePath, file));
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

  // it("correctly swaps the base file with the selected file", async () => {
  //   const selectedFile = "selectedFile";
  //   globSyncSpy.mockImplementationOnce(() =>
  //     getWorkspaceFiles(["file", "baseFile", selectedFile]),
  //   );
  //   jest
  //     .mocked(vscode.window.showQuickPick)
  //     .mockImplementationOnce(async () => ({ label: selectedFile }));

  //   const workspaceFileSwap = new WorkspaceFileSwap(
  //     mockConfig,
  //     mockWorkspaceFolder,
  //     mockWorkspaceState,
  //   );
  //   await workspaceFileSwap.swap();

  //   expect(glob.globSync).toHaveBeenCalledTimes(1);
  //   expect(glob.globSync).toHaveBeenCalledWith(mockConfig.include, {
  //     ignore: mockConfig.exclude,
  //   });

  //   expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
  //   expect(vscode.window.showQuickPick).toHaveBeenCalledWith();
  // });

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
      getWorkspaceFiles([mockConfig.baseFile]),
    );
    const workspaceFileSwap = new WorkspaceFileSwap(
      mockConfig,
      mockWorkspaceFolder,
      mockWorkspaceState,
    );

    await expect(workspaceFileSwap.swap()).rejects.toThrow(FatalExtensionError);
  });
});
