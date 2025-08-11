document.addEventListener('DOMContentLoaded', function() {
  // Load saved API key when popup opens
  chrome.storage.sync.get('geminiApiKey', function(data) {
    if (data.geminiApiKey) {
      document.getElementById('apiKey').value = data.geminiApiKey;
    }
  });
  
  // Save API key when save button is clicked
  document.getElementById('saveButton').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (apiKey) {
      chrome.storage.sync.set({ 'geminiApiKey': apiKey }, function() {
        const button = document.getElementById('saveButton');
        button.textContent = 'Saved!';
        button.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
          button.textContent = 'Save API Key';
          button.style.backgroundColor = '#4285F4';
        }, 2000);
      });
    } else {
      alert('Please enter a valid API key');
    }
  });
});