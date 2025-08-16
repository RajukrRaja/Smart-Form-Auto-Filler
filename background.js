// background.js
chrome.runtime.onInstalled.addListener(() => {
  // Optional: seed a sample profile if none exists
  chrome.storage.local.get(['formProfiles'], (result) => {
    if (!result.formProfiles) {
      const defaultProfiles = {
        'Sample Profile': {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123',
          address: '123 Main Street',
          city: 'New York',
          zipCode: '10001',
          country: 'United States',
          dateOfBirth: '1990-01-01',
          customFields: []
        }
      };
      chrome.storage.local.set({ formProfiles: defaultProfiles });
    }
  });
});

// Optional: message handler
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === 'detectForms') {
    sendResponse({ success: true });
  }
});