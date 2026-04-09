# Development

This document covers local setup, development workflow, and contributor notes.

## Hotkey Configuration

The app resolves the window toggle shortcut in this order:

1. `ASTRA_TOGGLE_SHORTCUT`
2. `data/settings.json` or the Electron user-data `settings.json`
3. Built-in defaults

You can override the fallback list with `ASTRA_TOGGLE_FALLBACK_SHORTCUTS` as a comma-separated list, or by adding `hotkeys.fallbacks` in `data/settings.json`.

Start from [data/settings.example.json](/c:/Users/migue/OneDrive/Documents/GitHub/Astra/data/settings.example.json) if you want a local repo-level settings file.
