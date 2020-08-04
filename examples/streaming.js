const { LogGroup } = require("..")

// Every instance is also a Writable stream!
LogGroup().write("Woooow, streaming!")
