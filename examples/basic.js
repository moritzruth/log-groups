const { LogGroup } = require("..")

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
