import { NonFatalExtensionError } from "./extension-error";
import { getNonNullable } from "./utils";

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
});
