# Acode Icon Pack Plugin Example

A complete Acode plugin that registers a file and folder icon pack with `acode.require("fileIcons")`.

Assets come from [the Material Icons pack](https://github.com/sebastianjnuwu/acode-plugins/tree/acode/packages/material-icons); see [LICENSE](LICENSE).

This repository is the standalone example for Acode's icon pack API. It is not part of the Acode app repository.

## Install

1. Download [`plugin.zip`](plugin.zip) (same contents as [`material-icons.zip`](material-icons.zip)).
2. In Acode, open **Plugins → + → Local** and pick the zip.
3. Select **Icon Pack Example** in **Settings → App settings → Icon pack**.

Requires an Acode build that includes the `fileIcons` plugin API.

## How it works

Capture `acode.require("fileIcons")` at the top of `main.js`, before any `await`. The loader binds that API to this plugin. After an `await`, `require("fileIcons")` has no executing main-script context and throws. You can also take `fileIcons` from the third initialization argument: `(baseUrl, page, { fileIcons })`.

The plugin reads bundled JSON maps through `acode.require("fs")`, converts them into top-level associations, and registers the pack. Image URLs use the initialization callback's `baseUrl`. Expanded folder icons are declared explicitly. Acode supplies pack ownership from the loading plugin; do not pass `pluginId`. If you do, it must match this plugin's id.

Registration does not change the selected pack. The returned registration is disposed on unmount; Acode also removes packs owned by the plugin when it unmounts.

Use `register` again with the complete pack to replace it. There is no separate update or unregister method in the plugin API.

```js
const fileIcons = acode.require("fileIcons");
const fs = acode.require("fs");
const Url = acode.require("Url");

acode.setPluginInit(plugin.id, async (baseUrl) => {
  const root = Url.join(PLUGIN_DIR, plugin.id);
  const files = await fs(Url.join(root, "file_icons.json")).readFile("json");
  const folders = await fs(Url.join(root, "folder_icons.json")).readFile("json");

  registration = fileIcons.register({
    id: plugin.id,
    name: "Icon Pack Example",
    icons: `${Url.join(baseUrl, "icons")}/`,
    ...mapsFromPack(files, folders),
    folder: "folder",
    folderExpanded: "folder-open",
    rootFolder: "folder-root",
    rootFolderExpanded: "folder-root-open",
  });
});

acode.setPluginUnmount(plugin.id, () => registration?.dispose());
```

Do not load packaged JSON with `fetch()`. In Acode, the Cordova HTTP-backed `fetch()` path cannot read plugin files reliably. Use `acode.require("fs")` with a filesystem path, and `baseUrl` only for image URLs.

API reference: [File and folder icon packs](https://github.com/Acode-Foundation/Acode/blob/main/docs/file-icons.md) in the Acode repository.

## Layout

| Path | Role |
| --- | --- |
| `main.js` | Loads JSON maps and registers the pack |
| `plugin.json` | Plugin manifest |
| `file_icons.json` / `folder_icons.json` | Association maps from the Material Icons pack |
| `icons/` | SVG assets referenced by those maps |
| `plugin.zip` | Installable plugin archive |

## Packing

From this directory:

```sh
zip -r plugin.zip LICENSE file_icons.json folder_icons.json icon.png icons main.js plugin.json readme.md
cp plugin.zip material-icons.zip
```

## Using this as a starting point

1. Change `id`, `name`, and author in `plugin.json` and `main.js`.
2. Swap `icons/` and the JSON maps, or register associations inline.
3. Capture `acode.require("fileIcons")` at the top of `main.js`, or use `options.fileIcons` in `setPluginInit`. Omit `pluginId`; Acode binds ownership to the loading plugin.
4. Rebuild `plugin.zip` and install it locally.
