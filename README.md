# Drupal SDC Helper

**Enhance your Drupal 10 development workflow with autocomplete and navigation support for projects using Single Directory Components (SDC) approach.**

Developed during Learning Day at [wunder.io](https://wunder.io/).

![preview](./assets/preview.gif)

## Configuration

The extension works by indexing the .twig components within components directories. Make sure to adjust the paths for the directories relative to the workspace (settings).
Index is regenrated when a component (.twig) is saved.

**Example:**

```json
"drupalSDCHelper.componentDirectories": [
  "web/themes/custom/*/components/**",
  "web/modules/custom/*/components/**"
]
```

## Features

- **Autocomplete Component IDs**: Get suggestions for component IDs while typing `include`, `embed`, or `include` statements in Twig files.
- **Go-to Definition**: Use `Ctrl + Click` to navigate directly to the component's definition file.

## Usage

- Open a Twig file in your Drupal project.
- Start typing an `include` or `embed` statements and autofill options should be presented.
- Press `Enter` to accept a suggestion.
- Hold `Ctrl` and click on a component ID to open its definition file.

## Contributing

Are you interested in improving this extension further? Feel free to contribute by creating a pull request at [Github](https://github.com/wunderio/drupal-sdc-helper).