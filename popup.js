document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("select-btn");

  btn.addEventListener("click", async () => {
    // query the active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab) {
      // Send a message to the content script in the active tab
      chrome.tabs.sendMessage(
        tab.id,
        { action: "startSelection" },
        (response) => {
          if (chrome.runtime.lastError) {
            // Content script might not be loaded yet on some pages (e.g. chrome://)
            // or strictly protected pages, but permissions handle most cases.
            console.log("Could not establish connection to content script.");
          }
          // Close the popup after clicking to let user interact with the page
          window.close();
        }
      );
    }
  });
});
