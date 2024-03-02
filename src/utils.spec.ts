import * as vscode from "vscode";
import { FatalExtensionError, NonFatalExtensionError } from "./extension-error";
import { getNonNullable, getWorkspaceFolder } from "./utils";

describe("utils", () => {
  describe("getNonNullable", () => {
    it("returns value if value is not nullable", () => {
      const value = "value";

      expect(getNonNullable(value)).toBe(value);
    });

    it("throws NonFatalExtensionError if value is nullable", () => {
      const value = null;

      expect(() => getNonNullable(value)).toThrow(NonFatalExtensionError);
    });
  });

  describe("getWorkspaceFolder", () => {
    it("throws FatalExtensionError when workspaceFolders is undefined", async () => {
      jest.replaceProperty(vscode.workspace, "workspaceFolders", undefined);

      await expect(getWorkspaceFolder()).rejects.toThrow(FatalExtensionError);
    });

    it("returns the first workspace folder when there is only one", async () => {
      const mockWorkspaceFolder = {} as vscode.WorkspaceFolder;
      jest.replaceProperty(vscode.workspace, "workspaceFolders", [
        mockWorkspaceFolder,
      ]);

      expect(await getWorkspaceFolder()).toBe(mockWorkspaceFolder);
    });

    it("returns the user's pick when there is multiple workspace folders", async () => {
      const mockWorkspaceFolderPick = {} as vscode.WorkspaceFolder;
      jest.replaceProperty(vscode.workspace, "workspaceFolders", [
        {} as vscode.WorkspaceFolder,
        mockWorkspaceFolderPick,
      ]);

      jest
        .spyOn(vscode.window, "showWorkspaceFolderPick")
        .mockImplementation(async () => mockWorkspaceFolderPick);

      expect(await getWorkspaceFolder()).toBe(mockWorkspaceFolderPick);
      expect(vscode.window.showWorkspaceFolderPick).toHaveBeenCalledTimes(1);
    });
  });
});
