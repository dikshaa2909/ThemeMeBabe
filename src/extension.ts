import * as vscode from 'vscode';

let keyPressTimestamps: number[] = [];
let backspaceCount = 0;

let moodItem: vscode.StatusBarItem;
let speedItem: vscode.StatusBarItem;
let backspaceItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log("🔥 EXTENSION ACTIVATED 🔥");
  vscode.window.showInformationMessage("✅ ThemeMeBabe is active");

  // Status Bar Items
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

  // Track typing and backspaces
  vscode.workspace.onDidChangeTextDocument((event) => {
    const changes = event.contentChanges;
    if (!changes || changes.length === 0) return;
    const now = Date.now();
    keyPressTimestamps.push(now);
    if (changes[0].text === "") backspaceCount++;
  });

  // Get user setting for interval
  const config = vscode.workspace.getConfiguration('thememebabe');
  const intervalSeconds = config.get<number>('intervalSeconds', 15);
  const intervalMs = intervalSeconds * 1000;

  // Mood detection loop
  setInterval(() => {
    const mood = analyzeMood();
    const speed = keyPressTimestamps.length / intervalSeconds;

    // Update Status Bar
    moodItem.text = `💖 Mood: ${mood}`;
    speedItem.text = `⚡ Speed: ${speed.toFixed(1)} keys/s`;
    backspaceItem.text = `⌫ Backs: ${backspaceCount}`;

    // Switch theme
    switchThemeForMood(mood);
    vscode.window.showInformationMessage(`🎨 Theme switched to: ${mood}`);

    // Reset backspaces
    backspaceCount = 0;
  }, intervalMs);

  // Optional Hello Command
  context.subscriptions.push(
    vscode.commands.registerCommand('ThemeMeBabe.helloWorld', () => {
      vscode.window.showInformationMessage('👋 Hello from ThemeMeBabe!');
    })
  );
}

function analyzeMood(): string {
  const now = Date.now();
  keyPressTimestamps = keyPressTimestamps.filter(t => now - t < 15000);
  const typingSpeed = keyPressTimestamps.length / 15;

  if (typingSpeed > 3 && backspaceCount < 3) return "focused";
  if (backspaceCount > 5) return "frustrated";
  if (typingSpeed < 1) return "tired";
  return "neutral";
}

function switchThemeForMood(mood: string) {
  const themeMap: { [key: string]: string } = {
    focused: "Rizz Focused",
    tired: "Rizz Tired",
    frustrated: "Rizz Frustrated",
    neutral: "Rizz Neutral"
  };

  const themeName = themeMap[mood];

  if (themeName) {
    vscode.workspace.getConfiguration().update(
      "workbench.colorTheme",
      themeName,
      vscode.ConfigurationTarget.Global
    );
  }
}

export function deactivate() {
  moodItem?.dispose();
  speedItem?.dispose();
  backspaceItem?.dispose();
}
