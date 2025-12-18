// EventMate Background Script

// const LUMA_DOMAINS = ['luma.com'];

// Daily download limit
const DAILY_DOWNLOAD_LIMIT = 10;

// Installation event
chrome.runtime.onInstalled.addListener(() => {
  console.log("EventMate installed");
  // Initialize download count on install
  initializeDailyDownloadCount();
});

// Get luma.auth-session-key cookie
async function getLumaAuthCookie() {
  const domains = ["luma.com", ".luma.com", "lu.ma", ".lu.ma"];

  for (const domain of domains) {
    try {
      // Directly get cookie with specified name
      const cookie = await chrome.cookies.get({
        url: `https://${domain}`,
        name: "luma.auth-session-key",
      });

      if (cookie) {
        return {
          found: true,
          domain: domain,
          cookie: cookie,
          value: cookie.value,
        };
      }
    } catch (error) {
      console.error(`Error getting auth cookie for ${domain}:`, error);
    }
  }

  return {
    found: false,
    error: "luma.auth-session-key cookie not found",
  };
}

// Convert cookies to request header format
function cookiesToHeader(cookies) {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "getCookies") {
    getLumaAuthCookie()
      .then((result) => {
        if (result.found) {
          sendResponse({
            success: true,
            authCookie: result.cookie,
            authValue: result.value,
            domain: result.domain,
            cookieHeader: `luma.auth-session-key=${result.value}`,
          });
        } else {
          sendResponse({
            success: false,
            error: result.error,
          });
        }
      })
      .catch((error) => {
        sendResponse({
          success: false,
          error: error.message,
        });
      });
    return true; // Keep message channel open
  }

  if (request.action === "saveData") {
    // Save scraped data to storage
    chrome.storage.local
      .set({
        [`scraped_data_${Date.now()}`]: request.data,
      })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "getData") {
    // Get all saved data
    chrome.storage.local
      .get(null)
      .then((data) => {
        const scrapedData = {};
        Object.keys(data).forEach((key) => {
          if (key.startsWith("scraped_data_")) {
            scrapedData[key] = data[key];
          }
        });
        sendResponse({ success: true, data: scrapedData });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "checkDownloadLimit") {
    checkDailyDownloadLimit()
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({ allowed: false, error: error.message });
      });
    return true;
  }

  if (request.action === "incrementDownloadCount") {
    incrementDownloadCount()
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Daily download limit management
async function initializeDailyDownloadCount() {
  try {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get(['downloadCount', 'lastResetDate']);
    
    // Reset count if it's a new day
    if (result.lastResetDate !== today) {
      await chrome.storage.local.set({
        downloadCount: 0,
        lastResetDate: today
      });
      console.log("Daily download count reset for new day:", today);
    }
  } catch (error) {
    console.error("Error initializing download count:", error);
  }
}

async function checkDailyDownloadLimit() {
  try {
    await initializeDailyDownloadCount(); // Ensure count is reset if needed
    const result = await chrome.storage.local.get(['downloadCount']);
    const currentCount = result.downloadCount || 0;
    
    return {
      allowed: currentCount < DAILY_DOWNLOAD_LIMIT,
      currentCount: currentCount,
      limit: DAILY_DOWNLOAD_LIMIT,
      remaining: DAILY_DOWNLOAD_LIMIT - currentCount
    };
  } catch (error) {
    console.error("Error checking download limit:", error);
    return { allowed: false, error: error.message };
  }
}

async function incrementDownloadCount() {
  try {
    const result = await chrome.storage.local.get(['downloadCount']);
    const currentCount = result.downloadCount || 0;
    const newCount = currentCount + 1;
    
    await chrome.storage.local.set({
      downloadCount: newCount
    });
    
    console.log(`Download count incremented: ${newCount}/${DAILY_DOWNLOAD_LIMIT}`);
    return {
      success: true,
      newCount: newCount,
      remaining: DAILY_DOWNLOAD_LIMIT - newCount
    };
  } catch (error) {
    console.error("Error incrementing download count:", error);
    return { success: false, error: error.message };
  }
}

// Helper function: validate if auth cookie is valid
function validateAuthCookie(cookie) {
  if (!cookie || !cookie.value) {
    return false;
  }

  // Check if expired
  if (cookie.expirationDate && cookie.expirationDate < Date.now() / 1000) {
    return false;
  }

  return true;
}

// Handle network requests (if proxy requests are needed)
chrome.webRequest?.onBeforeSendHeaders?.addListener(
  function (details) {
    // Can modify request headers here, add cookies, etc.
    if (details.url.includes("luma.ai") || details.url.includes("lu.ma")) {
      console.log("Luma request intercepted:", details.url);
    }
  },
  { urls: ["*://*.luma.ai/*", "*://*.lu.ma/*"] },
  ["requestHeaders"],
);
