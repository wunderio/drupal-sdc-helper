# Drupal SDC Helper

**Enhance your Drupal 10 development workflow with autocomplete and navigation support for Single Directory Components in Twig files.**

## Features

- **Autocomplete Component IDs**: Get suggestions for component IDs while typing `include`, `embed`, or `include` statements in Twig files.
- **Go-to Definition**: Use `Ctrl + Click` to navigate directly to the component's definition file.
- **Configurable Paths**: Customize the directories where your components are located.

## Installation

1. **From VSIX File:**
   - Download the latest `.vsix` file from the releases.
   - In VSCode, go to the Extensions view (`Ctrl+Shift+X`).
   - Click on the ellipsis (`...`) and select **Install from VSIX...**.
   - Navigate to the downloaded file and install.

2. **From Marketplace:**
   - (If you plan to publish it) Search for "Drupal SDC Extension" in the VSCode Marketplace and install.

## Usage

- Open a Twig file in your Drupal project.
- Start typing an `include` or `embed` statement.
- Autocomplete suggestions for component IDs will appear.
- Press `Enter` to accept a suggestion.
- Hold `Ctrl` and click on a component ID to open its definition file.

## Configuration

**Settings:**

- `drupalSDC.componentDirectories`: An array of glob patterns pointing to your component directories relative to the workspace.

**Example:**

```json
"drupalSDC.componentDirectories": [
  "web/themes/custom/*/components/**",
  "web/modules/custom/*/components/**"
]
