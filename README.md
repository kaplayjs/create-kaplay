# create-kaplay

a script to help you start a kaplay project in no time

```
USAGE

  $ create-kaplay [OPTIONS] <dir>

    or

  $ npm init kaplay -- [OPTIONS] <dir>

OPTIONS

  -h, --help             Print this message
  -t, --typescript       Use TypeScript
  -d, --desktop          Enable packaging for desktop release (uses tauri and requires rust to be installed)
  -e, --example <name>   Start from a example listed on play.kaplayjs.com
      --spaces <level>   Use spaces instead of tabs for generated files
  -v, --version <label>  Use a specific kaplay version (default latest)

EXAMPLE

  # quick start with default config
  $ npm init kaplay mygame

  # need to put all args after -- if using with npm init
  $ npm init kaplay -- --typescript --example burp mygame

  # if installed locally you don't need to use -- when passing options
  $ create-kaplay -t -s -d burp mygame
```
