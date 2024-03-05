import fs from "fs";
import { FileCache } from "./file-cache";

jest.mock("fs");

const existsSyncSpy = jest.spyOn(fs, "existsSync");
const readFileSyncSpy = jest.spyOn(fs, "readFileSync");
const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");

describe("file-cache", () => {
  const mockPath = "/path";
  const mockData = Buffer.from("data");

  it("correctly stores and restores a file that does exist", () => {
    existsSyncSpy.mockImplementationOnce(() => true);
    readFileSyncSpy.mockImplementationOnce(() => mockData);

    const fileCache = new FileCache();
    fileCache.store(mockPath);

    expect(writeFileSyncSpy).not.toHaveBeenCalled();
    expect(existsSyncSpy).toHaveBeenCalledTimes(1);
    expect(existsSyncSpy).toHaveBeenCalledWith(mockPath);
    expect(readFileSyncSpy).toHaveBeenCalledTimes(1);
    expect(readFileSyncSpy).toHaveBeenCalledWith(mockPath);

    fileCache.restore();

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
    expect(writeFileSyncSpy).toHaveBeenCalledWith(mockPath, mockData);

    fileCache.restore();

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
  });

  it("correctly stores and restores a file that doesn't exist", () => {
    existsSyncSpy.mockImplementationOnce(() => false);

    const fileCache = new FileCache();
    fileCache.store(mockPath);

    expect(existsSyncSpy).toHaveBeenCalledTimes(1);
    expect(existsSyncSpy).toHaveBeenCalledWith(mockPath);
    expect(readFileSyncSpy).not.toHaveBeenCalled();

    fileCache.restore();

    expect(writeFileSyncSpy).not.toHaveBeenCalled();
  });

  it("correctly restores cached file when storing another file", () => {
    existsSyncSpy.mockImplementationOnce(() => true);
    readFileSyncSpy.mockImplementationOnce(() => mockData);

    const fileCache = new FileCache();
    fileCache.store(mockPath);

    expect(writeFileSyncSpy).not.toHaveBeenCalled();
    expect(existsSyncSpy).toHaveBeenCalledTimes(1);
    expect(existsSyncSpy).toHaveBeenCalledWith(mockPath);
    expect(readFileSyncSpy).toHaveBeenCalledTimes(1);
    expect(readFileSyncSpy).toHaveBeenCalledWith(mockPath);

    const mockNewPath = "/new/path";
    const mockNewData = Buffer.from("new data");
    existsSyncSpy.mockImplementationOnce(() => true);
    readFileSyncSpy.mockImplementationOnce(() => mockNewData);

    fileCache.store(mockNewPath);

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
    expect(writeFileSyncSpy).toHaveBeenCalledWith(mockPath, mockData);
    expect(existsSyncSpy).toHaveBeenCalledTimes(2);
    expect(existsSyncSpy).toHaveBeenNthCalledWith(2, mockNewPath);
    expect(readFileSyncSpy).toHaveBeenCalledTimes(2);
    expect(readFileSyncSpy).toHaveBeenNthCalledWith(2, mockNewPath);

    fileCache.restore();

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(2);
    expect(writeFileSyncSpy).toHaveBeenNthCalledWith(
      2,
      mockNewPath,
      mockNewData,
    );

    fileCache.restore();

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(2);
  });
});
