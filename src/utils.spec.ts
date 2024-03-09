import * as vscode from "vscode";
import { FatalExtensionError, NonFatalExtensionError } from "./extension-error";
import {
  commandWrapper,
  getNonNullable,
  getWorkspaceFolder,
  logger,
} from "./utils";

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
      commandWrapper(() => {
        throw error;
      })();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "An error has occurred.",
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(logger.show).toHaveBeenCalledTimes(1);
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
    const mockWorkspaceFolder = {} as vscode.WorkspaceFolder;

    it("throws FatalExtensionError when workspaceFolders is undefined", async () => {
      jest.replaceProperty(vscode.workspace, "workspaceFolders", undefined);
      await expect(getWorkspaceFolder()).rejects.toThrow(FatalExtensionError);
    });

    it("throws NonFatalExtensionError when no workspace folder is selected", async () => {
      jest.replaceProperty(vscode.workspace, "workspaceFolders", [
        {} as vscode.WorkspaceFolder,
        mockWorkspaceFolder,
      ]);

      jest
        .mocked(vscode.window.showWorkspaceFolderPick)
        .mockImplementationOnce(async () => undefined);

      await expect(getWorkspaceFolder()).rejects.toThrow(
        NonFatalExtensionError,
      );
    });

    it("returns the first workspace folder when there is only one", async () => {
      jest.replaceProperty(vscode.workspace, "workspaceFolders", [
        mockWorkspaceFolder,
      ]);

      expect(await getWorkspaceFolder()).toBe(mockWorkspaceFolder);
    });

    it("returns the user's pick when there is multiple workspace folders", async () => {
      jest.replaceProperty(vscode.workspace, "workspaceFolders", [
        {} as vscode.WorkspaceFolder,
        mockWorkspaceFolder,
      ]);

      jest
        .mocked(vscode.window.showWorkspaceFolderPick)
        .mockImplementationOnce(async () => mockWorkspaceFolder);

      expect(await getWorkspaceFolder()).toBe(mockWorkspaceFolder);
      expect(vscode.window.showWorkspaceFolderPick).toHaveBeenCalledTimes(1);
    });
  });
});
