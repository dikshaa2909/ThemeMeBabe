import * as vscode from 'vscode';

let keyPressTimestamps: number[] = [];
let backspaceCount = 0;

let moodItem: vscode.StatusBarItem;
let speedItem: vscode.StatusBarItem;
let backspaceItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log("🔥 ThemeMeBabe activated");
  vscode.window.setStatusBarMessage("🌈 ThemeMeBabe is running!", 3000);

  // Create status bar items
  moodItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  speedItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
  backspaceItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);

  moodItem.tooltip = "🧠 Your current coding mood";
  speedItem.tooltip = "⚡ Typing speed in keys/sec";
  backspaceItem.tooltip = "⌫ Number of backspaces in interval";

  moodItem.show();
  speedItem.show();
  backspaceItem.show();

  context.subscriptions.push(moodItem, speedItem, backspaceItem);

  // Track keypresses and backspaces
  vscode.workspace.onDidChangeTextDocument((event) => {
    const changes = event.contentChanges;
    if (!changes || changes.length === 0) return;

    const now = Date.now();
    keyPressTimestamps.push(now);
    if (changes[0].text === "") backspaceCount++;
  });

  const config = vscode.workspace.getConfiguration('thememebabe');
  const autoSwitch = config.get<boolean>('autoThemeSwitch', true);
  const fixedTheme = config.get<string>('fixedTheme', 'Rizz Focused');
  const intervalSeconds = config.get<number>('intervalSeconds', 15);
  const intervalMs = intervalSeconds * 1000;

  // 🎯 Fixed Theme Mode
  if (!autoSwitch) {
    setTimeout(() => {
      vscode.workspace.getConfiguration().update(
        "workbench.colorTheme",
        fixedTheme,
        vscode.ConfigurationTarget.Global
      );
      vscode.window.setStatusBarMessage(`🎯 Fixed theme set to: ${fixedTheme}`, 3000);
      moodItem.text = `🎯 Mood: Fixed (${fixedTheme})`;
      speedItem.text = `⚡ Mood Switching Off`;
      backspaceItem.text = ``;
    }, 1000); // Small delay to ensure VS Code is ready
    return;
  }

  // 🔁 Mood Detection Interval
  setInterval(() => {
    const mood = analyzeMood(intervalMs);
    const speed = keyPressTimestamps.length / intervalSeconds;

    // Update status bar
    moodItem.text = `💖 Mood: ${mood}`;
    speedItem.text = `⚡ Speed: ${speed.toFixed(1)} keys/s`;
    backspaceItem.text = `⌫ Backs: ${backspaceCount}`;

    switchThemeForMood(mood);
    backspaceCount = 0;
  }, intervalMs);

  // 👋 Hello command
  context.subscriptions.push(
    vscode.commands.registerCommand('ThemeMeBabe.helloWorld', () => {
      vscode.window.showInformationMessage('👋 Hello from ThemeMeBabe!');
    })
  );
}

// 🧠 Mood Detection = Theme Selection
function analyzeMood(intervalMs: number): string {
  const now = Date.now();
  keyPressTimestamps = keyPressTimestamps.filter(t => now - t <= intervalMs);
  const speed = keyPressTimestamps.length / (intervalMs / 1000);

  if (backspaceCount > 5) return "Rizz Frustrated";
  if (speed > 5) return "Rizz Focused";
  if (speed > 2) return "Rizz Neutral";
  return "Rizz Tired";
}

// 🎨 Theme Switcher
function switchThemeForMood(theme: string) {
  vscode.workspace.getConfiguration().update(
    "workbench.colorTheme",
    theme,
    vscode.ConfigurationTarget.Global
  );
  vscode.window.setStatusBarMessage(`🎨 Theme switched to: ${theme}`, 3000);
}

// 🧹 Clean up
export function deactivate() {
  moodItem?.dispose();
  speedItem?.dispose();
  backspaceItem?.dispose();
}
