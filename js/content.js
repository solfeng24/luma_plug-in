// EventMate Content Script - Clean Version

// Language configuration
const CONTENT_LANGUAGES = {
  en: {
    title: "EventMate",
    status: {
      authenticated: "Authenticated",
      found: "Found",
      scrappable: "scrappable events",
      cookieAuthorized: "Cookie permission authorized, can be modified anytime",
    },
    events: {
      guestListVisible: "Guest list visible",
      hasAccess: "Has access",
      noAccess: "No access",
      guestListHidden: "Guest list hidden",
      startTime: "Start",
      location: "Location",
      offline: "Offline event",
      startTimeLabel: "Start Time:",
      endTimeLabel: "End Time:",
      scrapeStatusLabel: "Scrape Status:",
      guestCountLabel: "Participants:",
      locationLabel: "Location:",
      visibilityLabel: "Visibility:",
      description: "Description",
      viewOriginal: "View Original Page",
      close: "Close",
    },
    buttons: {
      autoScrape: "Auto Scrape",
      manualScrape: "Manual Scrape",
      scraping: "Scraping...",
      stop: "Stop",
      nextPage: "Next Page",
      retry: "Retry",
      export: "Export CSV",
      reset: "Reset Status",
      completed: "Completed",
      viewDetails: "View Details",
    },
    messages: {
      noScrapableEvents: "No scrappable events",
      noDataToExport: "No data to export",
      downloadLimitReached: "Daily download limit reached ({current}/{limit}), please try again tomorrow!",
      page: "Page",
      completed: "completed",
      newData: "new data",
      deduped: "(after deduplication)",
      total: "total",
      waiting: "Waiting",
      seconds: "seconds to continue",
      stopped: "Stopped",
      waitingSeconds: "Waiting",
      secondsAndContinue: "seconds to continue...",
      scraped: "scraped",
      items: "items",
      failed: "failed",
      refreshPage: "Please refresh the page manually",
      extensionReload: "Extension needs reload",
      extensionUpdated: "Extension updated, page reload required",
      ready: "Ready...",
      extensionStorageInvalid: "Extension storage invalid, please export CSV directly",
      possibleReasons: "Possible reasons:",
      networkIssue: "Network connection issue",
      apiUnavailable: "API temporarily unavailable",
      authAbnormal: "Authentication status abnormal",
    },
  },
  cn: {
    title: "EventMate",
    status: {
      authenticated: "已认证",
      found: "找到",
      scrappable: "个可抓取活动",
      cookieAuthorized: "Cookie权限已授权，可随时修改",
    },
    events: {
      guestListVisible: "Guest列表可见",
      hasAccess: "有访问权限",
      noAccess: "无访问权限",
      guestListHidden: "Guest列表不可见",
      startTime: "时间",
      location: "地点",
      offline: "线下活动",
      startTimeLabel: "开始时间:",
      endTimeLabel: "结束时间:",
      scrapeStatusLabel: "抓取状态:",
      guestCountLabel: "参与人数:",
      locationLabel: "地点:",
      visibilityLabel: "可见性:",
      description: "描述",
      viewOriginal: "查看原页面",
      close: "关闭",
    },
    buttons: {
      autoScrape: "🤖 自动抓取",
      manualScrape: "👆 手动抓取",
      scraping: "抓取中...",
      stop: "停止",
      nextPage: "下一页",
      retry: "重试",
      export: "导出 CSV",
      reset: "🔄 重置状态",
      completed: "✅ 抓取完成",
      viewDetails: "查看详情",
    },
    messages: {
      noScrapableEvents: "暂无可抓取的活动",
      noDataToExport: "没有数据可导出",
      downloadLimitReached: "今日下载次数已达上限 ({current}/{limit})，请明天再试！",
      page: "页",
      completed: "完成",
      newData: "条新数据",
      deduped: "(去重后)",
      total: "累计",
      waiting: "等待",
      seconds: "秒后继续",
      stopped: "已停止",
      waitingSeconds: "等待",
      secondsAndContinue: "秒后继续...",
      scraped: "共抓取",
      items: "条数据",
      failed: "失败",
      refreshPage: "请手动刷新页面重试",
      extensionReload: "插件需要重新加载",
      extensionUpdated: "扩展已更新，需要重新加载页面",
      ready: "准备中...",
      extensionStorageInvalid: "扩展存储失效，请直接导出CSV",
      possibleReasons: "可能的原因：",
      networkIssue: "网络连接问题",
      apiUnavailable: "API临时不可用",
      authAbnormal: "认证状态异常",
    },
  },
};

const checkIcon = `<svg style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M13.3327 4L5.99935 11.3333L2.66602 8" stroke="#00BC7D" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const noIcon = `<svg style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M12 4L4 12" stroke="#FF637E" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4 4L12 12" stroke="#FF637E" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const keyIcon = `<svg style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M10.6673 14V12.6667C10.6673 11.9594 10.3864 11.2811 9.88627 10.781C9.38617 10.281 8.70789 10 8.00065 10H4.00065C3.29341 10 2.61513 10.281 2.11503 10.781C1.61494 11.2811 1.33398 11.9594 1.33398 12.6667V14" stroke="#FE9A00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.666 2.08545C11.2379 2.2337 11.7443 2.56763 12.1058 3.03482C12.4673 3.50202 12.6635 4.07604 12.6635 4.66678C12.6635 5.25752 12.4673 5.83154 12.1058 6.29874C11.7443 6.76594 11.2379 7.09987 10.666 7.24812" stroke="#FE9A00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14.666 14.0002V12.6669C14.6656 12.0761 14.4689 11.5021 14.1069 11.0351C13.7449 10.5682 13.2381 10.2346 12.666 10.0869" stroke="#FE9A00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.00065 7.33333C7.47341 7.33333 8.66732 6.13943 8.66732 4.66667C8.66732 3.19391 7.47341 2 6.00065 2C4.52789 2 3.33398 3.19391 3.33398 4.66667C3.33398 6.13943 4.52789 7.33333 6.00065 7.33333Z" stroke="#FE9A00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Content language manager
const ContentLanguageManager = {
  getCurrentLang() {
    return localStorage.getItem("luma-scraper-lang") || "en";
  },

  getText(path, lang = null) {
    lang = lang || this.getCurrentLang();
    const keys = path.split(".");
    let text = CONTENT_LANGUAGES[lang];

    for (const key of keys) {
      text = text?.[key];
    }

    return text || path;
  },
};

class LumaDataScraper {
  constructor() {
    this.isRunning = false;
    this.initComplete = false;
    this.extensionValid = true;

    // Authentication
    this.authCookie = null;
    this.authValue = null;
    this.cookieHeader = null;
    this.cookieConsent = false; // Cookie consent status

    // Events data
    this.allEvents = [];

    // Independent scraping status for each event
    this.eventStates = new Map();

    this.init();
  }

  // Safe Chrome API wrapper
  async safeChromeMessage(message) {
    try {
      if (!chrome?.runtime?.sendMessage) {
        throw new Error("Chrome Extension API unavailable");
      }

      if (!chrome.runtime.id) {
        throw new Error("Extension context invalidated");
      }

      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      if (
        error.message.includes("Extension context invalidated") ||
        error.message.includes("Extension context invalidated")
      ) {
        console.log("🔄 Extension context invalidated, attempting re-initialization...");
        this.extensionValid = false;
        this.showExtensionError();
        throw new Error("Extension has been reloaded");
      }
      throw error;
    }
  }

  // Show extension error notification
  showExtensionError() {
    const existingError = document.querySelector("#luma-extension-error");
    if (existingError) return;

    const errorDiv = document.createElement("div");
    errorDiv.id = "luma-extension-error";
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4757;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 400px;
      text-align: center;
    `;

    errorDiv.innerHTML = `
      <div style="margin-bottom: 10px;"><strong>🔄 ${ContentLanguageManager.getText("messages.extensionReload")}</strong></div>
      <div style="margin-bottom: 10px;">${ContentLanguageManager.getText("messages.extensionUpdated")}</div>
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 10000);
  }

  // Initialize the scraper
  async init() {
    console.log("🎯 EventMate initialized on:", window.location.href);

    // 🔒 Security first: Only based on user's explicit consent status, no automatic Cookie detection
    const savedConsent = await this.getCookieConsentFromStorage();

    if (savedConsent === true) {
      // User has explicitly agreed before, continue initialization
      this.cookieConsent = true;
      console.log("✅ Detected user's previous explicit consent");
      await this.continueInit();
    } else if (savedConsent === false) {
      // User has explicitly denied before
      this.cookieConsent = false;
      console.log("⚠️ User previously denied Cookie usage, not showing interface");
    } else {
      // First visit, Cookie consent now handled by popup
      console.log("❓ First visit, need user consent in plugin popup");
      // Don't show Cookie consent interface here, handled by popup
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  // Continue initialization after cookie consent
  async continueInit() {
    try {
      const cookieSuccess = await this.getCookies();
      console.log("Cookie retrieval result:", cookieSuccess);

      await this.initEventsList();

      window.lumaDataScraper = this;
      this.initComplete = true;
      console.log("✅ Luma plugin initialization completed");
    } catch (error) {
      console.error("❌ Luma plugin initialization failed:", error);
      this.initComplete = false;
    }
  }

  // Get cookie consent from chrome storage (now async)
  async getCookieConsentFromStorage() {
    try {
      const result = await chrome.storage.local.get(["cookieConsent"]);
      if (result.cookieConsent === "granted") return true;
      if (result.cookieConsent === "denied") return false;
      return null; // Status not set
    } catch (error) {
      console.log("Cannot read Cookie consent status:", error);
      return null;
    }
  }

  // Check if valid cookie exists without requiring user consent
  async checkExistingCookie() {
    // 🔒 Security fix: Completely remove automatic Cookie detection
    // Should not read any cookies on first visit, must get explicit user consent first
    return false;
  }

  // Save cookie consent to local storage
  async saveCookieConsentToStorage(consent) {
    try {
      const value = consent ? "granted" : "denied";
      await chrome.storage.local.set({ cookieConsent: value });
    } catch (error) {
      console.log("Cannot save Cookie consent status:", error);
    }
  }

  // Clear cookie consent from local storage
  clearCookieConsentFromStorage() {
    try {
      localStorage.removeItem("luma-cookie-consent");
    } catch (error) {
      console.log("Cannot clear Cookie consent status:", error);
    }
  }

  // Show cookie consent dialog
  // Cookie consent is now handled by popup - this function is no longer needed

  // Handle cookie consent response
  async handleCookieConsent(accepted) {
    const consentDiv = document.querySelector("#luma-cookie-consent");

    if (consentDiv) {
      consentDiv.remove();
    }

    if (accepted) {
      this.cookieConsent = true;
      await this.saveCookieConsentToStorage(true); // Always save user choice, but provide ability to re-choose
      console.log("✅ User agreed to Cookie usage");
      await this.continueInit();
    } else {
      this.cookieConsent = false;
      await this.saveCookieConsentToStorage(false); // Explicitly save denial status
      console.log("❌ User denied Cookie usage, not showing interface");
    }
  }

  // Show UI when cookie consent is denied
  // Denied UI is removed - user doesn't want to see it

  // Show cookie consent for scraping action
  // Cookie consent for scraping is now handled by popup - this function is no longer needed

  // Get authentication cookies
  async getCookies() {
    try {
      // Check Cookie consent status
      if (!this.cookieConsent) {
        throw new Error("User has not agreed to Cookie usage");
      }

      if (!this.extensionValid) {
        throw new Error("Extension context invalidated");
      }

      const response = await this.safeChromeMessage({ action: "getCookies" });
      if (response.success) {
        this.authCookie = response.authCookie;
        this.authValue = response.authValue;
        this.cookieHeader = response.cookieHeader;
        console.log("Auth cookie loaded:", {
          domain: response.domain,
          authenticated: true,
          length: this.authValue.length,
        });
        return true;
      } else {
        console.error("Auth cookie not found:", response.error);
        return false;
      }
    } catch (error) {
      console.error("Failed to get auth cookie:", error);

      if (error.message.includes("Extension")) {
        this.extensionValid = false;
      }

      return false;
    }
  }

  // Get or create independent status for event
  getEventState(eventId, eventElement = null) {
    if (!this.eventStates.has(eventId)) {
      this.eventStates.set(eventId, {
        eventId: eventId,
        eventElement: eventElement,
        mode: "auto",
        page: 0,
        visitors: [],
        cursor: null,
        isRunning: false,
        totalVisitors: [],
      });
    }

    // Update eventElement if a new one is provided
    if (eventElement) {
      this.eventStates.get(eventId).eventElement = eventElement;
    }

    return this.eventStates.get(eventId);
  }

  // Clear event state
  clearEventState(eventId) {
    this.eventStates.delete(eventId);
  }

  // Initialize events list UI
  async initEventsList() {
    if (!this.authValue) {
      console.log("❌ No auth token, skipping events list initialization");
      this.createFallbackUI();
      return;
    }

    console.log("🔄 Initializing events list...");

    try {
      const userEvents = await this.getUserEvents();
      if (!userEvents) {
        console.log("❌ No response from API");
        this.createFallbackUI();
        return;
      }

      if (!userEvents.events) {
        console.log("❌ No events array in response:", userEvents);
        this.createFallbackUI();
        return;
      }

      const allEvents = userEvents.events.map((item) => {
        const event = item.event || item; // Handle nested event data structure
        return {
          ...event,
          canScrape: event.show_guest_list === true && event.virtual_info?.has_access === true,
        };
      });

      this.allEvents = allEvents;
      this.createEventsListUI(allEvents);
    } catch (error) {
      console.error("❌ Error in initEventsList:", error);
      this.createFallbackUI();
    }
  }

  // Create events list UI
  createEventsListUI(events) {
    const container = document.createElement("div");
    container.id = "luma-scraper-events-container";
    container.innerHTML = `
      <div class="luma-scraper-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M9.09 4H29V3C29 2.46957 28.7893 1.96086 28.4142 1.58579C28.0391 1.21071 27.5304 1 27 1H9C7.4087 1 5.88258 1.63214 4.75736 2.75736C3.63214 3.88258 3 5.4087 3 7V25C3 26.5913 3.63214 28.1174 4.75736 29.2426C5.88258 30.3679 7.4087 31 9 31H27C27.5304 31 28.0391 30.7893 28.4142 30.4142C28.7893 30.0391 29 29.5304 29 29V10C29 9.46957 28.7893 8.96086 28.4142 8.58579C28.0391 8.21071 27.5304 8 27 8H9.09C8.81988 8.01217 8.5501 7.96944 8.29697 7.87439C8.04383 7.77934 7.8126 7.63395 7.61724 7.44701C7.42188 7.26007 7.26646 7.03545 7.16037 6.78674C7.05428 6.53803 6.99973 6.27039 7 6C6.99973 5.72961 7.05428 5.46197 7.16037 5.21326C7.26646 4.96455 7.42188 4.73993 7.61724 4.55299C7.8126 4.36605 8.04383 4.22066 8.29697 4.12561C8.5501 4.03056 8.81988 3.98783 9.09 4ZM13.64 13.59C14.3601 13.5895 15.064 13.8032 15.6623 14.2038C16.2606 14.6045 16.7263 15.174 17 15.84C17.2737 15.174 17.7394 14.6045 18.3377 14.2038C18.936 13.8032 19.6399 13.5895 20.36 13.59C21.3573 13.6801 22.2845 14.141 22.9585 14.8816C23.6324 15.6222 24.0041 16.5887 24 17.59C24 21.98 18 25.59 17 25.59C16 25.59 10 22.01 10 17.59C9.99594 16.5887 10.3676 15.6222 11.0415 14.8816C11.7155 14.141 12.6427 13.6801 13.64 13.59Z" fill="white"/>
          </svg>
          ${ContentLanguageManager.getText("title")}
        </h3>
        <div class="luma-status">
          ✅ ${ContentLanguageManager.getText("status.authenticated")} | ${ContentLanguageManager.getText("status.found")} ${events.filter((e) => e.canScrape).length}/${events.length} ${ContentLanguageManager.getText("status.scrappable")}
        </div>
        <div class="luma-cookie-status" style="font-size: 11px; opacity: 0.8;">
          🍪 ${ContentLanguageManager.getText("status.cookieAuthorized")}
        </div>
      </div>
      <div class="luma-events-list" id="luma-events-list">
        ${events.length === 0 ? `<div class="no-events">${ContentLanguageManager.getText("messages.noScrapableEvents")}</div>` : ""}
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = this.getUIStyles();

    document.head.appendChild(style);
    document.body.appendChild(container);

    this.addMinimizeButton(container);
    this.populateEventsList(events);
  }

  // Get UI styles
  getUIStyles() {
    return `
      #luma-scraper-events-container {
        position: fixed;
        top: 40px;
        right: 20px;
        width: 400px;
        max-height: 80vh;
        background: white;
        border: 2px solid #667eea;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
      }
      .luma-scraper-header {
        background: linear-gradient(90deg, #8EC5FF 0%, #51A2FF 100%);
        color: white;
        padding: 16px 20px;
      }
      .luma-scraper-header h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        line-height: 36px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .luma-status {
        font-size: 12px;
        opacity: 0.9;
      }
      .luma-events-list {
        padding: 16px;
        max-height: 60vh;
        overflow-y: auto;
      }
      .luma-event-item {
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        transition: all 0.3s ease;
        background: white;
      }
      .luma-event-item:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-color: #667eea;
      }
      .luma-event-name {
        font-weight: 600;
        color: #2d3436;
        margin-bottom: 8px;
        font-size: 14px;
      }
      .luma-event-info {
        font-size: 12px;
        color: #636e72;
        margin-bottom: 12px;
      }
      .luma-event-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .luma-scrape-mode {
        display: flex;
        gap: 4px;
      }
      .luma-mode-btn {
        flex: 1;
        padding: 4px 8px;
        border: 1px solid #667eea;
        background: white;
        color: #667eea;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .luma-mode-btn.active {
        background: #667eea;
        color: white;
      }
      .luma-btn-row {
        display: flex;
        gap: 8px;
      }
      .luma-btn {
        flex: 1;
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      /* 自动抓取按钮 */
      .scrape-auto-btn {
        background: #51A2FF !important;
        color: #FFFFFF !important;
      }
      .scrape-auto-btn:hover {
        background: #2C7FFF !important;
        transform: translateY(-1px);
      }

      /* 手动抓取按钮 */
      .scrape-manual-btn {
        background: #46ECD5 !important;
        color: #005F5A !important;
      }
      .scrape-manual-btn:hover {
        background: #00D5BE !important;
        transform: translateY(-1px);
      }

      /* 查看历史/查看详情按钮 */
      .view-btn {
        background: #FFB036 !important;
        color: #000 !important;
      }
      .view-btn:hover {
        background: #FF9C03 !important;
        transform: translateY(-1px);
      }

      /* 清除数据/重置按钮 */
      .reset-btn {
        background: #FFCCD3 !important;
        color: #C70036 !important;
      }
      .reset-btn:hover {
        background: #D9ADB3 !important;
        transform: translateY(-1px);
      }

      /* 无法抓取按钮 */
      .luma-btn-disabled {
        background: #E2E8F0 !important;
        color: #62748E !important;
        cursor: not-allowed;
        opacity: 1 !important;
      }

      /* 其他按钮保持原有样式类名但颜色更新 */
      .luma-btn-primary {
        background: #667eea;
        color: white;
      }
      .luma-btn-primary:hover {
        background: #5a6fd8;
        transform: translateY(-1px);
      }
      .luma-btn-warning {
        background: #FFB036;
        color: #000000;
      }
      .luma-btn-warning:hover {
        background: #FFB036;
      }
      .luma-btn-success {
        background: #28a745;
        color: white;
      }
      .luma-btn-success:hover {
        background: #218838;
      }
      .luma-btn-danger {
        background: #dc3545;
        color: white;
      }
      .luma-btn-danger:hover {
        background: #c82333;
      }
      .luma-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }
      .luma-progress {
        display: none;
        margin-top: 8px;
        padding: 8px;
        background: #f8f9fa;
        border-radius: 4px;
        font-size: 11px;
      }
      .luma-progress.active {
        display: block;
      }
      .luma-progress-bar {
        width: 100%;
        height: 4px;
        background: #e9ecef;
        border-radius: 2px;
        overflow: hidden;
        margin-top: 4px;
      }
      .luma-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #8EC5FF, #51A2FF);
        width: 0%;
        transition: width 0.3s ease;
      }
      .luma-manual-controls {
        margin-top: 8px;
      }
      .no-events {
        text-align: center;
        color: #636e72;
        font-style: italic;
        padding: 20px;
      }
      .luma-minimize-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }
      .luma-minimize-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      #luma-scraper-events-container.minimized {
        width: 60px;
        height: 60px;
        cursor: move;
      }
      #luma-scraper-events-container.minimized .luma-scraper-header {
        padding: 18px;
        text-align: center;
        cursor: move;
      }
      #luma-scraper-events-container.minimized .luma-scraper-header:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6b4a8a 100%);
      }
      #luma-scraper-events-container.minimized h3 {
        display: none;
      }
      #luma-scraper-events-container.minimized .luma-status {
        display: none;
      }
      #luma-scraper-events-container.minimized .luma-cookie-status {
        display: none;
      }
      #luma-scraper-events-container.minimized .luma-events-list {
        display: none;
      }
      #luma-scraper-events-container.minimized .luma-minimize-btn {
        position: static;
        margin: 0 auto;
      }
    `;
  }

  // Add minimize button and drag functionality
  addMinimizeButton(container) {
    const minimizeBtn = document.createElement("button");
    minimizeBtn.className = "luma-minimize-btn";
    minimizeBtn.textContent = "−";
    minimizeBtn.addEventListener("click", () => {
      container.classList.toggle("minimized");
      minimizeBtn.textContent = container.classList.contains("minimized") ? "+" : "−";
    });
    container.querySelector(".luma-scraper-header").appendChild(minimizeBtn);

    // Add drag functionality
    this.addDragFunctionality(container);
  }

  // Add drag functionality to container
  addDragFunctionality(container) {
    const header = container.querySelector(".luma-scraper-header");
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // Try to restore previous position from localStorage
    const savedPosition = localStorage.getItem("luma-scraper-position");
    if (savedPosition) {
      const { x, y } = JSON.parse(savedPosition);
      xOffset = x;
      yOffset = y;
      currentX = x;
      currentY = y;
      container.style.transform = `translate(${x}px, ${y}px)`;
    }

    const savePosition = () => {
      localStorage.setItem("luma-scraper-position", JSON.stringify({ x: currentX, y: currentY }));
    };

    const dragStart = (e) => {
      if (e.target.classList.contains("luma-minimize-btn")) {
        return; // Don't drag when clicking minimize button
      }

      const clientX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
      const clientY = e.type === "mousedown" ? e.clientY : e.touches[0].clientY;

      initialX = clientX - xOffset;
      initialY = clientY - yOffset;

      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
        container.style.transition = "none";
        container.style.userSelect = "none";
      }
    };

    const dragEnd = () => {
      if (isDragging) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        container.style.transition = "";
        container.style.userSelect = "";
        savePosition();
      }
    };

    const drag = (e) => {
      if (isDragging) {
        e.preventDefault();

        const clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === "mousemove" ? e.clientY : e.touches[0].clientY;

        currentX = clientX - initialX;
        currentY = clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        // Constrain to viewport
        const rect = container.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));

        container.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    };

    // Mouse events
    header.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    // Touch events for mobile
    header.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", dragEnd);

    // Prevent text selection during drag
    header.addEventListener("selectstart", (e) => {
      if (isDragging) e.preventDefault();
    });
  }

  // Populate events list
  populateEventsList(events) {
    const listContainer = document.getElementById("luma-events-list");

    events.forEach((event) => {
      const eventItem = document.createElement("div");
      eventItem.className = "luma-event-item";

      const startDate = new Date(event.start_at).toLocaleString();
      const location =
        event.location_type === "offline"
          ? event.geo_address_info?.city || ContentLanguageManager.getText("events.offline")
          : event.location_type;

      const accessStatus = event.canScrape
        ? `${checkIcon} ${ContentLanguageManager.getText("events.guestListVisible")} | ${keyIcon} ${ContentLanguageManager.getText("events.hasAccess")}`
        : event.show_guest_list
          ? `${checkIcon} ${ContentLanguageManager.getText("events.guestListVisible")} | ${noIcon} ${ContentLanguageManager.getText("events.noAccess")}`
          : `${noIcon} ${ContentLanguageManager.getText("events.guestListHidden")}`;

      eventItem.innerHTML = `
        <div class="luma-event-name">${event.name}</div>
        <div class="luma-event-info">
        <svg style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M5.33398 1.3335V4.00016" stroke="#45556C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10.666 1.3335V4.00016" stroke="#45556C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.6667 2.6665H3.33333C2.59695 2.6665 2 3.26346 2 3.99984V13.3332C2 14.0696 2.59695 14.6665 3.33333 14.6665H12.6667C13.403 14.6665 14 14.0696 14 13.3332V3.99984C14 3.26346 13.403 2.6665 12.6667 2.6665Z" stroke="#45556C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 6.6665H14" stroke="#45556C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
        </svg> ${startDate}<br>
        <svg style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.3327 6.66683C13.3327 9.9955 9.64002 13.4622 8.40002 14.5328C8.2845 14.6197 8.14388 14.6667 7.99935 14.6667C7.85482 14.6667 7.7142 14.6197 7.59868 14.5328C6.35868 13.4622 2.66602 9.9955 2.66602 6.66683C2.66602 5.25234 3.22792 3.89579 4.22811 2.89559C5.22831 1.8954 6.58486 1.3335 7.99935 1.3335C9.41384 1.3335 10.7704 1.8954 11.7706 2.89559C12.7708 3.89579 13.3327 5.25234 13.3327 6.66683Z" stroke="#45556C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 8.6665C9.10457 8.6665 10 7.77107 10 6.6665C10 5.56193 9.10457 4.6665 8 4.6665C6.89543 4.6665 6 5.56193 6 6.6665C6 7.77107 6.89543 8.6665 8 8.6665Z" stroke="#45556C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
        </svg> ${location}<br>
        <svg style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1.33398 6.00016C1.86442 6.00016 2.37313 6.21088 2.7482 6.58595C3.12327 6.96102 3.33398 7.46973 3.33398 8.00016C3.33398 8.5306 3.12327 9.0393 2.7482 9.41438C2.37313 9.78945 1.86442 10.0002 1.33398 10.0002V11.3335C1.33398 11.6871 1.47446 12.0263 1.72451 12.2763C1.97456 12.5264 2.3137 12.6668 2.66732 12.6668H13.334C13.6876 12.6668 14.0267 12.5264 14.2768 12.2763C14.5268 12.0263 14.6673 11.6871 14.6673 11.3335V10.0002C14.1369 10.0002 13.6282 9.78945 13.2531 9.41438C12.878 9.0393 12.6673 8.5306 12.6673 8.00016C12.6673 7.46973 12.878 6.96102 13.2531 6.58595C13.6282 6.21088 14.1369 6.00016 14.6673 6.00016V4.66683C14.6673 4.31321 14.5268 3.97407 14.2768 3.72402C14.0267 3.47397 13.6876 3.3335 13.334 3.3335H2.66732C2.3137 3.3335 1.97456 3.47397 1.72451 3.72402C1.47446 3.97407 1.33398 4.31321 1.33398 4.66683V6.00016Z" stroke="#FE9A00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8.66602 3.3335V4.66683" stroke="#FE9A00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8.66602 11.3335V12.6668" stroke="#FE9A00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8.66602 7.3335V8.66683" stroke="#FE9A00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
        </svg> ${event.visibility} | <span class="event-access-text">${accessStatus}</span>
        </div>
        ${
          event.canScrape
            ? `
        <div class="luma-event-actions">
          <div class="luma-btn-row">
            <button class="luma-btn luma-btn-primary scrape-auto-btn" data-event-id="${event.api_id}" data-mode="auto">
              ${ContentLanguageManager.getText("buttons.autoScrape")}
            </button>
            <button class="luma-btn luma-btn-success scrape-manual-btn" data-event-id="${event.api_id}" data-mode="manual">
              ${ContentLanguageManager.getText("buttons.manualScrape")}
            </button>
          </div>
          <div class="luma-btn-row" style="margin-top: 8px;">
            <button class="luma-btn luma-btn-warning view-btn" data-event-id="${event.api_id}">
              ${ContentLanguageManager.getText("buttons.viewDetails")}
            </button>
            <button class="luma-btn luma-btn-danger stop-btn" data-event-id="${event.api_id}" style="display: none;">
              ${ContentLanguageManager.getText("buttons.stop")}
            </button>
          </div>
          <div class="luma-manual-controls" style="display: none;">
            <div class="luma-btn-row" style="margin-top: 8px;">
              <button class="luma-btn luma-btn-success next-page-btn" data-event-id="${event.api_id}">
                ${ContentLanguageManager.getText("buttons.nextPage")}
              </button>
            </div>
          </div>
        </div>
        `
            : `
        <div class="luma-event-actions">
          <div class="luma-btn-row">
            <button class="luma-btn luma-btn-disabled" disabled>
              ${ContentLanguageManager.getText("events.noAccess")}
            </button>
            <button class="luma-btn luma-btn-warning view-btn" data-event-id="${event.api_id}">
              ${ContentLanguageManager.getText("buttons.viewDetails")}
            </button>
          </div>
        </div>
        `
        }
        <div class="luma-progress" id="progress-${event.api_id}">
          <div class="progress-text">${ContentLanguageManager.getText("messages.ready")}</div>
          <div class="luma-progress-bar">
            <div class="luma-progress-fill"></div>
          </div>
          <div class="progress-stats" style="font-size: 11px; margin-top: 4px; color: #666;">
            ${ContentLanguageManager.getText("messages.page")}: <span class="page-count">0</span> | ${ContentLanguageManager.getText("messages.items")}: <span class="data-count">0</span>
          </div>
        </div>
      `;

      listContainer.appendChild(eventItem);
      this.bindEventHandlers(eventItem, event);
    });
  }

  // Bind event handlers
  bindEventHandlers(eventItem, event) {
    const scrapeAutoBtn = eventItem.querySelector(".scrape-auto-btn");
    const scrapeManualBtn = eventItem.querySelector(".scrape-manual-btn");
    const viewBtn = eventItem.querySelector(".view-btn");
    const nextPageBtn = eventItem.querySelector(".next-page-btn");
    const stopBtn = eventItem.querySelector(".stop-btn");

    // Auto scrape button
    if (scrapeAutoBtn) {
      scrapeAutoBtn.addEventListener("click", () => {
        this.startEventScraping(event.api_id, eventItem, "auto");
      });
    }

    // Manual scrape button
    if (scrapeManualBtn) {
      scrapeManualBtn.addEventListener("click", () => {
        this.startEventScraping(event.api_id, eventItem, "manual");
      });
    }

    // View details button
    if (viewBtn) {
      viewBtn.addEventListener("click", () => {
        this.showEventDetails(event);
      });
    }

    // Next page button
    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", () => {
        this.manualNextPage(event.api_id, eventItem);
      });
    }

    // Stop scraping button
    if (stopBtn) {
      stopBtn.addEventListener("click", () => {
        this.stopScraping(event.api_id, eventItem);
      });
    }
  }

  // Start event scraping
  async startEventScraping(eventApiId, eventElement, mode = "auto") {
    console.log(`🚀 Starting to scrape event ${eventApiId}, mode: ${mode}`);

    try {
      // Check daily download limit first
      const limitResponse = await chrome.runtime.sendMessage({ action: "checkDownloadLimit" });
      if (!limitResponse.allowed) {
        const limitMessage = ContentLanguageManager.getText("messages.downloadLimitReached")
          .replace("{limit}", limitResponse.limit || 10)
          .replace("{current}", limitResponse.currentCount || 0);
        alert(limitMessage);
        console.log("❌ Daily download limit reached, scraping blocked");
        return;
      }
      
      console.log(`✅ Download limit check passed: ${limitResponse.currentCount}/${limitResponse.limit} used, ${limitResponse.remaining} remaining`);

      // Check Cookie consent status
      if (!this.cookieConsent) {
        console.log("⚠️ Cookie permission required to scrape, please authorize in plugin popup");
        throw new Error("Cookie permission required to scrape, please authorize in plugin popup");
      }

      if (!this.extensionValid) {
        throw new Error("Extension context invalidated");
      }

      // Re-validate Cookie permissions
      const cookieSuccess = await this.getCookies();
      if (!cookieSuccess) {
        throw new Error("Cookie permission validation failed");
      }

      const progressEl = eventElement.querySelector(".luma-progress");
      const scrapeAutoBtn = eventElement.querySelector(".scrape-auto-btn");
      const scrapeManualBtn = eventElement.querySelector(".scrape-manual-btn");
      const stopBtn = eventElement.querySelector(".stop-btn");
      const manualControls = eventElement.querySelector(".luma-manual-controls");

      // Get independent event status
      const eventState = this.getEventState(eventApiId, eventElement);
      eventState.mode = mode;
      eventState.page = 0;
      eventState.visitors = [];
      eventState.isRunning = true;
      eventState.cursor = null;

      progressEl.classList.add("active");

      // Disable scrape buttons, show stop button
      if (scrapeAutoBtn) {
        scrapeAutoBtn.disabled = true;
        scrapeAutoBtn.textContent =
          mode === "auto"
            ? ContentLanguageManager.getText("buttons.scraping")
            : ContentLanguageManager.getText("buttons.autoScrape");
      }
      if (scrapeManualBtn) {
        scrapeManualBtn.disabled = true;
        scrapeManualBtn.textContent =
          mode === "manual"
            ? ContentLanguageManager.getText("buttons.scraping")
            : ContentLanguageManager.getText("buttons.manualScrape");
      }

      stopBtn.style.display = "inline-block";

      if (mode === "manual") {
        manualControls.style.display = "block";
      }

      await this.fetchNextPage(eventApiId);
    } catch (error) {
      console.error("Event scraping failed:", error);

      const progressText = eventElement.querySelector(".progress-text");
      const scrapeAutoBtn = eventElement.querySelector(".scrape-auto-btn");
      const scrapeManualBtn = eventElement.querySelector(".scrape-manual-btn");
      const stopBtn = eventElement.querySelector(".stop-btn");

      if (progressText) {
        progressText.textContent = `${ContentLanguageManager.getText("messages.failed")}: ${error.message}`;
      }

      // Reset button status
      if (scrapeAutoBtn) {
        scrapeAutoBtn.textContent = ContentLanguageManager.getText("buttons.autoScrape");
        scrapeAutoBtn.disabled = false;
        scrapeAutoBtn.style.background = "#dc3545";
      }
      if (scrapeManualBtn) {
        scrapeManualBtn.textContent = ContentLanguageManager.getText("buttons.manualScrape");
        scrapeManualBtn.disabled = false;
        scrapeManualBtn.style.background = "#dc3545";
      }
      if (stopBtn) {
        stopBtn.style.display = "none";
      }

      this.isRunning = false;

      if (error.message.includes("Extension")) {
        this.showExtensionError();
      }
    }
  }

  // Fetch next page of visitor data
  async fetchNextPage(eventId) {
    const eventState = this.getEventState(eventId);

    if (!eventState.isRunning) {
      console.log("❌ Scraping has been stopped");
      return;
    }

    if (!this.authValue || !this.cookieHeader) {
      console.log("❌ Authentication failed");
      const cookieSuccess = await this.getCookies();
      if (!cookieSuccess) {
        console.log("❌ Cookie re-retrieval failed, stopping scrape");
        this.stopScraping(eventId, eventState.eventElement);
        return;
      }
      console.log("✅ Cookie re-retrieval successful, continuing scrape");
    }

    if (!eventId) {
      console.log("❌ Invalid event ID");
      return;
    }

    const progressText = eventState.eventElement.querySelector(".progress-text");
    const progressFill = eventState.eventElement.querySelector(".luma-progress-fill");
    const pageCountEl = eventState.eventElement.querySelector(".page-count");
    const dataCountEl = eventState.eventElement.querySelector(".data-count");

    eventState.page++;
    progressText.textContent = `${ContentLanguageManager.getText("messages.page")} ${eventState.page}...`;

    try {
      const baseUrl = "https://api2.luma.com/event/get-guest-list";
      const url = new URL(baseUrl);
      url.searchParams.set("event_api_id", eventId);
      url.searchParams.set("pagination_limit", "100");

      if (eventState.cursor) {
        url.searchParams.set("pagination_cursor", eventState.cursor);
      }

      const headers = {
        accept: "application/json",
        "accept-language": "zh",
        cookie: this.cookieHeader,
        origin: "https://luma.com",
        referer: "https://luma.com/",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "x-luma-client-type": "luma-web",
        "x-luma-web-url": "https://luma.com/home",
      };

      console.log(`📡 API call: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📄 Page ${eventState.page} response:`, data);

      let pageVisitors = [];
      let rawEntries = [];

      if (data.entries && Array.isArray(data.entries)) {
        rawEntries = data.entries;
      } else if (data.guests && Array.isArray(data.guests)) {
        rawEntries = data.guests;
      } else if (data.data && Array.isArray(data.data)) {
        rawEntries = data.data;
      }

      if (rawEntries.length > 0) {
        pageVisitors = rawEntries
          .map((entry) => {
            const user = entry.user || entry.guest || entry;

            if (!user || !user.api_id) {
              return null;
            }

            return {
              api_id: user.api_id,
              event_api_id: eventState.eventId,
              name: user.name,
              username: user.username,
              website: user.website,
              timezone: user.timezone,
              bio_short: user.bio_short,
              avatar_url: user.avatar_url,
              is_verified: user.is_verified,
              last_online_at: user.last_online_at,
              twitter_handle: user.twitter_handle,
              youtube_handle: user.youtube_handle,
              linkedin_handle: user.linkedin_handle,
              instagram_handle: user.instagram_handle,
              created_at: entry.created_at || user.created_at,
              updated_at: entry.updated_at || user.updated_at,
            };
          })
          .filter((v) => v !== null);
      }

      // Add deduplication logic, deduplicate by api_id
      const existingIds = new Set(eventState.totalVisitors.map((v) => v.api_id));
      const newVisitors = pageVisitors.filter((v) => !existingIds.has(v.api_id));
      eventState.totalVisitors = [...eventState.totalVisitors, ...newVisitors];

      pageCountEl.textContent = eventState.page;
      dataCountEl.textContent = eventState.totalVisitors.length;
      progressText.textContent = `${ContentLanguageManager.getText("messages.page")} ${eventState.page} ${ContentLanguageManager.getText("messages.completed")}, ${newVisitors.length} ${ContentLanguageManager.getText("messages.newData")} ${ContentLanguageManager.getText("messages.deduped")}`;
      progressFill.style.width = Math.min((eventState.page / 10) * 100, 90) + "%";

      console.log(
        `✅ Page ${eventState.page} completed, ${pageVisitors.length} items on this page, ${newVisitors.length} new items, ${eventState.totalVisitors.length} total`,
      );

      eventState.cursor = data.next_cursor || data.pagination_cursor || data.cursor;
      const hasMore = !!eventState.cursor && pageVisitors.length > 0;

      if (hasMore && eventState.mode === "auto") {
        const delay = Math.floor(Math.random() * 3000) + 3000; // 3-6 second random delay
        progressText.textContent = `${ContentLanguageManager.getText("messages.waitingSeconds")} ${Math.ceil(delay / 1000)} ${ContentLanguageManager.getText("messages.secondsAndContinue")}`;

        setTimeout(() => {
          this.fetchNextPage(eventId);
        }, delay);
      } else if (hasMore && eventState.mode === "manual") {
        progressText.textContent = `${ContentLanguageManager.getText("messages.page")} ${eventState.page} ${ContentLanguageManager.getText("messages.completed")}, click '${ContentLanguageManager.getText("buttons.nextPage")}' to continue`;
        const nextBtn = eventState.eventElement.querySelector(".next-page-btn");
        nextBtn.disabled = false;
        nextBtn.textContent = ContentLanguageManager.getText("buttons.nextPage");
      } else {
        await this.completeScraping(eventId);
      }
    } catch (error) {
      console.error(`❌ Page ${eventState.page} scraping failed:`, error);
      progressText.textContent = `${ContentLanguageManager.getText("messages.page")} ${eventState.page} ${ContentLanguageManager.getText("messages.failed")}: ${error.message}`;

      if (eventState.mode === "manual") {
        const nextBtn = eventState.eventElement.querySelector(".next-page-btn");
        nextBtn.disabled = false;
        nextBtn.textContent = ContentLanguageManager.getText("buttons.retry");
      }
    }
  }

  // Manual next page
  async manualNextPage(eventApiId, eventElement) {
    const nextBtn = eventElement.querySelector(".next-page-btn");
    nextBtn.disabled = true;
    nextBtn.textContent = ContentLanguageManager.getText("buttons.scraping");

    await this.fetchNextPage(eventApiId);
  }

  // Stop scraping
  stopScraping(eventApiId, eventElement) {
    console.log(`⏹️ Stop scraping event ${eventApiId}`);

    const eventState = this.getEventState(eventApiId, eventElement);
    eventState.isRunning = false;

    if (!eventElement) {
      console.log("⚠️ eventElement is empty, cannot update UI");
      return;
    }

    const progressText = eventElement.querySelector(".progress-text");
    const scrapeAutoBtn = eventElement.querySelector(".scrape-auto-btn");
    const scrapeManualBtn = eventElement.querySelector(".scrape-manual-btn");
    const stopBtn = eventElement.querySelector(".stop-btn");
    const manualControls = eventElement.querySelector(".luma-manual-controls");

    if (progressText) {
      progressText.textContent = `${ContentLanguageManager.getText("messages.stopped")} (${ContentLanguageManager.getText("messages.scraped")} ${eventState.totalVisitors ? eventState.totalVisitors.length : 0} ${ContentLanguageManager.getText("messages.items")})`;
    }

    // Reset button status and add reset button
    if (scrapeAutoBtn) {
      scrapeAutoBtn.textContent = ContentLanguageManager.getText("buttons.autoScrape");
      scrapeAutoBtn.disabled = true;
      scrapeAutoBtn.style.background = "#6c757d";
    }
    if (scrapeManualBtn) {
      scrapeManualBtn.textContent = ContentLanguageManager.getText("buttons.manualScrape");
      scrapeManualBtn.disabled = true;
      scrapeManualBtn.style.background = "#6c757d";
    }
    if (stopBtn) {
      stopBtn.style.display = "none";
    }

    // Add reset button
    this.addResetButton(eventElement, eventApiId);

    if (manualControls) {
      manualControls.style.display = "none";
    }

    if (eventState.totalVisitors && eventState.totalVisitors.length > 0) {
      this.completeScraping(eventApiId);
    }
  }

  // Complete scraping
  async completeScraping(eventId) {
    const eventState = this.getEventState(eventId);
    console.log(`🎉 Scraping completed! Got ${eventState.totalVisitors.length} guest data items`);

    const progressText = eventState.eventElement.querySelector(".progress-text");
    const progressFill = eventState.eventElement.querySelector(".luma-progress-fill");
    const scrapeAutoBtn = eventState.eventElement.querySelector(".scrape-auto-btn");
    const scrapeManualBtn = eventState.eventElement.querySelector(".scrape-manual-btn");
    const stopBtn = eventState.eventElement.querySelector(".stop-btn");
    const manualControls = eventState.eventElement.querySelector(".luma-manual-controls");

    progressText.textContent = `${ContentLanguageManager.getText("messages.completed")}! ${ContentLanguageManager.getText("messages.total")} ${eventState.totalVisitors.length} ${ContentLanguageManager.getText("messages.items")}`;
    progressFill.style.width = "100%";

    // Update button status
    if (scrapeAutoBtn) {
      scrapeAutoBtn.textContent = ContentLanguageManager.getText("buttons.completed");
      scrapeAutoBtn.style.background = "#28a745";
      scrapeAutoBtn.disabled = true;
    }
    if (scrapeManualBtn) {
      scrapeManualBtn.textContent = ContentLanguageManager.getText("buttons.completed");
      scrapeManualBtn.style.background = "#28a745";
      scrapeManualBtn.disabled = true;
    }
    if (stopBtn) {
      stopBtn.style.display = "none";
    }
    manualControls.style.display = "none";

    eventState.isRunning = false;

    if (eventState.totalVisitors.length > 0) {
      try {
        if (!this.extensionValid) {
          throw new Error("Extension context invalidated, cannot save to extension storage");
        }

        await this.safeChromeMessage({
          action: "saveData",
          data: {
            source: "api",
            event_api_id: eventState.eventId,
            data: eventState.totalVisitors,
            timestamp: Date.now(),
            url: window.location.href,
            total_visitors: eventState.totalVisitors.length,
            pages_scraped: eventState.page,
            mode: eventState.mode,
          },
        });

        console.log("✅ Data saved to local storage");
        this.addExportButton(eventState.eventElement, eventState.totalVisitors, eventState.eventId);
        this.addResetButton(eventState.eventElement, eventState.eventId);
      } catch (error) {
        console.error("❌ Save data failed:", error);

        if (error.message.includes("Extension")) {
          progressText.textContent = `${ContentLanguageManager.getText("messages.completed")}! ${ContentLanguageManager.getText("messages.extensionStorageInvalid")}`;
          this.addExportButton(
            eventState.eventElement,
            eventState.totalVisitors,
            eventState.eventId,
          );
          this.addResetButton(eventState.eventElement, eventState.eventId);
        } else {
          progressText.textContent = `${ContentLanguageManager.getText("messages.completed")} but save ${ContentLanguageManager.getText("messages.failed")}: ${error.message}`;
        }
      }
    }
  }

  // Add export button
  addExportButton(eventElement, visitors, eventId) {
    const actionsRow = eventElement.querySelector(".luma-btn-row");

    if (actionsRow.querySelector(".export-btn")) {
      return;
    }

    const exportBtn = document.createElement("button");
    exportBtn.className = "luma-btn luma-btn-success export-btn";
    exportBtn.textContent = `${ContentLanguageManager.getText("buttons.export")} (${visitors.length}${ContentLanguageManager.getText("messages.items")})`;
    exportBtn.style.marginTop = "8px";
    exportBtn.style.width = "100%";

    exportBtn.addEventListener("click", () => {
      this.exportToCSV(visitors, eventId);
    });

    actionsRow.parentNode.appendChild(exportBtn);
  }

  // Add reset button
  addResetButton(eventElement, eventApiId) {
    const actionsContainer = eventElement.querySelector(".luma-event-actions");

    // Check if reset button already exists
    if (actionsContainer.querySelector(".reset-btn")) {
      return;
    }

    const resetBtn = document.createElement("button");
    resetBtn.className = "luma-btn luma-btn-secondary reset-btn";
    resetBtn.textContent = ContentLanguageManager.getText("buttons.reset");
    resetBtn.style.cssText = `
      margin-top: 8px;
      width: 100%;
      background: #17a2b8;
      color: white;
    `;

    resetBtn.addEventListener("click", () => {
      this.resetEventState(eventApiId, eventElement);
    });

    actionsContainer.appendChild(resetBtn);
  }

  // Reset event state to initial condition
  resetEventState(eventApiId, eventElement) {
    console.log(`🔄 Reset event status: ${eventApiId}`);

    // Clear event state
    this.clearEventState(eventApiId);

    // Reset UI elements
    const progressEl = eventElement.querySelector(".luma-progress");
    const progressText = eventElement.querySelector(".progress-text");
    const progressFill = eventElement.querySelector(".luma-progress-fill");
    const pageCountEl = eventElement.querySelector(".page-count");
    const dataCountEl = eventElement.querySelector(".data-count");
    const scrapeAutoBtn = eventElement.querySelector(".scrape-auto-btn");
    const scrapeManualBtn = eventElement.querySelector(".scrape-manual-btn");
    const stopBtn = eventElement.querySelector(".stop-btn");
    const manualControls = eventElement.querySelector(".luma-manual-controls");
    const resetBtn = eventElement.querySelector(".reset-btn");
    const exportBtn = eventElement.querySelector(".export-btn");

    // Hide progress bar
    if (progressEl) {
      progressEl.classList.remove("active");
    }

    // Reset progress text and fill
    if (progressText) {
      progressText.textContent = ContentLanguageManager.getText("messages.ready");
    }
    if (progressFill) {
      progressFill.style.width = "0%";
    }
    if (pageCountEl) {
      pageCountEl.textContent = "0";
    }
    if (dataCountEl) {
      dataCountEl.textContent = "0";
    }

    // Reset button status
    if (scrapeAutoBtn) {
      scrapeAutoBtn.textContent = ContentLanguageManager.getText("buttons.autoScrape");
      scrapeAutoBtn.disabled = false;
      scrapeAutoBtn.style.background = "";
    }
    if (scrapeManualBtn) {
      scrapeManualBtn.textContent = ContentLanguageManager.getText("buttons.manualScrape");
      scrapeManualBtn.disabled = false;
      scrapeManualBtn.style.background = "";
    }
    if (stopBtn) {
      stopBtn.style.display = "none";
    }
    if (manualControls) {
      manualControls.style.display = "none";
    }

    // Remove reset and export buttons
    if (resetBtn) {
      resetBtn.remove();
    }
    if (exportBtn) {
      exportBtn.remove();
    }

    console.log("✅ Event status reset to initial state");
  }

  // Export to CSV
  async exportToCSV(visitors, eventId, eventName = null) {
    if (!visitors || visitors.length === 0) {
      alert(ContentLanguageManager.getText("messages.noDataToExport"));
      return;
    }

    // If no event name provided, try to find from allEvents
    if (!eventName && this.allEvents) {
      const event = this.allEvents.find((e) => e.api_id === eventId);
      eventName = event ? event.name : null;
    }

    const headers = [
      "name",
      "username",
      "api_id",
      "website",
      "timezone",
      "bio_short",
      "is_verified",
      "last_online_at",
      "twitter_handle",
      "youtube_handle",
      "linkedin_handle",
      "instagram_handle",
      "avatar_url",
      "created_at",
      "updated_at",
    ];

    const csvContent = [
      headers.join(","),
      ...visitors.map((visitor) =>
        headers
          .map((header) => {
            const value = visitor[header] || "";
            if (value.toString().includes(",") || value.toString().includes('"')) {
              return `"${value.toString().replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Generate filename
    const now = new Date();
    const dateTime =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "_" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    // Clean meeting name, remove characters unsuitable for filenames
    const cleanEventName = eventName
      ? eventName.replace(/[<>:"/\\|?*]/g, "_").substring(0, 50)
      : "luma_event";

    a.download = `${cleanEventName}_guest_${dateTime}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    console.log(
      `📁 CSV file downloaded: ${visitors.length} guest data items, filename: ${a.download}`,
    );

    // Increment download count after successful export
    try {
      const incrementResponse = await chrome.runtime.sendMessage({ action: "incrementDownloadCount" });
      if (incrementResponse.success) {
        console.log(`📊 Download count incremented: ${incrementResponse.newCount}/10, ${incrementResponse.remaining} remaining today`);
      } else {
        console.error("Failed to increment download count:", incrementResponse.error);
      }
    } catch (error) {
      console.error("Error incrementing download count:", error);
    }
  }

  // Create fallback UI
  createFallbackUI() {
    console.log("Creating fallback UI...");

    const container = document.createElement("div");
    container.id = "luma-scraper-events-container";
    container.innerHTML = `
      <div class="luma-scraper-header">
        <h3>🎯 ${ContentLanguageManager.getText("title")}</h3>
        <div class="luma-status">
          ✅ ${ContentLanguageManager.getText("status.authenticated")} | ${ContentLanguageManager.getText("messages.failed")} to get event list
        </div>
        <div class="luma-cookie-status" style="font-size: 11px; opacity: 0.8;">
          🍪 ${ContentLanguageManager.getText("status.cookieAuthorized")}
        </div>
      </div>
      <div class="luma-events-list">
        <div style="padding: 20px; text-align: center; color: #636e72;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <h4 style="margin: 0 0 12px 0;">${ContentLanguageManager.getText("messages.failed")} to get event list</h4>
          <p style="line-height: 1.5;">
            ${ContentLanguageManager.getText("messages.possibleReasons")}
            <br>• ${ContentLanguageManager.getText("messages.networkIssue")}
            <br>• ${ContentLanguageManager.getText("messages.apiUnavailable")}
            <br>• ${ContentLanguageManager.getText("messages.authAbnormal")}
            <br><br>
            ${ContentLanguageManager.getText("messages.refreshPage")}
          </p>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = this.getUIStyles();

    document.head.appendChild(style);
    document.body.appendChild(container);

    this.addMinimizeButton(container);
  }

  // Show event details
  showEventDetails(event) {
    // Remove existing detail modal
    const existingModal = document.querySelector("#luma-event-detail-modal");
    if (existingModal) {
      existingModal.remove();
    }

    // Create detail modal
    const modal = document.createElement("div");
    modal.id = "luma-event-detail-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;

    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const startDate = new Date(event.start_at);
    const endDate = event.end_at ? new Date(event.end_at) : null;
    const location =
      event.location_type === "offline"
        ? event.geo_address_info?.address ||
          event.geo_address_info?.city ||
          ContentLanguageManager.getText("events.offline")
        : event.location_type;

    const accessStatus = event.canScrape
      ? `${checkIcon} ${ContentLanguageManager.getText("events.guestListVisible")} | ${keyIcon} ${ContentLanguageManager.getText("events.hasAccess")}`
      : event.show_guest_list
        ? `${checkIcon} ${ContentLanguageManager.getText("events.guestListVisible")} | ${noIcon} ${ContentLanguageManager.getText("events.noAccess")}`
        : `${noIcon} ${ContentLanguageManager.getText("events.guestListHidden")}`;

    modalContent.innerHTML = `
      <div style="position: relative;">
        ${
          event.cover_url
            ? `
          <img src="${event.cover_url}" alt="Event Cover" style="
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 12px 12px 0 0;
          "/>
        `
            : `
          <div style="
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px 12px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          ">
            🎯 ${event.name}
          </div>
        `
        }

        <button onclick="this.closest('#luma-event-detail-modal').remove()" style="
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(0,0,0,0.8)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'">×</button>
      </div>

      <div style="padding: 24px;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #2d3436;">${event.name}</h2>

        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: #636e72;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📅</span>
            <div>
              <div><strong>${ContentLanguageManager.getText("events.startTimeLabel")}</strong> ${startDate.toLocaleString()}</div>
              ${endDate ? `<div><strong>${ContentLanguageManager.getText("events.endTimeLabel")}</strong> ${endDate.toLocaleString()}</div>` : ""}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📍</span>
            <div><strong>${ContentLanguageManager.getText("events.locationLabel")}</strong> ${location}</div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🎫</span>
            <div><strong>${ContentLanguageManager.getText("events.visibilityLabel")}</strong> ${event.visibility}</div>
          </div>

          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-size: 16px;">🔐</span>
            <div><strong>${ContentLanguageManager.getText("events.scrapeStatusLabel")}</strong> ${accessStatus}</div>
          </div>

          ${
            event.description
              ? `
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span style="font-size: 16px;">📝</span>
              <div>
                <div><strong>${ContentLanguageManager.getText("events.description")}:</strong></div>
                <div style="margin-top: 4px; line-height: 1.5; max-height: 120px; overflow-y: auto; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                  ${event.description.replace(/\n/g, "<br>")}
                </div>
              </div>
            </div>
          `
              : ""
          }

          ${
            event.guest_count
              ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">👥</span>
              <div><strong>${ContentLanguageManager.getText("events.guestCountLabel")}</strong> ${event.guest_count}</div>
            </div>
          `
              : ""
          }
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <a href="https://lu.ma/${event.url}" target="_blank" style="
            flex: 1;
            padding: 12px 16px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            text-align: center;
            font-weight: 500;
            transition: background 0.2s;
          " onmouseover="this.style.background='#5a6fd8'" onmouseout="this.style.background='#667eea'">
            🔗 ${ContentLanguageManager.getText("events.viewOriginal")}
          </a>

          <button onclick="this.closest('#luma-event-detail-modal').remove()" style="
            flex: 1;
            padding: 12px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">
            ${ContentLanguageManager.getText("events.close")}
          </button>
        </div>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Click modal background to close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

  // Get user events from API
  async getUserEvents() {
    try {
      const apiUrl = "https://api2.luma.com/search/get-results?query=";
      const headers = {
        accept: "*/*",
        "accept-language": "zh",
        cookie: this.cookieHeader,
        origin: "https://luma.com",
        referer: "https://luma.com/",
        "x-luma-client-type": "luma-web",
        "x-luma-web-url": "https://luma.com/home",
      };

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get user events:", error);
      return null;
    }
  }

  // Handle messages from popup
  handleMessage(request, _sender, sendResponse) {
    if (request.action === "getStatus") {
      sendResponse({
        isRunning: this.isRunning,
        currentPage: this.currentPage,
        dataCount: this.totalVisitors ? this.totalVisitors.length : 0,
      });
    } else if (request.action === "startScraping") {
      console.log("⚠️ Received old startScraping message, ignored");
      sendResponse({ success: true });
    } else if (request.action === "stopScraping") {
      console.log("⚠️ Received old stopScraping message, ignored");
      sendResponse({ success: true });
    } else if (request.action === "resetPermission") {
      this.handleResetPermission();
      sendResponse({ success: true });
    } else if (request.action === "cookieConsentGranted") {
      this.handleCookieConsentGranted();
      sendResponse({ success: true });
    } else if (request.action === "changeLanguage") {
      this.handleLanguageChange(request.language);
      sendResponse({ success: true });
    } else if (request.action === "checkStatus") {
      const eventsContainer = document.querySelector("#luma-events-list");
      sendResponse({
        loaded: true,
        eventsListVisible: eventsContainer && eventsContainer.style.display !== "none",
        eventsCount: this.allEvents ? this.allEvents.length : 0,
        containerExists: !!eventsContainer,
        authStatus: !!this.authValue,
        initComplete: this.initComplete || false,
      });
    }
  }

  // Handle permission reset from popup
  handleResetPermission() {
    console.log("🔄 Received permission reset request");

    // Reset Cookie consent status
    this.cookieConsent = false;
    this.authCookie = null;
    this.authValue = null;
    this.cookieHeader = null;

    // Hide existing UI
    const existingContainer = document.querySelector("#luma-events-list");
    if (existingContainer) {
      existingContainer.style.display = "none";
    }

    // Reset initialization status
    this.initComplete = false;

    console.log("✅ Permission reset, need re-authorization");
  }

  // Handle cookie consent granted from popup
  async handleCookieConsentGranted() {
    console.log("✅ Received popup Cookie consent message");

    this.cookieConsent = true;

    // Continue initialization
    await this.continueInit();
  }

  // Handle language change from popup
  handleLanguageChange(language) {
    console.log("🌐 Received language switch request:", language);

    // Update language setting in localStorage
    localStorage.setItem("luma-scraper-lang", language);

    // Update language of existing UI
    this.updateUILanguage();
  }

  // Update UI language
  updateUILanguage() {
    const container = document.getElementById("luma-scraper-events-container");
    if (container) {
      // Update main title
      const title = container.querySelector("h3");
      if (title) {
        title.textContent = `🎯 ${ContentLanguageManager.getText("title")}`;
      }

      // Update status text
      const statusDiv = container.querySelector(".luma-status");
      if (statusDiv) {
        if (this.allEvents) {
          // Normal event list status
          const scrapableCount = this.allEvents.filter((e) => e.canScrape).length;
          const totalCount = this.allEvents.length;
          statusDiv.textContent = `✅ ${ContentLanguageManager.getText("status.authenticated")} | ${ContentLanguageManager.getText("status.found")} ${scrapableCount}/${totalCount} ${ContentLanguageManager.getText("status.scrappable")}`;
        } else {
          // Fallback UI status
          statusDiv.textContent = `✅ ${ContentLanguageManager.getText("status.authenticated")} | ${ContentLanguageManager.getText("messages.failed")} to get event list`;
        }
      }

      // Update Cookie status text
      const cookieStatus = container.querySelector(".luma-cookie-status");
      if (cookieStatus) {
        cookieStatus.textContent = `🍪 ${ContentLanguageManager.getText("status.cookieAuthorized")}`;
      }

      // Update 'no scrappable events' text
      const noEventsDiv = container.querySelector(".no-events");
      if (noEventsDiv) {
        noEventsDiv.textContent = ContentLanguageManager.getText("messages.noScrapableEvents");
      }

      // Update buttons and text in event list
      this.updateEventItemsLanguage();

      // Update static text in event details
      this.updateEventDetailsLanguage();

      // Update error messages in fallback UI
      this.updateFallbackUILanguage();
    }
  }

  // Update fallback UI language
  updateFallbackUILanguage() {
    const container = document.getElementById("luma-scraper-events-container");
    if (container) {
      // Update fallback error title
      const errorTitle = container.querySelector("h4");
      if (errorTitle && errorTitle.textContent.includes("get event list")) {
        errorTitle.textContent = `${ContentLanguageManager.getText("messages.failed")} to get event list`;
      }

      // Update error details paragraph
      const errorParagraph = container.querySelector(".luma-events-list p");
      if (errorParagraph) {
        errorParagraph.innerHTML = `
          ${ContentLanguageManager.getText("messages.possibleReasons")}
          <br>• ${ContentLanguageManager.getText("messages.networkIssue")}
          <br>• ${ContentLanguageManager.getText("messages.apiUnavailable")}
          <br>• ${ContentLanguageManager.getText("messages.authAbnormal")}
          <br><br>
          ${ContentLanguageManager.getText("messages.refreshPage")}
        `;
      }
    }
  }

  // Update event details language
  updateEventDetailsLanguage() {
    const eventItems = document.querySelectorAll(".luma-event-item");

    eventItems.forEach((item, index) => {
      if (!this.allEvents || !this.allEvents[index]) return;
      const event = this.allEvents[index];

      // Update event access status text - using more robust DOM selection
      const accessElement = item.querySelector(".event-access-text");
      if (accessElement) {
        // Force refresh the access status with current language
        const accessStatus = event.canScrape
          ? `${checkIcon} ${ContentLanguageManager.getText("events.guestListVisible")} | ${keyIcon} ${ContentLanguageManager.getText("events.hasAccess")}`
          : event.show_guest_list
            ? `${checkIcon} ${ContentLanguageManager.getText("events.guestListVisible")} | ${noIcon} ${ContentLanguageManager.getText("events.noAccess")}`
            : `${noIcon} ${ContentLanguageManager.getText("events.guestListHidden")}`;

        accessElement.innerHTML = accessStatus;
      } else {
        // If .event-access-text element is missing, try to find and update the entire info section
        const infoElement = item.querySelector(".luma-event-info");
        if (infoElement) {
          // Reconstruct the access status line
          const existingLines = infoElement.innerHTML.split("<br>");
          if (existingLines.length >= 3) {
            const accessStatus = event.canScrape
              ? `${checkIcon} ${ContentLanguageManager.getText("events.guestListVisible")} | ${keyIcon} ${ContentLanguageManager.getText("events.hasAccess")}`
              : event.show_guest_list
                ? `${checkIcon} ${ContentLanguageManager.getText("events.guestListVisible")} | ${noIcon} ${ContentLanguageManager.getText("events.noAccess")}`
                : `${noIcon} ${ContentLanguageManager.getText("events.guestListHidden")}`;

            // Update the third line (access status line) with proper wrapper
            existingLines[2] = `🎫 ${event.visibility} | <span class="event-access-text">${accessStatus}</span>`;
            infoElement.innerHTML = existingLines.join("<br>");
          }
        }
      }

      // Update progress text
      const progressText = item.querySelector(".progress-text");
      if (progressText) {
        const currentText = progressText.textContent;
        // Only update if it's in a ready/idle state (not actively showing progress)
        const chineseFailed = ContentLanguageManager.getText("messages.failed");
        const chineseCompleted = ContentLanguageManager.getText("messages.completed");
        const chinesePage = ContentLanguageManager.getText("messages.page");

        if (
          !currentText.includes("...") &&
          !currentText.includes(chineseFailed) &&
          !currentText.includes("failed") &&
          !currentText.includes(chineseCompleted) &&
          !currentText.includes("completed") &&
          !currentText.includes("%") &&
          !currentText.includes("Page") &&
          !currentText.includes(chinesePage)
        ) {
          progressText.textContent = ContentLanguageManager.getText("messages.ready");
        }
      }
    });
  }

  // Update event items language
  updateEventItemsLanguage() {
    const eventItems = document.querySelectorAll(".luma-event-item");
    eventItems.forEach((item, index) => {
      if (!this.allEvents || !this.allEvents[index]) return;

      // Update button text
      const autoBtn = item.querySelector(".scrape-auto-btn");
      const manualBtn = item.querySelector(".scrape-manual-btn");
      const stopBtn = item.querySelector(".stop-btn");
      const nextBtn = item.querySelector(".next-page-btn");
      const exportBtn = item.querySelector(".export-btn");
      const resetBtn = item.querySelector(".reset-btn");
      const viewBtn = item.querySelector(".view-btn");

      if (autoBtn && !autoBtn.disabled) {
        autoBtn.textContent = ContentLanguageManager.getText("buttons.autoScrape");
      }
      if (manualBtn && !manualBtn.disabled) {
        manualBtn.textContent = ContentLanguageManager.getText("buttons.manualScrape");
      }
      if (stopBtn) {
        stopBtn.textContent = ContentLanguageManager.getText("buttons.stop");
      }
      if (nextBtn && !nextBtn.disabled) {
        nextBtn.textContent = ContentLanguageManager.getText("buttons.nextPage");
      }
      if (exportBtn) {
        const match = exportBtn.textContent.match(/\((\d+)/);
        const count = match ? match[1] : "";
        exportBtn.textContent = count
          ? `${ContentLanguageManager.getText("buttons.export")} (${count}${ContentLanguageManager.getText("messages.items")})`
          : ContentLanguageManager.getText("buttons.export");
      }
      if (resetBtn) {
        resetBtn.textContent = ContentLanguageManager.getText("buttons.reset");
      }
      if (viewBtn) {
        viewBtn.textContent = ContentLanguageManager.getText("buttons.viewDetails");
      }

      // Update unable to scrape button text
      const disabledBtn = item.querySelector(".luma-btn-disabled");
      if (disabledBtn) {
        // Always update to current language, regardless of current text
        disabledBtn.textContent = ContentLanguageManager.getText("events.noAccess");
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new LumaDataScraper();
  });
} else {
  new LumaDataScraper();
}
