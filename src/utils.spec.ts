import * as vscode from "vscode";
import { FatalExtensionError, NonFatalExtensionError } from "./extension-error";
import { commandWrapper, getNonNullable, getWorkspaceFolder } from "./utils";

describe("utils", () => {
  describe("commandWrapper", () => {
    it("should show error message on FatalExtensionError", () => {
      const message = "error";
      commandWrapper(() => {
        throw new FatalExtensionError(message);
      })();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(message);
    });

    it("should not show error message on NonFatalExtensionError", () => {
      commandWrapper(() => {
        throw new NonFatalExtensionError();
      })();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("");
    });

    it("should show a generic error message and log to console on any other Error", () => {
      const error = new Error();
      const consoleErrorSpy = jest.spyOn(console, "error");
      commandWrapper(() => {
        throw error;
      })();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "An error has occurred.",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

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
      const mockWorkspaceFolder = {} as vscode.WorkspaceFolder;
      jest.replaceProperty(vscode.workspace, "workspaceFolders", [
        {} as vscode.WorkspaceFolder,
        mockWorkspaceFolder,
      ]);

      jest
        .mocked(vscode.window.showWorkspaceFolderPick)
        .mockImplementation(async () => mockWorkspaceFolder);

      expect(await getWorkspaceFolder()).toBe(mockWorkspaceFolder);
      expect(vscode.window.showWorkspaceFolderPick).toHaveBeenCalledTimes(1);
    });
  });
});
