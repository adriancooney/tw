# CLI Conventions
## Options
### Message `-m`
If your action takes a message, the message should be input via the `-m <message>` switch. If the `-m` switch is omitted and a message is required, the CLI should automatically attempt to open `$EDITOR` (ala `git commit`).

    $ tw log -T --fill -m "Updated Gordon's nose."

### Project `-p --project <project>, -P --current-project`
If your action needs to use a project, the project must **always** be explicit. By explicit, it either needs to be specified by name or ID using the `-p` switch or using the current project by the `-P`. **Never assume the user wants to use the current project.**

    $ tw log -P # Use the current project
    $ tw log -p "Half Life 3" # Using the project name
    $ tw log -p 2645 # Using the project ID

### Task `-t --task <task>, -T --current-task`
Much in the same way the project is inputted, tasks must always be explicit. **Again, never assume the user wants to use the current task.** Unfortunately, since tasks can have huge names, we only allow IDs. 

    $ tw log -T # Use the current task
    $ tw log -t 123682 # Use the task by ID

### Tasklist `-s --tasklist <tasklist>, -S --current-tasklist`
Tasklists are identical to tasks in the way they're inputted. **Never assume the user wants to use the current tasklist (yada yada).** Using `S` as the switch name has no particular meaning but because tasklists has a lot of sssss`s in it and it sounds like a snake (snakelists).

    $ tw log -T # Use the current task
    $ tw log -t 123682 # Use the task by ID

# Documentation Conventions
The following are conventions we follow when writing documentation. Please try to adhere to them to keep continuity across the documentation.

## Examples
When creating examples, use the following company with it's associated projects, tasklists and tasks.

### Fictional Company
* **Name:** Valve Inc.
* **Projects:**
    * Half Life 3
    * Half Life 2
    * Portal
    * Steam