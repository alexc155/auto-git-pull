[![Build Status](https://travis-ci.org/alexc155/gitpull.svg?branch=master)](https://travis-ci.org/alexc155/gitpull)
[![Coverage Status](https://coveralls.io/repos/github/alexc155/gitpull/badge.svg?branch=master)](https://coveralls.io/github/alexc155/gitpull?branch=master)
[![dependencies Status](https://david-dm.org/alexc155/gitpull/status.svg)](https://david-dm.org/alexc155/gitpull)
[![devDependencies Status](https://david-dm.org/alexc155/gitpull/dev-status.svg)](https://david-dm.org/alexc155/gitpull?type=dev)

# gitpull

Schedules fetching all repos in a working folder from Git, and optionally pulls changes if there are no conflicts.

gitpull relies on the Git command line tools being installed and runable without interaction. If you can run 'git pull' in a command window, you can run this.

It's frustrating to try to push code to git, only to be told that your version isn't up to date and you must pull changes first - this script automates that pulling so you are always up to date.

## Installation

```
$ npm install -g gitpull
```

Tell `gitpull` where your repos are:

```
$ gitpull --set-projects-directory ./
```

or

```
$ gitpull --set-projects-directory /absolute/path/to/projects
```

## Usage

### Available commands:

    --set-projects-directory  | -spd    <PATH>

    --fetch                   | -f
    --fetch-silent            | -fs
    --pull                    | -p
    --pull-silent             | -ps
    --status                  | -s

    --schedule-fetch-task     | -ft
    --schedule-pull-task      | -pt

    --add-include             | -ai     <PATH>
    --remove-include          | -ri     <PATH>
    --show-includes           | -si
    --clear-includes          | -ci

    --add-exclude             | -ax     <PATH>
    --remove-exclude          | -rx     <PATH>
    --show-excludes           | -sx
    --clear-excludes          | -cx

    --help                    | -h

### Example usage:

    $ gitpull -spd /Users/you/Documents/GitHub
    $ gitpull -p
    $ gitpull -pt

### Notes:

* You must set a projects directory before fetching or pulling.
    
    This should be the root folder of your Git projects.

* The 'Pull' command performs a fetch & pull.
  
* 'Pull' will only attempt to pull changes if there are no conflicts or changes to the local tree.

* The more out of date a repo is, the longer it will take to fetch and pull.

* To fetch from only a subset of projects,

    either add each project using `--add-include <PATH>`

    (which means the main projects directory will be ignored),

    or exclude paths from the main projects directory using `--add-exclude <PATH>`

* To automate the process, use `--schedule-pull-task` to schedule a recurring pull task every 2 minutes.

* A log of operations is kept in the `logs` directory at the root of the project.

## Tests

```
$ npm test
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

- 0.1.0 Initial release.
