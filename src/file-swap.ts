import { FileCache } from "./file-cache";
import { SafeMap } from "./safe-map";
import { getWorkspaceFolder } from "./utils";
import {
  FileSwapConfig,
  WorkspaceState,
  WorkspaceFileSwap,
} from "./workspace-file-swap";

type WorkspaceStateMap = SafeMap<string, WorkspaceState>;

export class FileSwap {
  #config: FileSwapConfig;
  #workspaceStateMap: WorkspaceStateMap;

  constructor(config: FileSwapConfig) {
    this.#config = config;
    this.#workspaceStateMap = new SafeMap(() => ({
      currentFile: config.baseFile,
      baseFileCache: new FileCache(),
    }));
  }

  async swap() {
    const workspaceFolder = await getWorkspaceFolder();
    const workspaceState = this.#workspaceStateMap.get(workspaceFolder.name);
    const workspaceFileSwap = new WorkspaceFileSwap(
      this.#config,
      workspaceFolder,
      workspaceState,
    );
    await workspaceFileSwap.swap();
  }

  restore() {
    for (const [, workspaceState] of this.#workspaceStateMap) {
      workspaceState.baseFileCache.restore();
    }
  }
}
