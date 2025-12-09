// Luma Data Scraper Background Script

// const LUMA_DOMAINS = ['luma.com'];

// 安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Luma Data Scraper installed');
});

// 获取 luma.auth-session-key cookie
async function getLumaAuthCookie() {
  const domains = ['luma.com', '.luma.com', 'lu.ma', '.lu.ma'];

  for (const domain of domains) {
    try {
      // 直接获取指定名称的cookie
      const cookie = await chrome.cookies.get({
        url: `https://${domain}`,
        name: 'luma.auth-session-key'
      });

      if (cookie) {
        return {
          found: true,
          domain: domain,
          cookie: cookie,
          value: cookie.value
        };
      }
    } catch (error) {
      console.error(`Error getting auth cookie for ${domain}:`, error);
    }
  }

  return {
    found: false,
    error: 'luma.auth-session-key cookie not found'
  };
}

// 将cookies转换为请求头格式
function cookiesToHeader(cookies) {
  return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
}

// 监听来自content script和popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCookies') {
    getLumaAuthCookie().then(result => {
      if (result.found) {
        sendResponse({
          success: true,
          authCookie: result.cookie,
          authValue: result.value,
          domain: result.domain,
          cookieHeader: `luma.auth-session-key=${result.value}`
        });
      } else {
        sendResponse({
          success: false,
          error: result.error
        });
      }
    }).catch(error => {
      sendResponse({
        success: false,
        error: error.message
      });
    });
    return true; // 保持消息通道开放
  }

  if (request.action === 'saveData') {
    // 保存抓取的数据到storage
    chrome.storage.local.set({
      [`scraped_data_${Date.now()}`]: request.data
    }).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (request.action === 'getData') {
    // 获取所有保存的数据
    chrome.storage.local.get(null).then(data => {
      const scrapedData = {};
      Object.keys(data).forEach(key => {
        if (key.startsWith('scraped_data_')) {
          scrapedData[key] = data[key];
        }
      });
      sendResponse({ success: true, data: scrapedData });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

// 辅助函数：验证auth cookie是否有效
function validateAuthCookie(cookie) {
  if (!cookie || !cookie.value) {
    return false;
  }

  // 检查是否过期
  if (cookie.expirationDate && cookie.expirationDate < Date.now() / 1000) {
    return false;
  }

  return true;
}

// 处理网络请求（如果需要代理请求的话）
chrome.webRequest?.onBeforeSendHeaders?.addListener(
  function (details) {
    // 可以在这里修改请求头，添加cookies等
    if (details.url.includes('luma.ai') || details.url.includes('lu.ma')) {
      console.log('Luma request intercepted:', details.url);
    }
  },
  { urls: ["*://*.luma.ai/*", "*://*.lu.ma/*"] },
  ["requestHeaders"]
);