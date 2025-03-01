document.addEventListener('DOMContentLoaded', function() {
  // Load saved API key when popup opens
  chrome.storage.sync.get('groqApiKey', function(data) {
    if (data.groqApiKey) {
      document.getElementById('apiKey').value = data.groqApiKey;
    }
  });
  
  // Save API key when save button is clicked
  document.getElementById('saveButton').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (apiKey) {
      chrome.storage.sync.set({ 'groqApiKey': apiKey }, function() {
        // Update button to show saved
        const button = document.getElementById('saveButton');
        button.textContent = 'Saved!';
        button.style.backgroundColor = '#4CAF50';
        
        // Revert button after 2 seconds
        setTimeout(() => {
          button.textContent = 'Save Settings';
          button.style.backgroundColor = '#4285F4';
        }, 2000);
      });
    } else {
      alert('Please enter a valid API key');
    }
  });
});