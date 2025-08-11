// Simple background script for a service worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "answerQuestion",
    title: "Get answer with Solveify",
    contexts: ["selection"]
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
});s
