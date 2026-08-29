import * as fs from 'fs';

export function* readLinesSync(filePath: string, bufferSize = 64 * 1024): Generator<string> {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(bufferSize);
  let leftover = '';

  try {
    let bytesRead: number;
    while ((bytesRead = fs.readSync(fd, buffer, 0, bufferSize, null)) > 0) {
      const chunk = leftover + buffer.toString('utf8', 0, bytesRead);
      const lines = chunk.split('\n');
      leftover = lines.pop() ?? '';

      for (const line of lines) {
        yield line;
      }
    }

    if (leftover) {
      yield leftover;
    }
  } finally {
    fs.closeSync(fd);
  }
}

