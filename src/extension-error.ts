export abstract class ExtensionError extends Error {}

export class FatalExtensionError extends ExtensionError {
  constructor(message: string) {
    super(message);
  }
}

export class NonFatalExtensionError extends ExtensionError {
  constructor() {
    super();
  }
}
