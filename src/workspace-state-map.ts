import { BASE_TSCONFIG_FILE } from "./constants";
import { FileCache } from "./file-cache";

export type WorkspaceState = {
  currentTsconfigFile: string;
  baseTsconfigFileCache: FileCache;
};

export class WorkspaceStateMap {
  #workspaceStateMap: Record<string, WorkspaceState> = {};

  get(name: string) {
    const workspaceState = this.#workspaceStateMap[name] || {
      currentTsconfigFile: BASE_TSCONFIG_FILE,
      baseTsconfigFileCache: new FileCache(),
    };
    this.#workspaceStateMap[name] = workspaceState;
    return workspaceState;
  }

  [Symbol.iterator]() {
    return Object.entries(this.#workspaceStateMap).values();
  }
}
