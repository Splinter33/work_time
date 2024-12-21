const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let startTime;
let totalTime = 0;
let interval;
const storagePath = path.join(__dirname, 'timeTracker.json');

function activate(context) {
  loadTime();

  vscode.workspace.onDidOpenTextDocument(() => {
    startTimer();
  });

  vscode.workspace.onDidCloseTextDocument(() => {
    saveTime();
  });

  let disposable =
      vscode.commands.registerCommand('extension.startTimer', () => {
        startTimer();
        vscode.window.showInformationMessage('⏱️ Timer Resumed!');
      });

  let stopTimerCommand =
      vscode.commands.registerCommand('extension.stopTimer', () => {
        saveTime();
        showTimeSpent();
        vscode.window.showInformationMessage('⏸️ Timer Saved!');
      });

  context.subscriptions.push(disposable);
  context.subscriptions.push(stopTimerCommand);
}

function startTimer() {
  if (!startTime) {
    startTime = new Date();
    interval = setInterval(() => {
      totalTime += 1;
      saveTime();
    }, 1000);
  }
}

function saveTime() {
  if (startTime) {
    let endTime = new Date();
    totalTime += Math.floor((endTime - startTime) / 1000);
    startTime = endTime;
    fs.writeFileSync(storagePath, JSON.stringify({totalTime}), 'utf8');
  }
}

function showTimeSpent() {
  let hours = Math.floor(totalTime / 3600);
  let minutes = Math.floor((totalTime % 3600) / 60);
  let seconds = totalTime % 60;

  vscode.window.showInformationMessage(
      `⏱️ Time spent: ${hours}h ${minutes}m ${seconds}s`);
}

function loadTime() {
  if (fs.existsSync(storagePath)) {
    const data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
    totalTime = data.totalTime || 0;
  }
}

function deactivate() {
  saveTime();
  clearInterval(interval);
}

module.exports = {
  activate,
  deactivate
};