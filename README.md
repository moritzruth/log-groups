# Log Groups 🍱
> Log messages ... in groups

## Install
```bash
$ yarn add log-groups
# or
$ npm install log-groups
```

## Usage

### Basic
```javascript
// examples/basic.js

const { LogGroup } = require("log-groups");  
  
// You don’t have to provide any options at all. Default values will apply.  
const mainProcess = new LogGroup();  
const process1 = new LogGroup({  
  // All available options:  
  title: "Process 1",  
  color: "green",  
  padding: 0,  
  box: "double",  
  fallbackWidth: 20,  
  maxWidth: 40  
});  
  
// No new block will be created, instead,  
// the second message will be appended to the last block.  
mainProcess.log("Log 1");  
mainProcess.log("Log 2");  
  
// A new block will be created.  
process1.log("Process 1 started");  
mainProcess.log("Main process again");  
process1.log("Aaaand, it‘s me again.");
```

### Streaming
```javascript
// examples/streaming.js

const { LogGroup } = require("../index");

// Every instance is also a Writable stream!
mainProcess.write("Woooow, streaming!")

```

## Options
- `title` - *string*
	> Self-explanatory
   > 
   > Default: `""`
- `color` - One of *"red"*, *"green"*, *"yellow"*, *"blue"*, *"magenta"*, *"cyan"*, *"dim"*, *"white"*, *"black"* and *"gray"*
	> The color of the border and the title
   > 
   > Default: `"dim"`
- `box` - One of *"single"*, *"double"*, *"round"*, *"bold"*, *"singleDouble"*, *"doubleSingle"* and *"classic"* **or** your own style (an object compatible to [this boxes](https://github.com/sindresorhus/cli-boxes/blob/master/boxes.json))
  > The style of the box.
   > 
   > Default: `"round"`
- `padding` - *{ top: number, right: number, bottom: number, left: number }* **or** *{ topAndBottom: number, leftAndRight: number }* **or** *number*
  > The padding inside the box.
   > 
   > Default: `1`
 - `fallbackWidth` - *number*
   > The box width which will be used if process.stdout.columns is null.
   > 
   > Default: `1000`

BTW, it automatically breaks lines (wow) and indicates following lines with a small arrow `›`.
