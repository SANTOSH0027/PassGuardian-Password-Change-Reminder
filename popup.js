// Helper to extract domain name from a URL
function getDomain(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    return "unknown-site";
  }
}

// Calculate days between two dates
function daysBetween(date1, date2) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2 - date1) / millisecondsPerDay);
}

// Render the tracked sites and their last update info
function renderSiteList() {
  chrome.storage.local.get(["passGuardian"], (data) => {
    const records = data.passGuardian || {};
    const siteList = document.getElementById("site-list");
    siteList.innerHTML = "";

    const now = new Date();

    for (const [site, lastUpdated] of Object.entries(records)) {
      const daysAgo = daysBetween(new Date(lastUpdated), now);
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${site}</strong><br>
        Last updated: ${daysAgo} day(s) ago
        ${daysAgo >= 60 ? "<br><span style='color: red;'> Time to update!</span>" : ""}
      `;

      siteList.appendChild(li);
    }
  });
}

// When popup loads
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const domain = getDomain(tab.url);
  document.getElementById("site").innerText = domain;

  // On clicking the "Mark as Password Updated" button
  document.getElementById("mark-updated").addEventListener("click", () => {
    chrome.storage.local.get(["passGuardian"], (data) => {
      const records = data.passGuardian || {};
      records[domain] = new Date().toISOString();

      chrome.storage.local.set({ passGuardian: records }, () => {
        alert("Password update recorded for " + domain + "!");
        renderSiteList(); // Refresh list
      });
    });
  });

  renderSiteList(); // Initial list render
});
