# romm-sync

To install dependencies:

```bash
bun install
```

To build:

Note that you need to run build at least once before running the project, as it generates a couple of required files.

```bash
bun run build
```

To run in dev mode:

```bash
# Start vite and serve the webview UI
bun run start:ui

# Run the backend and launch the webview UI
bun run start
```

To run the compile app:

```bash
bun run build

./build/romm-sync
```

## Requirements

romm-sync requires webkitgtk 4.1 installed on your system. You can probably install it using your package manager under [webkit2gtk-4.1](https://pkgs.org/download/webkit2gtk-4.1), [libwebkit2gtk-4.1-0](https://pkgs.org/download/libwebkit2gtk-4.1-0) [webkit2gtk4.1](https://pkgs.org/download/webkit2gtk4.1), or [libwebkit2gtk-4_1](https://pkgs.org/download/WebKitGTK-4.1) if your system does not have it installed by default.