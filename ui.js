const inputText = document.getElementById("inputText");
const lineNumbers = document.getElementById("lineNumbers");

const validateBtn = document.getElementById("validateBtn");
const clearBtn = document.getElementById("clearBtn");

const result = document.getElementById("result");
const normalErrorBox = document.getElementById("normalErrorBox");
const mismatchErrorBox = document.getElementById("mismatchErrorBox");
const normalErrorContent = document.getElementById("normalErrorContent");
const mismatchErrorContent = document.getElementById("mismatchErrorContent");

function updateLineNumbers(errorLineSet = new Set()) {
  const lineCount = inputText.value.split("\n").length;
  let html = "";

  for (let i = 1; i <= lineCount; i += 1) {
    const className = errorLineSet.has(i) ? "line-number invalid-line" : "line-number";
    html += `<div class="${className}">${i}</div>`;
  }

  lineNumbers.innerHTML = html;
}

function hideAllErrorBoxes() {
  normalErrorBox.classList.add("hidden");
  mismatchErrorBox.classList.add("hidden");
}

function showResult(validation) {
  result.textContent = validation.message;
  result.classList.remove("ok", "error");
  result.classList.add(validation.valid ? "ok" : "error");

  if (validation.valid) {
    hideAllErrorBoxes();
    updateLineNumbers(new Set());
    return;
  }

  updateLineNumbers(new Set(validation.errorLines || []));

  if (validation.normalErrors.length > 0) {
    normalErrorContent.textContent = validation.normalErrors
      .map((error, index) => `${index + 1}. ${error}`)
      .join("\n");
    normalErrorBox.classList.remove("hidden");
  } else {
    normalErrorBox.classList.add("hidden");
  }

  if (validation.mismatchErrors.length > 0) {
    mismatchErrorContent.textContent = validation.mismatchErrors
      .map((error, index) => `${index + 1}. ${error}`)
      .join("\n");
    mismatchErrorBox.classList.remove("hidden");
  } else {
    mismatchErrorBox.classList.add("hidden");
  }
}

inputText.addEventListener("input", () => {
  // Hilangkan highlight sampai user menekan "Validasi" lagi.
  hideAllErrorBoxes();
  updateLineNumbers(new Set());
});

inputText.addEventListener("scroll", () => {
  lineNumbers.scrollTop = inputText.scrollTop;
});

validateBtn.addEventListener("click", () => {
  const text = inputText.value;
  const validation = validateBrackets(text); // fungsi ini ada di script.js
  showResult(validation);
});

clearBtn.addEventListener("click", () => {
  inputText.value = "";
  hideAllErrorBoxes();
  updateLineNumbers(new Set());
  lineNumbers.scrollTop = 0;
  result.textContent = "Hasil validasi akan muncul di sini.";
  result.classList.remove("ok", "error");
  inputText.focus();
});

updateLineNumbers(new Set());
