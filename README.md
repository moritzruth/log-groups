# Log Groups 🍱
> Log messages ... in groups

## Install
Minimum required Node.js version is `v14.0.0`.

![npm](https://img.shields.io/npm/v/log-groups?style=flat-square)
```sh
yarn add log-groups
# or
npm install log-groups
```

## Usage
### Basic
```js
const { LogGroup } = require("log-groups")

// You don’t have to provide any options at all. Default values will apply.
const mainProcess = new LogGroup()
const process1 = new LogGroup({
  // All available options:
  title: "Process 1",
  color: "green",
  padding: 0,
  box: "classic",
  fallbackWidth: 20,
  maxWidth: 50
})

// No new block will be created, instead,
// the second message will be appended to the last block.
mainProcess.log("Log 1")
mainProcess.log("Log 2")

// A new block will be created.
process1.log("Process 1 started")
mainProcess.log("Main process again")
process1.log("Aaaand, it‘s me again.")
```

### Streaming
```js
const { LogGroup } = require("log-groups")

// Every instance is also a Writable stream!
LogGroup().write("Woooow, streaming!")
```

## Options
- title `string`
  > The title of the group.
  >
  > Default `""`
- color [`typeof chalk.ForegroundColor`](https://github.com/chalk/chalk#colors)
  > The color of the border and the title.
  >
  > Default `"blueBright"`
- box
  > The style of the box.
  > Can be any key from [this object](https://github.com/sindresorhus/cli-boxes/blob/ee5acd66ae7e676ac716a2f49884fbb5dc315e8d/boxes.json) or a custom object.
  >
  > Default `"round"`
- padding `{ top: number, right: number, bottom: number, left: number } | { topAndBottom: number, leftAndRight: number } | number`
  > The padding inside the box.
  >
  > Default: `1`
- fallbackWidth `number`
  > The box width which will be used if process.stdout.columns is null.
  >
  > Default: `50`
- maxWidth `number`
  > The maximum width of the box.
  >
  > Default: `1000`
