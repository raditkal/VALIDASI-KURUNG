const openToClose = {
  "(": ")",
  "[": "]",
  "{": "}",
};

const closeToOpen = {
  ")": "(",
  "]": "[",
  "}": "{",
};

function validateBrackets(text) {
  const stack = [];
  const normalErrors = [];
  const mismatchErrors = [];
  const errorLines = new Set();
  let line = 1;
  let column = 1;
  let inString = false;
  let stringDelimiter = null;
  let escaped = false;

  function addNormalError(message, lineNumber) {
    normalErrors.push(message);
    if (typeof lineNumber === "number") errorLines.add(lineNumber);
  }

  function addMismatchError(message, lineNumber) {
    mismatchErrors.push(message);
    if (typeof lineNumber === "number") errorLines.add(lineNumber);
  }

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const currentLine = line;
    const currentColumn = column;

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringDelimiter) {
        inString = false;
        stringDelimiter = null;
      }

      if (char === "\n") {
        line += 1;
        column = 1;
      } else {
        column += 1;
      }

      continue;
    }

    if (char === "'" || char === '"') {
      inString = true;
      stringDelimiter = char;
      escaped = false;

      if (char === "\n") {
        line += 1;
        column = 1;
      } else {
        column += 1;
      }

      continue;
    }

    if (openToClose[char]) {
      stack.push({
        char,
        line: currentLine,
        column: currentColumn,
      });
    } else if (closeToOpen[char]) {
      if (stack.length === 0) {
        addNormalError(
          `Ditemukan '${char}' di baris ${currentLine}, kolom ${currentColumn} tanpa pasangan pembuka.`,
          currentLine,
        );
      } else {
        const top = stack[stack.length - 1];
        if (top.char !== closeToOpen[char]) {
          addMismatchError(
            `Mismatch di baris ${currentLine}, kolom ${currentColumn}: '${char}' tidak cocok dengan '${top.char}' (dibuka di baris ${top.line}, kolom ${top.column}).`,
            currentLine,
          );
          // Pop untuk recovery agar validasi bisa lanjut menemukan error lain.
          stack.pop();
        } else {
          stack.pop();
        }
      }
    }

    if (char === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop();
    addNormalError(
      `'${unclosed.char}' yang dibuka di baris ${unclosed.line}, kolom ${unclosed.column} belum ditutup.`,
      unclosed.line,
    );
  }

  if (inString) {
    addNormalError(
      `String yang dimulai dengan ${stringDelimiter} di baris/kolom tertentu belum ditutup sampai akhir input.`,
      line,
    );
  }

  const totalErrors = normalErrors.length + mismatchErrors.length;
  if (totalErrors > 0) {
    return {
      valid: false,
      message: `Ditemukan ${totalErrors} error.`,
      normalErrors,
      mismatchErrors,
      errorLines: Array.from(errorLines),
    };
  }

  return {
    valid: true,
    message: "Valid: semua tanda kurung seimbang dan berpasangan dengan benar.",
    normalErrors: [],
    mismatchErrors: [],
    errorLines: [],
  };
}
