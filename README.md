# KuzenBox Pro Public Site

This is the static GitHub Pages download site for KuzenBox Pro.

## Files

- `index.html`: page entry
- `assets/site.css`: visual system and responsive layout
- `assets/site.js`: password gate, rotating phrase, release selector, and download link behavior
- `assets/releases.json`: release metadata used by the version selector
- `assets/kuzenbox.png`: site icon
- `assets/reference-sheep-stack.png`: sheep stack artwork derived from the approved reference
- `downloads/kuzenbox_pro-setup.exe`: latest published installer compatibility link
- `downloads/kuzenbox_pro-<version>-setup.exe`: versioned published installers

## Installer

The public CTA points to:

```text
./downloads/kuzenbox_pro-setup.exe
```

The latest installer should also be copied to its versioned filename, for example:

```text
./downloads/kuzenbox_pro-4.1.0-setup.exe
```

The installer should be refreshed from the project build output:

```text
E:\kuzenbox_pro\dist\kuzenbox_pro-setup.exe
```

## GitHub Pages

The site is published from the `main` branch root of:

```text
https://github.com/tsuneyama1/kuzenbox-pro-site.git
```

Public URL:

```text
https://tsuneyama1.github.io/kuzenbox-pro-site/
```
