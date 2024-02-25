import fs from "fs";

export class FileCache {
  #path?: string;
  #data?: Buffer;
  #restored = false;

  #clear() {
    this.#path = this.#data = undefined;
    this.#restored = false;
  }

  store(path: string) {
    this.#clear();
    if (fs.existsSync(path)) {
      this.#path = path;
      this.#data = fs.readFileSync(path);
    }
  }

  restore() {
    if (!this.#restored && this.#path && this.#data) {
      fs.writeFileSync(this.#path, this.#data);
      this.#restored = true;
    }
  }
}
