export const window = {
  showErrorMessage: jest.fn(),
  showWorkspaceFolderPick: jest.fn(),
};

export const workspace = {
  workspaceFolders: undefined,
  getConfiguration: jest.fn(() => ({
    include: [],
    exclude: [],
  })),
};

export const commands = {
  registerCommand: jest.fn(),
};
