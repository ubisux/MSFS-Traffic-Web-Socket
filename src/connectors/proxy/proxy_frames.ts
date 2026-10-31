export const MAX_PROXY_FRAME_BYTES = 1_048_576;

export function splitProxyFrames(input: string): {
  frames: string[];
  remainder: string;
} {
  const frames: string[] = [];
  let start = 0;
  let delimiter: number;
  while ((delimiter = input.indexOf("\r\n", start)) !== -1) {
    const end = delimiter + 2;
    frames.push(input.slice(start, end));
    start = end;
  }

  const remainder = input.slice(start);
  return {
    frames,
    remainder: Buffer.byteLength(remainder, "binary") <= MAX_PROXY_FRAME_BYTES
      ? remainder
      : "",
  };
}
