const projectInput = document.getElementById("projectPath");
const outputInput = document.getElementById("outputPath");
const pickProject = document.getElementById("pickProject");
const pickOutput = document.getElementById("pickOutput");
const packagerSelect = document.getElementById("packager");
const installerSelect = document.getElementById("installer");
const startBuildBtn = document.getElementById("startBuild");
const logs = document.getElementById("logs");
const result = document.getElementById("result");

function appendLog(text) {
  logs.textContent += `${text.endsWith("\n") ? text : `${text}\n`}`;
  logs.scrollTop = logs.scrollHeight;
}

function setResult(message, isError = false) {
  result.classList.remove("hidden");
  result.style.background = isError ? "#fef2f2" : "#ecfdf3";
  result.style.borderColor = isError ? "#fecaca" : "#b7ebc6";
  result.textContent = message;
}

pickProject.addEventListener("click", async () => {
  const selected = await window.exeBuilderApi.selectFolder();
  if (selected) {
    projectInput.value = selected;
  }
});

pickOutput.addEventListener("click", async () => {
  const selected = await window.exeBuilderApi.selectFolder();
  if (selected) {
    outputInput.value = selected;
  }
});

window.exeBuilderApi.onBuildProgress((event) => {
  appendLog(`[${event.level}] ${event.message}`);
});

startBuildBtn.addEventListener("click", async () => {
  if (!projectInput.value || !outputInput.value) {
    setResult("Please select project and output folders.", true);
    return;
  }

  logs.textContent = "";
  result.classList.add("hidden");
  startBuildBtn.disabled = true;

  appendLog("Build started...");

  const response = await window.exeBuilderApi.startBuild({
    projectPath: projectInput.value,
    outputPath: outputInput.value,
    packager: packagerSelect.value,
    installer: installerSelect.value
  });

  startBuildBtn.disabled = false;

  if (!response.ok) {
    setResult(response.error, true);
    appendLog(`Error: ${response.error}`);
    return;
  }

  const { result: buildResult } = response;
  const exe = buildResult.outputSummary?.exe ?? "not found";
  const installer = buildResult.outputSummary?.installer ?? "not generated";

  setResult(`Build complete. EXE: ${exe} | Installer: ${installer}`);
  appendLog("Build finished successfully.");
});
