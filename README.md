# Teamwork CLI and API Interface
This is the home of the Teamwork CLI tool source and a Javascript API interface. 

## Getting started
#### `tw`
To get started with `tw`, you must have [Node.js](http://nodejs.org) installed on your machine the install `tw` via npm:
    
    $ npm install -g tw

Once `tw` is installed, you must now log in and pick your installation:

    $ tw login
    Email: <email>
    Password: *******
    Successfully logged in to <installation>. Welcome back John.

Done! You're all setup to integrate and automate your Teamwork Projects workflow into the command line.

#### Teamwork API
`tw` also doubles as a promise based Teamwork API interface for Node. To get started, simple `require` tw:

```js
var tw = require("tw");

tw.login("<username>", "<passwor>", "<installation>").then(function(api) {
    return [api, api.getProjects()]; 
}).spread(function(api, projects) {
    var sampleProject = projects[0];

    return api.getLogs(sampleProjects);
}).then(function(timeLogs) {
    // ... 
});
```

## Commands
`tw` has a plethora of commands to help your day to day usage of Teamwork Projects more integrated into your CLI workflow. Teamwork CLI tool was loosely inspired by `git` in

### `tw-projects`, `tw-tasklists`, `tw-tasks`
These commands let you select your *current* project, tasklist or tasks. The *current* selection is used when you omit any project, tasklist or task in your commands. 

* `-l, --list` - Display the items in a static list instead of an interactive selection.

For example, if we have select a project with `tw projects`:

    $ tw projects 
    Projects: [#48792] API

Now, when we attempt to log time to a project, the current project is selected because we omitted the `[project]`:

    $ tw log --project 1h -m "Chatting with Mike to smooth over some API specs."

This works wherever you see a `[task]`, `[tasklist]` or `[project]`. If they are omitted, the *current* item is selected.

### `tw-status`
View the current state of the tool. This command is similiar to `git-status`, it allows you get to grips with whos logged in and what tasks, projects and tasklists they're currently working on (i.e. *current* items).

    $ tw status 

### `tw-log [task] <duration>`
Log time to a task or project. This is an incredibly useful tool for quickly logging time on what task your currently working on. It's powerful with flexible options such as `--fill`, which will grab the time since your last log and log it to a task.

* `-p, --project [project]` - Log the time to a project instead of a task.
* `-m, --message <message>` - Log time with a message. If this option is omitted, you will be prompted for a message.
* `-e, --editor` - Open your `$EDITOR` to write the message.
* `--silent` - Log time without a message.
* `-F, --fill` - Log the time since your last time log today (from 8:00am).
* `-t, --time <time>` - Specify the start time of the log. Defaults to now - duration.
* `-d, --date <date>` - Specify the date of the duration. Defaults to today.

**Examples:**
Log two hours to task #214974:

    $ tw log #214974 2h -m "Old code cleaned up."
    Logged 2 hours to [#214974] Clean up old code.

Log the time since your last time log today (which was at 3:40pm, it's not 4:30pm) to the current project:

    $ tw log --fill --project
    Message: Meeting with Peter.
    Logged 50 minutes to [#1421] Web Event.

Whoops, you forgot to log your time debugging yesterday:

    $ tw log #172836 1h --date yesterday --time 16:00
    Message: Debugging issue with Chat app.
    Logged 1 hour to [#172836] Chat app not working on Linux.


### Units
#### `task`
A task can either be in the form of an ID or URL. For example `#2684930` and `http://mycompany.teamwork.com/tasks/2684930` are equivelant and both target the task with ID 2684930.

#### `duration`
A duration is a length of time with a minimum unit of one minute. It's pretty simple notation where `h` denotes the hour and `m` denotes the minute *in that order*. Either one can be omitted but at least one must be present. Examples: `5m`, `1h`, `8h24m`

#### `time`
A time unit is like you would see on a 24 hour digital clock, with a colon separating the hour and minute. Examples: `13:20` is 1:30pm, `09:15` is 9:15am.

#### `date`
A date unit is in the form of `dd/mm/yyyy`. Examples: `31/03/1994` is 31st March 1994. Other date strings accepted are `yesterday` and `today`.


### API Interface

### Development
To run the development version of `tw`, you need to add the `bin` folder to your path and run it using `twd`.