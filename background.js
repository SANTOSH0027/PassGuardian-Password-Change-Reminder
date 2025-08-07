function daysBetween(date1, date2) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2 - date1) / msPerDay);
}

function checkPasswordExpiry() {
  chrome.storage.local.get(["passGuardian"], (data) => {
    const records = data.passGuardian || {};
    const now = new Date();

    let hasOverdue90 = false;

    for (const [site, lastUpdated] of Object.entries(records)) {
      const daysAgo = daysBetween(new Date(lastUpdated), now);

      if (daysAgo >= 90) {
        showNotification(site, daysAgo);
        hasOverdue90 = true;
      }
    }

    // Show red badge if anything is overdue (60+ days)
    const overdueCount = Object.values(records).filter(date => daysBetween(new Date(date), now) >= 60).length;
    if (overdueCount > 0) {
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "red" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  });
}

// ✅ Show notification for a site that passed 90 days
function showNotification(site, daysAgo) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png", // Optional: use Chrome's default if not added
    title: "Password Expired",
    message: `It's been ${daysAgo} days since you updated your password for ${site}. Please update it.`,
    priority: 2
  });
}

// Check on startup and install
chrome.runtime.onStartup.addListener(checkPasswordExpiry);
chrome.runtime.onInstalled.addListener(checkPasswordExpiry);

// Also check every 6 hours
setInterval(checkPasswordExpiry, 6 * 60 * 60 * 1000);
