import {
  ExtensionError,
  FatalExtensionError,
  NonFatalExtensionError,
} from "./extension-error";

describe("extension-error", () => {
  describe("ExtensionError", () => {
    it("should extend Error", () => {
      expect(ExtensionError.prototype).toBeInstanceOf(Error);
    });
  });

  describe("FatalExtensionError", () => {
    it("should extend ExtensionError", () => {
      expect(new FatalExtensionError("")).toBeInstanceOf(ExtensionError);
    });

    it("correctly set error message", () => {
      const message = "error";
      const fatalExtensionError = new FatalExtensionError(message);
      expect(fatalExtensionError.message).toBe(message);
    });
  });

  describe("NonFatalExtensionError", () => {
    it("should extend ExtensionError", () => {
      expect(new NonFatalExtensionError()).toBeInstanceOf(ExtensionError);
    });

    it("correctly set error message", () => {
      const nonFatalExtensionError = new NonFatalExtensionError();
      expect(nonFatalExtensionError.message).toBe("");
    });
  });
});
