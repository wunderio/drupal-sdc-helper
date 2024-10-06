# Drupal SDC Helper

**Enhance your Drupal 10 development workflow with autocomplete and navigation support for Single Directory Components (SDC) in Twig files.**

Developed during Guild Day @ [wunder.io](https://wunder.io/)

## Features

- **Autocomplete Component IDs**: Get suggestions for component IDs while typing `include`, `embed`, or `include` statements in Twig files.
- **Go-to Definition**: Use `Ctrl + Click` to navigate directly to the component's definition file.
- **Configurable Paths**: Customize the directories where your components are located.


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
