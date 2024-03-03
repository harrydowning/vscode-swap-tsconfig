import * as vscode from "vscode";
import { activate, deactivate } from "./extension";
import { FileSwap } from "./file-swap";

jest.mock("./file-swap");

const swapSpy = jest.spyOn(FileSwap.prototype, "swap");
const restoreSpy = jest.spyOn(FileSwap.prototype, "restore");

describe("extension", () => {
  const mockContext = {
    subscriptions: [],
  } as unknown as vscode.ExtensionContext;
  const mockDisposable = {} as vscode.Disposable;

  describe("activate", () => {
    it("should register the swap-tsconfig command", () => {
      jest
        .mocked(vscode.commands.registerCommand)
        .mockImplementationOnce(() => mockDisposable);
      activate(mockContext);

      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(1);
      expect(mockContext.subscriptions).toContain(mockDisposable);

      const registeredCommand = jest.mocked(vscode.commands.registerCommand)
        .mock.calls[0][1];

      registeredCommand();
      expect(swapSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("deactivate", () => {
    it("should restore the file swap", () => {
      deactivate();
      expect(restoreSpy).toHaveBeenCalledTimes(1);
    });
  });
});
