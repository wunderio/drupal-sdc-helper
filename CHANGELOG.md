# Change Log

All notable changes to the "drupal-sdc-autocomplete" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.0] - 2026-04-15

### Added

- Added autocomplete for component props and slots

### Refactored

- Moved in REGEX patterns into constants for better readability
- Added named REGEX groups for more clear group selecting
- Changed deprecated instances of `substr` to `substring`
- Converted to arrow function syntax
- Moved typing into a `types` directory
- Moved common utilities into a `utils.ts` file

## [1.0.5] - 2024-10-25

### Fixed

- Fixed the autocomplete so that it would autosuggest only the components matching the already entered theme/module name prefix.
- Fixed the continues re-appearing of autocomplete modal when the match has already been found & accepted.
