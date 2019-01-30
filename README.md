# Lightspeed Developer Tools

This library is still a work in progress. Use at your own risk :)

## Installation

This package is being developed as a collection of useful scripts and should be installed as a global package. You can do this by running the following command:

```bash
npm install lightspeed-devtools -g
```

## Configuration

While inside of your app's folder, use the `init` command to create a `lightspeed.json` configuration file.

```bash
lightspeed init
```


## Commands

To fetch files from your current webshop's theme, run the `pull` command. (Currently only works for text-based files such as .rain, .css and .js)

```bash
lightspeed pull [test|production]
```

To start a local testing environment for your templates, run the `start` command. The environment can be reached at `http://localhost:3000`.
Make sure to add some context variables in your `lightspeed.json` config (test config coming soon).

```bash
lightspeed start
```

Note: It make take you some time to get this to work since this local Twig engine is different then that from Lightspeed! You might have to comment out includes for templates like `{% include 'blocks/xx.rain' %}`.


## Coming soon

The following commands are still in development. 

To commit changes of your templates run the `push` command.
```bash
lightspeed push [test|production]
```

To fetch the current (custom) translations from your webshop use the `translations pull` command.
```bash
lightspeed translations pull [test|production]
```

```bash
lightspeed translations push [test|production]
```