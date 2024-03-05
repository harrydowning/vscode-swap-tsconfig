import * as vscode from "vscode";
import { FileSwap } from "./file-swap";
import { WorkspaceFileSwap } from "./workspace-file-swap";
import * as utils from "./utils";
import { FileCache } from "./file-cache";

jest.mock("./workspace-file-swap");
jest.mock("./file-cache");

const getWorkspaceFolderSpy = jest.spyOn(utils, "getWorkspaceFolder");

const getMockWorkspaceFolder = (name: string) => {
  return { name } as vscode.WorkspaceFolder;
};

describe("file-swap", () => {
  const mockConfig = { baseFile: "baseFile", include: [], exclude: [] };

  it("calls swap on a new WorkspaceFileSwap for the selected workspace", async () => {
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
      {
        currentFile: mockConfig.baseFile,
        baseFileCache: expect.any(FileCache),
      },
    );
    expect(WorkspaceFileSwap.prototype.swap).toHaveBeenCalledTimes(1);
  });

  it("restores file cache for all workspaces", async () => {
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

    expect(FileCache.prototype.restore).toHaveBeenCalledTimes(3);
  });
});
