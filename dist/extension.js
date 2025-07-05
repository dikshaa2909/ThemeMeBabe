"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
let keyPressTimestamps = [];
let backspaceCount = 0;
let moodItem;
let speedItem;
let backspaceItem;
function activate(context) {
    console.log("🔥 EXTENSION ACTIVATED 🔥");
    vscode.window.showInformationMessage("✅ ThemeMeBabe is active");
    vscode.workspace.onDidChangeTextDocument((event) => {
        const changes = event.contentChanges;
        if (!changes || changes.length === 0)
            return;
        const now = Date.now();
        keyPressTimestamps.push(now);
        const text = changes[0].text;
        if (text === "")
            backspaceCount++;
    });
    // Read user-configured interval
    const config = vscode.workspace.getConfiguration('thememebabe');
    const intervalSeconds = config.get('intervalSeconds', 15);
    const intervalMs = intervalSeconds * 1000;
    // Create mood debug panel items
    moodItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    speedItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    backspaceItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
    moodItem.show();
    speedItem.show();
    backspaceItem.show();
    context.subscriptions.push(moodItem, speedItem, backspaceItem);
    // Mood check loop
    setInterval(() => {
        const mood = analyzeMood();
        const speed = keyPressTimestamps.length / intervalSeconds;
        moodItem.text = `🧠 Mood: ${mood}`;
        speedItem.text = `⚡ Speed: ${speed.toFixed(1)} keys/s`;
        backspaceItem.text = `⌫ Backs: ${backspaceCount}`;
        moodItem.tooltip = "Your current coding mood 💅";
        speedItem.tooltip = "Typing speed in the last interval";
        backspaceItem.tooltip = "Number of backspaces used";
        switchThemeForMood(mood);
        vscode.window.showInformationMessage(`🎨 Theme switched to: ${mood}`);
        backspaceCount = 0;
    }, intervalMs);
    // Hello world command (still there if needed)
    context.subscriptions.push(vscode.commands.registerCommand('ThemeMeBabe.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from ThemeMeBabe!');
    }));
}
function analyzeMood() {
    const now = Date.now();
    keyPressTimestamps = keyPressTimestamps.filter(t => now - t < 15000);
    const typingSpeed = keyPressTimestamps.length / 15;
    if (typingSpeed > 3 && backspaceCount < 3)
        return "focused";
    if (backspaceCount > 5)
        return "frustrated";
    if (typingSpeed < 1)
        return "tired";
    return "neutral";
}
function switchThemeForMood(mood) {
    const themeMap = {
        focused: "Rizz Focused",
        tired: "Rizz Tired",
        frustrated: "Rizz Frustrated",
        neutral: "Rizz Neutral"
    };
    const themeName = themeMap[mood];
    if (themeName) {
        vscode.workspace.getConfiguration().update("workbench.colorTheme", themeName, vscode.ConfigurationTarget.Global);
    }
}
function deactivate() { }
