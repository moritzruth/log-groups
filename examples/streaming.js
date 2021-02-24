const { LogGroup } = require("..")

// Every instance is also a Writable stream!
new LogGroup().write("Woooow, streaming!")
