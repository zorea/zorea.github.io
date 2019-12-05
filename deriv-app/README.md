Deriv App
============
This repository contains the various platforms of the Deriv application.

### In this document:
- [Installation](#installation)
- Packages in this repo:
  - [Bot](packages/bot/README.md)
  - [Components](packages/components/README.md)
  - [Core](packages/core/README.md)
  - [P2P](packages/p2p/README.md)
  - [Shared](packages/shared/README.md)
  - [Trader](packages/trader/README.md)
  - [Translations](packages/translations/README.md)
- [Working With This Repo](#working-with-this-repo)
    - [Package names](#package-names)
- [Usage](#usage)
  - [Starting a Development Server](#starting-a-dev-server)
  - [How to Clean Packages](#how-to-clean-packages)
  - [Examples of Script Usage](#examples-of-script-usage)
- [PR Guidelines](#pr-guidelines)
- [FAQ](#faq)

### Other documents:
- [General](docs/README.md) - Contains general philosophy and overview of this package
- [Stylesheet guidelines](docs/Stylesheet/README.md) - Contains rules for CSS/SASS code style
- [JavaScript guidelines](docs/JavaScript/README.md) - Contains rules for JS/JSX code style
- [Modules docs](docs/Modules/README.md) - Contains implementation guides (i.e., scaffolding, code usage)

[comment]: <> (TODO: Refactor Clean Project to be under usage)

## Installation
In order to work on your own version of the Deriv application, please **fork this project**.

You will need to perform the following on your development machine:

1. Node.js (v11.15.0 is recommended, v12 has compat issues currently) and NPM (see <https://nodejs.org/en/download/package-manager/>)
2. Clone your own fork of this repo
3. Run `npm run bootstrap` from the root folder
4. If you have a custom domain that you use for GH Pages, add a file named `CNAME` in `packages/core/scripts/` to be used for your GH Pages deployments
5. Run `npm run build` and then you're good to go

[comment]: <> (3. If you wish to install and work with only a single, or multiple but specific packages, then follow `3i` for each package. However, if you wish to install and work with all packages, follow `3ii`.)
[comment]: <> (i. Run `npm run bootstrap {package name}`. Replace `{package name}` with the name of the package you want to work with. eg.: `trader`, `bot`)
[comment]: <> (ii. Install all packages with a hoisting strategy \(lift all common packages to a root `node_modules` and not package specific\), run `npm run hoist`)

## Working With This Repo
All packages must contain the following scripts to perform the stated actions:

| Package param | Command             | Description                                                                                   |
| :-----------: | ------------------- |:---------------------------------------------------------------------------------------------:|
| ✅            | `start`             | Runs complete test and build suite and starts the dev server.                                 |
| ✅            | `serve`             | Runs build suite and starts the dev server.                                                   |
| ✅            | `build`             | Runs build suite and outputs the result into `dist`. Takes optional `base` value as argument. |
| ✅            | `test`              | Runs the test suite with eslint, and stylelint.                                               |
| ✅            | `test:eslint`       | Runs only eslint.                                                                             |
| ✅            | `test:stylelint`    | Runs only stylelint.                                                                          |
| ✅            | `test:mocha`        | Runs only the test suite.                                                                     |
| ❌            | `deploy`            | Runs `build` script, then pushes the output to GH Pages.                                      |
| ❌            | `deploy:clean`      | Runs `build` script, clears `gh-pages` branch, then pushes the output to GH Pages.            |
| ❌            | `deploy:folder`     | Runs `build` script, then pushes the output to the specified folder in GH Pages.              |
| ❌            | `deploy:staging`    | Initiates procedures for deploying to staging. (Package specific)                             |
| ❌            | `deploy:production` | Initiates procedures for deploying to production. (Package specific)                          |

**Please follow the README of each package you intend to work with on how to get set up and their custom scripts.** However, the above scripts can be run from the root directory in the following manner.

### Package names
Each package is named with the `deriv-` prefix, however for the scripts above, you do not need to add the `deriv-` prefix as the scripts already prefix the 1st argument of the script with `deriv-`. **However**, if you do use the `lerna` CLI directly, then you will need to use the full package name including the `deriv-` prefix.

You can find the names of packages by first navigating to the `packages` folder. Each subfolder is a package, and contains a `package.json` file. The value of the `name` key in `package.json` is the package name.

### Usage
#### Starting a Development Server

If you wish to work on Core, simply run `npm run serve core`.

But for working on any of the other packages (such as Trader, Bot, P2P), perform the following:
1. Open 2 terminals.
2. Run `npm run serve {package name}` in the first one. e.g.: `npm run serve translations`, `npm run serve bot`, etc.
3. Then run `npm run serve core` in the second one.

#### How to Clean Packages
If you intend to remove `node_modules` folder(s) from the projects, please run `npm run clean` from the root of the project.

This runs `lerna clean && rm -rf $(git rev-parse --show-toplevel)/node_modules` under the hood.
You can read more on the various lerna commands (and the [`clean` command](https://github.com/lerna/lerna/tree/master/commands/clean#readme)) over at the [Lerna docs](https://github.com/lerna/lerna/).

#### Examples of Script Usage
If a script supports the "Package param", you can supply a `{package name}` for it to run the script in. At the moment, only 1 package name can be given to a script, if you wish to run in multiple, please use the `lerna` command that's used under the hood as per its docs.

✅ In order to run the `start` script for the `bot` package, simply run:
```bash
npm run start bot
```

✅ Likewise for `trader` (or any other package) with a different script:
```bash
npm run test:stylelint trader
```

❌ Below command will not work as the script `deploy:clean` does not support "Package param" (refer to the table in [Working With This Repo](#working-with-this-repo)):
```bash
npm run deploy:clean bot
```

#### Release
There are 3 types of release:

1. Release to test link (deploy to your fork's GH Pages):
    1. You can simply deploy to root of the `gh-pages` branch with: `npm run deploy`.
    2. You can clean (remove `br_` folders and clear root) your `gh-pages` branch and deploy to root in a single command with `npm run deploy:clean`
    3. You can deploy to a folder in your `gh-pages` branch in order to separate from root app deployment and other folder deployments with: `npm run deploy:folder br_test_folder` (folder name must be prefixed with `br_`)
2. Release to staging: simply run `npm run deploy:staging` and follow the instructions.
3. Release to production: simply run `npm run deploy:production` and follow the instructions.

## PR Guidelines
1. Use the `developer 1|developer 2/task_name` format for PR titles. (e.g.: `dev1|dev2/fixed_emoji_issue`, `dev1/added_superfast_jellyfish`)
2. Use the appropriate package labels available on the repo to indicate which packages your PR modifies.
3. Use Draft PRs if you don't mean to request for reviews yet. [Read more here.](https://github.blog/2019-02-14-introducing-draft-pull-requests/)

## FAQ
1. How do I **install** an npm package in one of our packages?

    **A.** You can simply `cd` into the package you wish to install to, then run `npm i package-name` as usual. Or simply run a `lerna exec` like `lerna exec --scope=local-package -- npm i npm-package-name`, e.g.: `lerna exec --scope=deriv-translations -- npm i i18next`. _Please note that for direct `lerna` CLI use, you need the full package name including the `deriv-` prefix._

2. How do I **uninstall** an npm package from one of our packages?

    **A.** Just as installing, except the `npm` command you'd run would be `npm uninstall` (shortened to `npm un`). e.g.: `lerna exec --scope=deriv-translations -- npm un i18next`.

3. How do I run `npm ci` or equivalent (to add dependencies based on `package-lock.json`?

    **A.** You have two options:

    1. use `lerna exec` with the `--scope` argument as the package you want to run the command on, as such `lerna exec --scope=trader -- npm ci`.
    2. `cd` into `packages/PACKAGE-NAME` and run `npm ci`, as such `cd packages/trader && npm ci`

4. Why do I need to run commands with `sudo`?

    **A.** You shouldn't need to. The only command that needs privilege is `serve` and `start` and that's because it's on port 443 **however, that script prompts you by itself, you do not need to place `sudo`**.

    If you face this issue, simply run `sudo chown -R $(whoami) .` from the root of the project.

5. My build(s) fail and I can see it related to Node Sass (`node-sass`), what do I do?

    **A.** This issue happens when your `node-sass` has its `binding.node` set to a version of node different from the current projects' one. Please try the following in order:
    
    1. First run `npm rebuild node-sass` and try building your packages again.
    2. If that doesn't work, try `npm cache clean --force`, followed by `npm run clean`, and then `npm run bootstrap`.
    3. And finally, if that doesn't work then you can read deeper into this [StackOverflow post](https://stackoverflow.com/questions/37986800). 
