import util from "util"
import { Writable } from "stream"
import chalk from "chalk"
import cliBoxes, { Boxes, BoxStyle } from "cli-boxes"
import figures from "figures"
import stringWidth from "string-width"

const lastLog: {
  title: string
  width: number
} | null = null

function breakStringEvery(string: string, n: number) {
  return string.match(new RegExp(`.{1,${n}}`, "gu")) ?? []
}

function print(...output: string[]) {
  process.stdout.write(output.join(""))
}

function moveUp(count = 1) {
  process.stdout.write(`\u001B[${count}A`)
}

export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}

export type PaddingCompatible = Padding | number | {
  topAndBottom: number
  leftAndRight: number
}

export interface LogGroupOptions {
  title: string
  color: string
  box: BoxStyle | keyof Boxes
  padding: PaddingCompatible
  fallbackWidth: number
  maxWidth: number
}

export class LogGroup extends Writable {
  readonly options: LogGroupOptions = {
    title: "",
    color: "dim",
    box: cliBoxes.round,
    padding: 1,
    fallbackWidth: 50,
    maxWidth: 1000
  }

  constructor(options: Partial<LogGroupOptions> = {}) {
    super({
      objectMode: true,
      decodeStrings: false
    })

    Object.assign(this.options, options)

    if (Object.values(this.normalizedPadding).some(v => v < 0))
      throw new Error("Padding must not be negative")
  }

  log(...parts: string[]): void {
    const firstInGroup = lastLog?.title !== this.options.title
    if (firstInGroup) this.writeLogBlockStart()
    else moveUp(1 + this.normalizedPadding.bottom)

    parts.forEach(part => this.writeLog(part))

    this.writeEmptyLogLines(this.normalizedPadding.bottom)
    this.writeLogBlockEnd()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _write(chunk: any, encoding: string, callback: (error?: (Error | null)) => void): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    this.log(chunk.toString())
    callback()
  }

  private get normalizedPadding(): Padding {
    if (typeof this.options.padding === "number") {
      return {
        top: this.options.padding,
        right: this.options.padding,
        bottom: this.options.padding,
        left: this.options.padding
      }
    }

    if ("topAndBottom" in this.options.padding) {
      return {
        top: this.options.padding.topAndBottom,
        right: this.options.padding.leftAndRight,
        bottom: this.options.padding.topAndBottom,
        left: this.options.padding.leftAndRight
      }
    }

    return this.options.padding
  }

  private get blockWidth(): number {
    return Math.min(process.stdout.columns || this.options.fallbackWidth, this.options.maxWidth)
  }

  private get box(): BoxStyle {
    if (typeof this.options.box === "string") return cliBoxes[this.options.box]
    return this.options.box
  }

  private writeLog(data: string | object): void {
    const width = lastLog?.width ?? this.blockWidth

    const lines = (typeof data === "string" ? data : util.inspect(data)).split("\n")

    for (const line of lines) {
      const partWidth = width - this.normalizedPadding.left - this.normalizedPadding.right - 4

      if (partWidth <= 0) {
        console.log(line)
        continue
      }

      const parts = breakStringEvery(line, partWidth)

      let i = 0
      for (const part of parts) {
        print(
          this.applyColor(this.box.vertical),
          " ".repeat(this.normalizedPadding.left),
          i === 0 ? "  " : `${chalk.dim(figures.pointerSmall)} `,
          part,
          " ".repeat(width - stringWidth(part) - this.normalizedPadding.left - 4),
          this.applyColor(this.box.vertical),
          "\n"
        )

        i++
      }
    }
  }

  private writeEmptyLogLines(count = 1): void {
    for (let i = 0; i < count; i++) {
      print(
        this.applyColor(this.box.vertical),
        " ".repeat((lastLog?.width ?? this.blockWidth) - 2),
        this.applyColor(this.box.vertical),
        "\n"
      )
    }
  }

  private writeLogBlockStart(): void {
    if (lastLog !== null && lastLog.title !== this.options.title) {
      lastLog.width = this.blockWidth
      lastLog.title = this.options.title
    }

    const width = lastLog?.width ?? this.blockWidth

    if (this.options.title && this.options.title.length !== 0) {
      print(this.applyColor(
        this.box.topLeft,
        this.box.horizontal.repeat(Math.floor((width / 2) - (this.options.title.length / 2)) - 2),
        this.applyColor(` ${this.options.title} `),
        this.box.horizontal.repeat(Math.ceil((width / 2) - (this.options.title.length / 2)) - 2),
        this.box.topRight,
        "\n"
      ))
    } else {
      process.stdout.write(this.applyColor(
        this.box.topLeft,
        this.box.horizontal.repeat(width - 2),
        this.box.topRight,
        "\n"
      ))
    }

    this.writeEmptyLogLines(this.normalizedPadding.top)
  }

  private writeLogBlockEnd(): void {
    const width = lastLog?.width ?? this.blockWidth

    process.stdout.write(this.applyColor(
      this.box.bottomLeft,
      this.box.horizontal.repeat(width - 2),
      this.box.bottomRight,
      "\n"
    ))
  }

  private applyColor(...strings: string[]): string {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    return chalk[this.options.color](strings.join(""))
  }
}
