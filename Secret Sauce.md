# Teamwork CLI Tool
The Teamwork is a simple command line interface to Teamwork Projects.

## Installation
`tw` is installed via npm. 

    npm install teamwork

## Usage
```sh
tw - A Teamwork Projects CLI interface.

    status                      View the current state of the tool. To update the state use the following:
    projects|tasklists|tasks    View and select the current project, tasklist or task.
      --list                    Display as a static list. (Non interactive)

    task <task>                 Show the details of a specific task. Omit <task> to view the current task.
    progress <task> <percent>   Add or remove progress to a task. Omit <task> to add the progress to the current task.
    open <task>                 Open or reopen a task.
    close <task>                Close a task. Omit <task> to close the current task.
        --force                 Don't ask to confirm.

    comments <task>             View the comments on a task. Omitting <task> gets comment on current task.
        --list                  Display a static list of comments. Omitting <task> gets comment on current task.
    comment <task>              Add a comment to a task (prompts). Omitting <task> comments on current task.
        -m|--message <msg>      Add a comment with a message.

    attach <task> <file>        Attach a file to a task. Omit <task> to attach to current task.

    tag <task> <tags..>         Add a tag to a task. Omit <task> to tag current task.

    logs <task>                 View the time logs on a task. Omit <task> to view the logs on the current task.
    log <task>                  Log the current timer to a task. Omit <task> to log to the current ask.
        <timestamp>             Log a Teamwork timestamp. See Timestamp unit.
        -d|--duration <dur>     Log with a specific duration. Use in conjunction with -t.
        -t|--time <time>        Log a duration with time offset.
        --date <date>           Log the time on a specific date.
        -m|--message <msg>      Log the time with a message. 
        --silent                Don't prompt for a message.

    start <task>                Assign yourself and start a new timer on a task.
        --no-assign             Don't automatically assign yourself to the task.
    stop                        Stop the current timer.
        -m|--message <msg>      Log the timer to the current task with a message.

    login                       Login to Teamwork API. Starts interactive prompt.
        -e|--email <email>      Pass an email to the login. Requires -p and -i. 
        -p|--password <pass>    Pass in a password. Will be prompted if omitted. Requires -e and -i.
        -i|--installation <i>   Pass in the Teamwork Installation URL. Requires -e and -p.
        -a|--auth-key <key>     Login with an auth key.
    logout                      Logout of the Teamwork API.

    reset                       Clear any current task.
        -t|--tasklist           Clear any current tasklist.
        -p|--project            Clear any current project.
    undo                        Undo last command. 
    redo                        Redo last undo.
    history                     View command history.

    search <term>               Search Teamwork for <term>
        --project <project>     Search a specific project. Omit <project> to search current project.
        --tasklist <tasklist>   Search a specific tasklist. Omit <tasklist> to search current tasklist.
        --unassigned            Find any unassigned tasks.
        --assigned <user>       Find any assigned tasks to <user>. Omit <user> to find tasks assigned to you.

    view <task>                 Open a task on Teamwork Projects website.

    do <sugar>                  Parse intentions from a natural string. See Commit Message syntax.

Global options:
    --auth-key                  Specify the auth key to use for the requests.
    --installation              Specify the current Teamwork Installation.
    --project                   Specify the current Project.
    --tasklist                  Specify the current tasklist.
    --task                      Specify the current task.

Keywords:
    current                     References the ID of the current task. (see "tw status")
    recent-1                    References the ID of the previous task.
    recent-n                    References the ID used in the last n task.

Setup:
    install-hooks               Install git hooks to integrate Projects into your Git repository.
        --no-fail               By default, if you try to use sugar commits and you're not logged
                                in, the commits will fail. Install the hooks with this option to
                                allow commits to pass even if you're not logged in, projects or 
                                commit messages will remain unchanged however.

```

### Logging in
To do anything, you must first login to Teamwork. For this, use the `login` command.

    $ tw login
    Email: cooney.adrian@gmail.com
    Password: *******
    Installation:
     > Digital Crew (digitalcrew.teamwork.com)
     * Chat Test (chattest.teamwork.com)
    Successfully signed in as Adrian C. to Digital Crew (digitalcrew.teamwork.com)

Or alternatively, you can specify all of these as options:

    $ tw login --email cooney.adrian@gmail.com --password <password> --installation digitalcrew.teamwork.com
    Successfully signed in as Adrian C. to Digital Crew (digitalcrew.teamwork.com)

### Status
To see the current state of things with what task your currently working on or which installation your sign into, use the status command.

    $ tw status
    Signed in as Adrian C. to Digital Crew (digitalcrew.teamwork.com)
    Project: Teamwork Chat (app) Tasklist: Bugs
    Task: [#124794] Fixing Firefox broken svg icon.
    Timer: 1 hour, 20 minutes

This is the current context of the Teamwork command tool.

### Tasks
To view tasks in the current task list and select one to be the current task. It only shows tasks still to be completed. To view *all* the tasks, open and closed, use the `--all` flag.

    $ tw tasks
    Project: Teamwork Chat (app)
    Tasklist: Bugs
      [#123679] No SVGs in Firefox or IE (80%)
      Assigned: Adam L., Priority: high, Tags: firefox
    > [#341248] Timestamps are incorrect on conversation rooms.
      Priority: medium

To update an individual task, you need it's ID or you can use the `current` keyword. There is various commands associated with tasks.

    $ tw close #123679
    ✔︎ [#123679] No SVGs in Firefox or IE (100%)
    Closed. 12 hours work logged (3 hours over estimate).

    $ tw open #123679
    [#123679] No SVGs in Firefox or IE (100%)
    Task opened. 2 hours 30 minutes work logged (1 hour remaining before estimate).

    $ tw progress current +10%
    [#124840] Dodgy links in chat input. (50% -> 60%)

To view a task, just run `task` command with the ID (or omit to view the current task):

    $ tw task #123679
    [#123679] No SVGs in Firefox or IE (80%)
    Assigned: Adam L., Priority: high, Tags: firefox

### Comments
View the comments or add a comment on tasks. To add a comment, use the `comment <task>` comment which opens your default editor with the full thread in view:

    $ tw comment #124840

File in editor:

    [#124840] No SVGs in Firefox or IE (60%)
    Assigned: Adam L., Priority: high, Tags: firefox

    #1 Adam Lynch (adam) 5h ago
    > Is this got to do with gulp?

    #2 Jago Gibbon (jago) 2h ago
    > I don't think so, I think it's IE.

    Adrian C. (adrian):        (write comment below)
    ------------------------------------------------
    Yeah, I definitely think it's IE.

Or alternatively, use the `-m` flag to just add a comment to a task.

    $ tw comment #124840 -m "Yeah, I definitely think it's IE."
    [#124840] No SVGs in Firefox or IE (60%)
    Assigned: Adam L., Priority: high, Tags: firefox

    #8 Adrian C. (adrian) just now:
    > Yeah, I definitely think it's IE.

### Logs
Log time with the powerful log command. See the Timestamp unit for usage.

    $ tw log #124840 -2h -m "SVGs fixed."
    > SVGs fixed.
    [#124840] No SVGs in Firefox or IE (60%)
    Logged 2 hours from 14:30-16:30.

    $ tw logs #124840
    [#124840] No SVGs in Firefox or IE (60%)
    Assigned: Adam L., Priority: high, Tags: firefox
    2 hours logged (1 hour over estimate).

    #1 Adam L. (adam) 12/04/15 13:40-15:40 (2h)
    > Debugging.


### Timers
Timers are supported, use the `timer` command. Timers will automatically assign the current task to yourself.
    
    $ tw start
    [#124840] No SVGs in Firefox or IE (60%)
    Assigned: Adrian C., Priority: high, Tags: firefox
    New timer created at 12:42.

    $ tw stop
    [#124840] No SVGs in Firefox or IE (60%)
    Assigned: Adrian C., Priority: high, Tags: firefox
    Timer stopped at 13:32 with duration of 0h50m.

Open up an editor with a message:

    $ tw log #1249304
    Logging 0h50m to [#124843] No SVGs in Firefox or IE (60%).

Editor opens up and allows you to edit your log message.

### Hooks
**Warning! This overwrites any existing git `post-commit` and `commit-msg` hooks.**
Use `install-hooks` in install the git hooks in your git repository. This will add a `post-commit` hook that checks the commit message for actions related to Teamwork projects. Once installed, you can write like `Log 1h on #123843` or `Close #729084`. To prevent conflict with Github, In the unlikely event that your repo has issues with IDs that reach 6 digits in length (the same as Teamwork's Tasks), you can also identify tasks with a + (plus) sign: `Log 1h on +124243`. 

Examples:
    
    $ git commit -m "Fixing the bad resize handler in IE. Log +1h #412947."
    $ git commit -m "Finally completed that handy client feature. Close #448104."
    $ git commit -m "Updated the chat-api-wrapper to the new cookie API. Completed 70% on #2793047."


#### Syntax
The syntax for commit messages is pretty simple and intuitive. It is case insensitive and can appear anywhere in the commit message:

* Adding time to a task: `(add|worked|log)? <timestamp> (to|on)? (task)? <task>`
* Closing a task: `(fix|fixes|close|closes|completes)? (task)? <task> (done)?`
* Adding progress: `(progress|completed)? <percent> (done)? (to|on)? (task)? <task>`

### Units
This is the specification for the units used in the Teamwork tool.

* Relative `timestamp` - `([-+]?\d+[hm]){1,2}`
    - `1h` - Log 1 hour, relative to now.
    - `135m` - Log 135 minutes, relative to now.
    - `1h30m` - Log 1 hours and 30 minutes, relative to now.
* Explicit `timestamp` - 
    - `12:30-14:00` - Log 1 hour and 30 minutes from 12:30 to 14:00 on the current day.
    - `12/05/15 12:30-14:00` - Log the time on a specific date.
* Mixed `timestamp`
    - `12:30-3h` - Log 3 hours, from 12:30 to 15:30 on the current day.
* `task`
    - `#162735` - Task #162735.
    - `https://digitalcrew.teamwork.com/tasks/3299987` - Task #3299987.
    - `+162735` - Task #162735.
* `percent`
    - `20%` - Exact percent progress.
    - `+30%` - Relative add percent.
    - `-30%` - Relative subtract percent.

Your commit messages will also have expanded links to tasks in the message. So in place of #479124, you will have a URL to the task. A commit message, like:

    Fixing the bad resize handler in IE. Log +1h #412947.

Will be converted to:

    Fixing the bad resize handler in IE. #412947

    [#412947] Resize handler not working in IE.
    Logged 1 hour from 14:30-15:30 on the 14/05/15.
    http://digitalcrew.teamwork.com/tasks/412947

Another cool feature of Teamwork CLI: if you don't know the ID of you task, you can put `#ask` in place for the task ID and an interactive prompt will show to pick the correct task.

    $ git commit -m "Fixing SVG's in IE. Closes #ask -2h"
    Project: Teamwork Chat (app)
    Tasklist: Bugs
    > [#123679] No SVGs in Firefox or IE (80%)
      Assigned: Adam L., Priority: high, Tags: firefox
      [#341248] Timestamps are incorrect on conversation rooms.
      Priority: medium

    [develop 937f493] 
      Fixing SVG's in IE.

      ✔︎ [#123679] No SVGs in Firefox or IE (100%)
      Closed. Logged 2 hours at 13:00-15:00 on the 15/04/15.
      http://digitalcrew.teamwork.com/tasks/123679

    Author: Donal Linehan <donalin@gmail.com>
    Date: Thu Jun 18 17:00:26 2015 +0100
    1 file changed, 0 insertions(+), 0 deletions(-)
    rewrite src/app/browser/images/hi-res-logo-icon.png (99%)

Along with `#ask`, you can use `#current` to specify the current task.

### Example usages
You just come in this morning, let's you want to see what you have to work on today.

    $ tw status
    Good morning, Adrian.
    Signed in as Adrian C. to Digital Crew (digitalcrew.teamwork.com)
    Project: Teamwork Chat (app). Tasklist: Sprint #4
    Task: --

    $ tw search --tasklist --unassigned
    Project: Teamwork Chat (app)
    Tasklist: Sprint #4
    Tasks:
      [#123679] No SVGs in Firefox or IE (40%)
      Assigned: Anyone, Priority: high, Tags: firefox

      [#214545] Gulp build is breaking Favicon (0%)
      Assigned: Anyone, Priority: low, Tags: build-system

    $ tw task #123679
    [#123679] No SVGs in Firefox or IE (40%)
    Assigned: Anyone, Priority: high, Tags: firefox
    5 comments, 11 hours logged (4 remaining in estimate)

    $ tw start #123679
    [#123679] No SVGs in Firefox or IE (40%)
    Assigned: Adrian C. (you), Priority: high, Tags: firefox
    Timer started at 13:00. (You sure, it's lunch time? nom.)

    $ git commit -m "SVGs working in IE and firefox. Fixes #current."
    [develop 937f493] 
      Fixing SVG's in IE.

      ✔︎ [#123679] No SVGs in Firefox or IE (100%)
      Closed. Logged 4 hours at 13:00-17:00 on the 15/04/15.
      http://digitalcrew.teamwork.com/tasks/123679

    Author: Adrian Cooney <adrian.cooney@teamwork.com>
    Date: Thu Jun 18 17:00:26 2015 +0100
    1 file changed, 0 insertions(+), 0 deletions(-)
    rewrite src/app/browser/images/hi-res-logo-icon.png (99%)