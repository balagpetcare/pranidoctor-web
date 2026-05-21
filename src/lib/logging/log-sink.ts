import type { LogLevel } from "./types";

export type LogSink = "node" | "edge";

/** Writes one JSON log line using a runtime-appropriate sink. */
export function writeStructuredLogLine(
  line: string,
  level: LogLevel,
  sink: LogSink,
): void {
  if (sink === "node") {
    if (level === "error") {
      process.stderr.write(`${line}\n`);
      return;
    }
    process.stdout.write(`${line}\n`);
    return;
  }

  if (level === "error") {
    console.error(line);
    return;
  }
  console.log(line);
}
