import util from "util";
import {Writable} from "stream";
import chalk from "chalk";
import cliBoxes from "cli-boxes";
import figures from "figures";
import stringWidth from "string-width";

const lastLog: {
  title: null | string,
  width: null | number
} = {
  title: null,
  width: null,
};

function breakStringEvery(string: string, n: number) {
  return string.match(new RegExp(`.{1,${n}}`, "g")) || [];
}

function print(...output: string[]) {
  process.stdout.write(output.join(""));
}

function moveUp(count: number = 1) {
  process.stdout.write(`\x1B[${count}A`);
}

export type Padding = {
  top: number,
  right: number,
  bottom: number,
  left: number
}

export type PaddingCompatible = Padding | number | {
  topAndBottom: number,
  leftAndRight: number
};

export type LogGroupOptions = {
  title: string,
  color: string,
  box: cliBoxes.BoxStyle | string,
  padding: PaddingCompatible,
  fallbackWidth: number,
  maxWidth: number
};

export class LogGroup extends Writable {
  public options: LogGroupOptions = {
    title: "",
    color: "dim",
    box: cliBoxes.round,
    padding: 1,
    fallbackWidth: 50,
    maxWidth: 1000
  };

  constructor(options: Partial<LogGroupOptions> = {}) {
    super({
      objectMode: true,
      decodeStrings: false
    });

    Object.assign(this.options, options);

    if(Object.values(this.normalizedPadding).some(v => v < 0)) {
      throw new Error("Padding must not be negative");
    }
  }

  public log(...parts: any[]): void {
    const firstInGroup = lastLog.title !== this.options.title;
    if (firstInGroup) {
      this.writeLogBlockStart();
    } else {
      moveUp(1 + this.normalizedPadding.bottom);
    }

    parts.forEach(part => this.writeLog(part));

    this.writeEmptyLogLines(this.normalizedPadding.bottom);
    this.writeLogBlockEnd();
  }

  public _write(chunk: any, _encoding: string, callback: (error?: (Error | null)) => void): void {
    this.log(chunk);
    callback();
  }

  private get normalizedPadding(): Padding {
    if (typeof this.options.padding === "number") {
      return {
        top: this.options.padding,
        right: this.options.padding,
        bottom: this.options.padding,
        left: this.options.padding,
      }
    } else {
      if ("topAndBottom" in this.options.padding) {
        return {
          top: this.options.padding.topAndBottom,
          right: this.options.padding.leftAndRight,
          bottom: this.options.padding.topAndBottom,
          left: this.options.padding.leftAndRight,
        }
      } else {
        return this.options.padding;
      }
    }
  }

  private get blockWidth(): number {
    return Math.min(process.stdout.columns || this.options.fallbackWidth, this.options.maxWidth);
  }

  private get box(): cliBoxes.BoxStyle {
    if(typeof this.options.box === "string") {
      // @ts-ignore
      const box = cliBoxes[this.options.box];

      if(typeof box === "undefined") {
        throw new Error(`Invalid box style '${this.options.box}'.`);
      } else {
        return box;
      }
    }

    return this.options.box;
  }

  private writeLog(data: any): void {
    const width = lastLog.width || this.blockWidth;

    let lines = (typeof data === "string" ? data : util.inspect(data)).split("\n");

    for(let line of lines) {
      const partWidth = width - this.normalizedPadding.left - this.normalizedPadding.right - 4;

      if(partWidth <= 0) {
        console.log(line);
        continue;
      }

      const parts = breakStringEvery(line, partWidth);

      let i = 0;
      for(let part of parts) {
        print(
          this.applyColor(this.box.vertical),
          " ".repeat(this.normalizedPadding.left),
          (i !== 0 ? `${chalk.dim(figures.pointerSmall)} ` : "  "),
          part,
          " ".repeat(width - stringWidth(part) - this.normalizedPadding.left - 4),
          this.applyColor(this.box.vertical),
          "\n"
        );

        i++;
      }
    }
  }

  private writeEmptyLogLines(count: number = 1): void {
    for(let i = 0; i < count; i++) {
      print(
        this.applyColor(this.box.vertical),
        " ".repeat((lastLog.width || this.blockWidth) - 2),
        this.applyColor(this.box.vertical),
        "\n"
      );
    }
  }

  private writeLogBlockStart(): void {
    if (lastLog.title !== this.options.title) {
      lastLog.width = this.blockWidth;
      lastLog.title = this.options.title;
    }

    const width = lastLog.width || this.blockWidth;

    if (this.options.title && this.options.title.length !== 0) {
      print(this.applyColor(
        this.box.topLeft,
        this.box.horizontal.repeat(Math.floor(width / 2 - this.options.title.length / 2) - 2),
        this.applyColor(` ${this.options.title} `),
        this.box.horizontal.repeat(Math.ceil(width / 2 - this.options.title.length / 2) - 2),
        this.box.topRight,
        "\n"
      ));
    } else {
      process.stdout.write(this.applyColor(
        this.box.topLeft,
        this.box.horizontal.repeat(width - 2),
        this.box.topRight,
        "\n"
      ));
    }

    this.writeEmptyLogLines(this.normalizedPadding.top);
  }

  private writeLogBlockEnd(): void {
    const width = lastLog.width || this.blockWidth;

    process.stdout.write(this.applyColor(
      this.box.bottomLeft,
      this.box.horizontal.repeat(width - 2),
      this.box.bottomRight,
      "\n"
    ));
  }

  private applyColor(...strings: string[]): string {
    // @ts-ignore
    return chalk[this.options.color](strings.join(""));
  }
}
