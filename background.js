// Simple background script
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "answerQuestion",
    title: "Get answer to this question",
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
});