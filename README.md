# create-kaplay

A script to help you start a kaplay project in no time

```
USAGE

  $ create-kaplay [OPTIONS] <dir>

    or

  $ npm init kaplay -- [OPTIONS] <dir>

OPTIONS

  -h, --help             Print this message
  -t, --typescript       Use TypeScript
  -d, --desktop          Enable packaging for desktop release (uses tauri and requires rust to be installed)
  -e, --example <name>   Start from an example listed on play.kaplayjs.com
  -s  --spaces <level>   Use spaces instead of tabs for generated files
  -v, --version <label>  Use a specific kaplay version (default latest)

EXAMPLE

  # quick start with default config
  $ create-kaplay mygame

  # calling with options
  $ create-kaplay -t -s 4 -d -e burp mygame
```
