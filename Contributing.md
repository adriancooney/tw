# Contributing
Teamwork CLI is built using ES6 and several awesome modules (see [package.json][package]).

### Setup
To start developing on Teamwork CLI, you need to remove it first if you have it installed.

    $ npm remove -g tw

Next, clone the repo:

    $ git clone http://github.com/Teamwork/tw

Once the repo is cloned, you need to `npm link` the repository to you npm modules. This will link the repo to your npm modules and add the binaries `tw` and `twd` to your `$PATH`.

    $ cd tw
    $ npm link

The `twd` binary is the development binary that runs the ES6 code directly with `babel-node`. This means you do not have to build the tool to see changes. `tw` is the built version (that's distributed) that requires `npm run build` to see any effect from changes.

### Building
To keep things simple, Teamwork CLI uses `npm` (on top of other CLI tools) to build itself. See [package.json][package] for the exact commands run. If you're confused about where the tools it depends on come from, they're `devDependencies` of the project and when you run a command, `npm` automatically adds the binary files these dependencies add to the `$PATH` of the command. So for example, `renamer` when installed locally isn't accessible via `renamer` on the command (you have to do `npm install -g renamer`) but *is* accessible in the npm scripts commands.

* `npm run build` - This builds the entire tool (TeamworkAPI module included) into the `build/` directory. It `npm run`s `build:*`.
* `npm run build:bin` - Build the CLI tool and puts it in `build/bin`. It `npm run`s `build:bin:*`.
* `npm run build:bin:compile` - Compile all the files in `bin/tw*` and puts them in `build/bin` with `babel`.
* `npm run build:bin:rename` - Babel has a "quirk" where it appends `.js` to all it's outputted files and we remove this with `renamer`.
* `npm run build:bin:chmod` - Chmod all binary files in `build/bin` to executable (required by Commander). This arguably defeats the simplicity of `npm run` but until we reach a tipping point, this can stay.
* `npm run build:bin:fix-binaries` - Replaces the header `#!/usr/bin/env babel-node --` used in development to run ES6 code directly with `#!/usr/bin/env node` used in production with `replacer`.
* `npm run build:src` - Build the files in `src/` into `build/src` with `babel`.
* `npm run clean` - Clean the project of all build files.
* `npm run parser` - Build the PEGjs parser.
* `npm run test` - Runs the test suite.

### Debugging
`tw` uses [`debug`][debug] for all it's debugging purposes. To enable some useful debug output, you should set the `DEBUG` environment variable to `tw`. For example:

    $ DEBUG=tw tw status


  [package]: package.json
  [debug]: https://github.com/visionmedia/debug