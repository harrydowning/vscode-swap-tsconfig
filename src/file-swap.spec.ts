import * as vscode from "vscode";
import { FileSwap } from "./file-swap";
import { WorkspaceFileSwap } from "./workspace-file-swap";
import * as utils from "./utils";
import { FileCache } from "./file-cache";

jest.mock("./workspace-file-swap");

const getWorkspaceFolderSpy = jest.spyOn(utils, "getWorkspaceFolder");

const getMockWorkspaceFolder = (name: string) => {
  return { name } as vscode.WorkspaceFolder;
};

describe("file-swap", () => {
  const mockConfig = { baseFile: "baseFile", include: [], exclude: [] };

  it("swaps file for selected workspace", async () => {
    const mockWorkspaceFolder = getMockWorkspaceFolder("f1");
    getWorkspaceFolderSpy.mockImplementationOnce(
      async () => mockWorkspaceFolder,
    );

    const fileSwap = new FileSwap(mockConfig);
    await fileSwap.swap();

    expect(WorkspaceFileSwap).toHaveBeenCalledTimes(1);
    expect(WorkspaceFileSwap).toHaveBeenCalledWith(
      mockConfig,
      mockWorkspaceFolder,
      { currentFile: mockConfig.baseFile, baseFileCache: new FileCache() },
    );
    expect(WorkspaceFileSwap.prototype.swap).toHaveBeenCalledTimes(1);
  });

  it("restores file cache for all workspaces", async () => {
    const restoreSpy = jest.spyOn(FileCache.prototype, "restore");
    getWorkspaceFolderSpy
      .mockImplementationOnce(async () => getMockWorkspaceFolder("f1"))
      .mockImplementationOnce(async () => getMockWorkspaceFolder("f2"))
      .mockImplementationOnce(async () => getMockWorkspaceFolder("f2"))
      .mockImplementationOnce(async () => getMockWorkspaceFolder("f3"));

    const fileSwap = new FileSwap(mockConfig);
    await fileSwap.swap();
    await fileSwap.swap();
    await fileSwap.swap();
    await fileSwap.swap();
    fileSwap.restore();

    expect(restoreSpy).toHaveBeenCalledTimes(3);
  });
});
