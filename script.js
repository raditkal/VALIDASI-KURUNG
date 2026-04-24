const inputText = document.getElementById("inputText");
const validateBtn = document.getElementById("validateBtn");
const clearBtn = document.getElementById("clearBtn");
const result = document.getElementById("result");

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
  const errors = [];
  let line = 1;
  let column = 1;
  let inString = false;
  let stringDelimiter = null;
  let escaped = false;

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
        index: i,
        line: currentLine,
        column: currentColumn,
      });
    } else if (closeToOpen[char]) {
      if (stack.length === 0) {
        errors.push(
          `Ditemukan '${char}' di baris ${currentLine}, kolom ${currentColumn} tanpa pasangan pembuka.`,
        );
      } else {
        const top = stack[stack.length - 1];
        if (top.char !== closeToOpen[char]) {
          errors.push(
            `Mismatch di baris ${currentLine}, kolom ${currentColumn}: '${char}' tidak cocok dengan '${top.char}' (dibuka di baris ${top.line}, kolom ${top.column}).`,
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
    errors.push(
      `'${unclosed.char}' yang dibuka di baris ${unclosed.line}, kolom ${unclosed.column} belum ditutup.`,
    );
  }

  if (inString) {
    errors.push(
      `String yang dimulai dengan ${stringDelimiter} di baris/kolom tertentu belum ditutup sampai akhir input.`,
    );
  }

  if (errors.length > 0) {
    const errorList = errors.map((error, index) => `${index + 1}. ${error}`).join("\n");
    return {
      valid: false,
      message: `Ditemukan ${errors.length} error:\n${errorList}`,
    };
  }

  return {
    valid: true,
    message: "Valid: semua tanda kurung seimbang dan berpasangan dengan benar.",
  };
}

function showResult(validation) {
  result.textContent = validation.message;
  result.classList.remove("ok", "error");
  result.classList.add(validation.valid ? "ok" : "error");
}

validateBtn.addEventListener("click", () => {
  const text = inputText.value;
  const validation = validateBrackets(text);
  showResult(validation);
});

clearBtn.addEventListener("click", () => {
  inputText.value = "";
  result.textContent = "Hasil validasi akan muncul di sini.";
  result.classList.remove("ok", "error");
  inputText.focus();
});
