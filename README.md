<h1 style="text-align: center;">
  <img src="https://raw.githubusercontent.com/harrydowning/swap-tsconfig/main/assets/banner.png" alt="Swap Tsconfig">
</h1>

<!-- ![GitHub License](https://img.shields.io/github/license/harrydowning/swap-tsconfig)
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/harrydowning.swap-tsconfig)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/harrydowning.swap-tsconfig) -->

## Overview

The **Swap Tsconfig** extension provides the ability to swap between multiple Typescript configuration files in both single and multi-root workspaces.

![Swap Tsconfig Usage](https://raw.githubusercontent.com/harrydowning/swap-tsconfig/main/assets/usage.gif)

Running the `swap-tsconfig` command will replace the content of the current `tsconfig.json` with that of the configuration selected. This operation is safe as the original configuration is cached and will be restored on deactivation e.g., shut down, reload, uninstall etc.

## Extension Settings

| Name                    | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `swap-tsconfig.exclude` | Glob patterns used for ignoring tsconfig files |
| `swap-tsconfig.include` | Glob patterns used for finding tsconfig files  |

**Note:** Glob patterns should be specified using the POSIX path separator "**/**" (forward slash)

## Known Issues

See [Issues](https://github.com/harrydowning/swap-tsconfig/issues)

## Release Notes

See [CHANGELOG](CHANGELOG.md)
