import { SafeMap } from "./safe-map";

describe("safe-map", () => {
  const key = "key";
  const valueFactory = () => "new value";

  it("returns a new value for a key not in the map using the value factory", () => {
    const safeMap = new SafeMap(valueFactory);
    expect(safeMap.get(key)).toEqual(valueFactory());
  });

  it("returns the existing value for a key in the map", () => {
    const safeMap = new SafeMap(valueFactory);
    const existingValue = "existing value";
    safeMap.set(key, existingValue);
    expect(safeMap.get(key)).toEqual(existingValue);
  });
});
