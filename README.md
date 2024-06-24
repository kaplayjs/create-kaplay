# create-kaplay

A script to help you start a KAPLAY project in no time

## EXAMPLE
```sh
# quick start with default config
create-kaplay mygame

# calling with options
create-kaplay -t -s 4 -d -e burp mygame
```

## USAGE
```sh
create-kaplay [OPTIONS] <dir>
```

## OPTIONS
```
-h, --help             Print help message
-t, --typescript       Use TypeScript
-d, --desktop          Enable packaging for desktop release (uses tauri and requires rust to be installed)
-e, --example <name>   Start from an example listed on play.kaplayjs.com
-s  --spaces <level>   Use spaces instead of tabs for generated files
-v, --version <label>  Use a specific kaplay version (default latest)
```
