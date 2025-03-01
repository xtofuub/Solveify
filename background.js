// Simple background script
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "answerQuestion",
    title: "Get answer with Solveify",
    contexts: ["selection"],
    icons: {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png"
    }
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "answerQuestion") {
    chrome.tabs.sendMessage(tab.id, {
      action: "answerQuestion",
      selectedText: info.selectionText
    });
  }
});