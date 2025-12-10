// EventMate Popup Script

// Language configuration
const LANGUAGES = {
  cn: {
    title: "EventMate",
    status: {
      disconnected: "未连接",
      connected_event: "已连接到Luma事件页",
      connected: "已连接到Luma",
      open_luma: "请打开Luma网站",
    },
    sections: {
      cookiePermission: "Cookie权限管理",
      pluginStatus: "插件状态",
      dataManagement: "数据管理",
      historyData: "历史数据",
    },
    permissions: {
      checking: "检查中...",
      granted: "✓ Cookie权限已授予",
      denied: "✗ Cookie权限已拒绝",
      notSet: "⚠️ 未设置Cookie权限",
      resetButton: "重新选择权限",
    },
    dataButtons: {
      export: "导出数据",
      viewHistory: "查看历史",
      clearData: "清除数据",
      hideHistory: "隐藏历史",
    },
    dataSummary: {
      noData: "暂无数据",
      records: "个抓取记录，共",
      items: "条数据",
    },
    modal: {
      resetTitle: "重置Cookie权限",
      resetMessage: "确定要重置Cookie权限吗？",
      resetWarning: "此操作将清除当前的授权状态，您需要重新访问Luma页面进行授权。",
      cancel: "取消",
      confirmReset: "确认重置",
      cookieTitle: "Cookie使用授权",
      cookieMessage: "Luma数据抓取器需要读取当前页面的认证Cookie以获取您有权限访问的活动数据。",
      promises: "我们承诺：",
      promiseList: [
        "仅读取Luma相关的认证Cookie",
        "不存储或传输您的Cookie到任何服务器",
        "Cookie仅用于本地数据抓取功能",
      ],
      tip: "💡 提示：您随时可以重新修改这个选择",
      accept: "✅ 同意并继续",
      reject: "❌ 拒绝",
    },
    messages: {
      permissionReset: "Cookie权限已重置，请访问Luma页面进行授权",
      permissionGranted: "Cookie权限已授予，可以开始使用抓取功能",
      permissionDenied: "已拒绝Cookie权限，无法使用抓取功能",
      resetFailed: "权限重置失败",
      permissionFailed: "权限设置失败",
      noDataToExport: "没有可导出的数据",
      exportFailed: "导出失败",
      dataCleared: "数据已清除",
      clearFailed: "清除失败",
      eventListLoaded: "事件列表已加载",
      events: "个事件",
      authenticated: "已认证，等待事件列表加载",
      notAuthenticated: "未认证或认证失败",
      pluginNotLoaded: "插件未加载",
      cannotConnect: "无法连接到插件",
      initFailed: "初始化失败",
      openLumaWebsite: "请打开Luma网站",
      noDataAlert: "没有可导出的数据",
      exportFailedAlert: "导出失败",
      hideHistory: "隐藏历史",
      viewHistory: "查看历史",
      noHistoryRecords: "暂无历史记录",
      unknownPage: "未知页面",
      confirmClearData: "确定要清除所有抓取数据吗？此操作不可恢复。",
      dataCleared: "数据已清除",
      clearFailedAlert: "清除失败",
      helpText:
        '使用说明：\n\n1. 打开Luma网站并登录账户\n2. 插件会自动显示可抓取的事件列表\n3. 选择抓取模式：\n   🤖 自动翻页 - 3-6秒随机延迟\n   👆 手动翻页 - 手动控制节奏\n4. 点击"开始抓取"获取访客数据\n5. 完成后直接导出CSV文件\n\n注意：\n- 只有公开访客列表的事件可以抓取\n- 自动保存数据，可在这里查看和导出',
      aboutText:
        "智能的Luma事件访客数据抓取工具。\n\n功能特性：\n- 🎯 自动识别可抓取的事件\n- 🤖 智能双模式抓取（自动/手动）\n- 📊 实时进度显示和统计\n- 📁 CSV格式数据导出\n- 🔐 安全的Cookie认证\n\n版本: 2.0.0\n更新时间: 2024年12月",
    },
  },
  en: {
    title: "EventMate",
    status: {
      disconnected: "Disconnected",
      connected_event: "Connected to Luma Event Page",
      connected: "Connected to Luma",
      open_luma: "Please open Luma website",
    },
    sections: {
      cookiePermission: "Cookie Permission",
      pluginStatus: "Plugin Status",
      dataManagement: "Data Management",
      historyData: "History Data",
    },
    permissions: {
      checking: "Checking...",
      granted: "✓ Cookie permission granted",
      denied: "✗ Cookie permission denied",
      notSet: "⚠️ Cookie permission not set",
      resetButton: "Reset Permission",
    },
    dataButtons: {
      export: "Export Data",
      viewHistory: "View History",
      clearData: "Clear Data",
      hideHistory: "Hide History",
    },
    dataSummary: {
      noData: "No data",
      records: " scraping records, total ",
      items: " items",
    },
    modal: {
      resetTitle: "Reset Cookie Permission",
      resetMessage: "Are you sure you want to reset cookie permission?",
      resetWarning:
        "This will clear current authorization status, you need to re-authorize when visiting Luma page.",
      cancel: "Cancel",
      confirmReset: "Confirm Reset",
      cookieTitle: "Cookie Usage Authorization",
      cookieMessage:
        "EventMate needs to read authentication cookies from current page to access event data you have permission to view.",
      promises: "Our Promise:",
      promiseList: [
        "Only read Luma-related authentication cookies",
        "Never store or transmit your cookies to any server",
        "Cookies are only used for local data scraping",
      ],
      tip: "💡 Tip: You can change this choice anytime",
      accept: "✅ Accept & Continue",
      reject: "❌ Reject",
    },
    messages: {
      permissionReset: "Cookie permission reset, please visit Luma page for authorization",
      permissionGranted: "Cookie permission granted, you can start using scraping features",
      permissionDenied: "Cookie permission denied, scraping features unavailable",
      resetFailed: "Permission reset failed",
      permissionFailed: "Permission setting failed",
      noDataToExport: "No data to export",
      exportFailed: "Export failed",
      dataCleared: "Data cleared",
      clearFailed: "Clear failed",
      eventListLoaded: "Event list loaded",
      events: " events",
      authenticated: "Authenticated, waiting for event list to load",
      notAuthenticated: "Not authenticated or authentication failed",
      pluginNotLoaded: "Plugin not loaded",
      cannotConnect: "Cannot connect to plugin",
      initFailed: "Initialization failed",
      openLumaWebsite: "Please open Luma website",
      noDataAlert: "No data to export",
      exportFailedAlert: "Export failed",
      hideHistory: "Hide History",
      viewHistory: "View History",
      noHistoryRecords: "No history records",
      unknownPage: "Unknown page",
      confirmClearData:
        "Are you sure you want to clear all scraped data? This action cannot be undone.",
      dataCleared: "Data cleared",
      clearFailedAlert: "Clear failed",
      helpText:
        'Usage Instructions:\n\n1. Open Luma website and log into your account\n2. Plugin will automatically display scrapeable events list\n3. Choose scraping mode:\n   🤖 Auto pagination - 3-6 seconds random delay\n   👆 Manual pagination - manual control rhythm\n4. Click "Start Scraping" to get visitor data\n5. Export CSV file when completed\n\nNotes:\n- Only events with public guest lists can be scraped\n- Data is automatically saved, can be viewed and exported here',
      aboutText:
        "Intelligent Luma event visitor data scraping tool.\n\nFeatures:\n- 🎯 Automatically identify scrapeable events\n- 🤖 Smart dual-mode scraping (auto/manual)\n- 📊 Real-time progress display and statistics\n- 📁 CSV format data export\n- 🔐 Secure Cookie authentication\n\nVersion: 2.0.0\nUpdate: December 2024",
    },
  },
};

// Language management functions
const LanguageManager = {
  getCurrentLang() {
    return localStorage.getItem("luma-scraper-lang") || "en";
  },

  setCurrentLang(lang) {
    localStorage.setItem("luma-scraper-lang", lang);
  },

  getText(path, lang = null) {
    lang = lang || this.getCurrentLang();
    const keys = path.split(".");
    let text = LANGUAGES[lang];

    for (const key of keys) {
      text = text?.[key];
    }

    return text || path;
  },
};

class LumaPopup {
  constructor() {
    this.currentTab = null;
    this.isLumaPage = false;
    this.cookies = null;
    this.currentLang = "en"; // Default to English
    this.pluginStatus = {
      eventsLoaded: false,
      eventsCount: 0,
    };

    this.init();
  }

  async init() {
    try {
      this.loadLanguage();
      this.getCurrentTab();
      await this.checkLumaPage();
      await this.loadCookies();
      await this.loadStoredData();

      this.bindEvents();
      this.updatePermissionStatus();
      this.updateUI();
      this.hideLoading();

      // Regular status updates
      setInterval(() => {
        this.updatePluginStatus();
      }, 3000);
    } catch (error) {
      console.error("Popup initialization error:", error);
      this.hideLoading();
      this.showError(LanguageManager.getText("messages.initFailed") + ": " + error.message);
    }
  }

  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tabs[0];
  }

  checkLumaPage() {
    if (this.currentTab && this.currentTab.url) {
      this.isLumaPage =
        this.currentTab.url.includes("luma.ai") ||
        this.currentTab.url.includes("lu.ma") ||
        this.currentTab.url.includes("luma.com");
    }

    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");

    if (this.isLumaPage) {
      statusDot.classList.add("connected");

      // Check if it's an event page
      if (this.currentTab.url.match(/\/event\/[^\/]+/)) {
        statusText.textContent = LanguageManager.getText("status.connected_event");
      } else {
        statusText.textContent = LanguageManager.getText("status.connected");
      }
    } else {
      statusDot.classList.remove("connected");
      statusText.textContent = LanguageManager.getText("status.open_luma");
    }
  }

  async loadCookies() {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getCookies" });

      if (response.success) {
        this.authCookie = response.authCookie;
        this.authValue = response.authValue;
        this.cookieHeader = response.cookieHeader;
        console.log("Auth cookie loaded successfully");
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Failed to load auth cookie:", error);
    }
  }

  // updateCookiesDisplay function removed - authentication status section deleted

  async loadStoredData() {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getData" });

      if (response.success) {
        this.updateDataSummary(response.data);
      }
    } catch (error) {
      console.error("Failed to load stored data:", error);
    }
  }

  updateDataSummary(data) {
    const summary = document.getElementById("data-summary");

    if (!data || Object.keys(data).length === 0) {
      summary.textContent = LanguageManager.getText("dataSummary.noData");
      return;
    }

    const sessions = Object.keys(data).length;
    const totalItems = Object.values(data).reduce((sum, session) => {
      return sum + (session.data ? session.data.length : 0);
    }, 0);

    summary.textContent = `${sessions}${LanguageManager.getText("dataSummary.records")}${totalItems}${LanguageManager.getText("dataSummary.items")}`;
  }

  bindEvents() {
    // Refresh cookies button removed

    // Export data
    document.getElementById("export-data").addEventListener("click", () => {
      this.exportData();
    });

    // View history
    document.getElementById("view-history").addEventListener("click", () => {
      this.toggleHistory();
    });

    // Clear data
    document.getElementById("clear-data").addEventListener("click", () => {
      this.clearData();
    });

    // Help and about
    document.getElementById("help-link").addEventListener("click", (e) => {
      e.preventDefault();
      this.showHelp();
    });

    document.getElementById("about-link").addEventListener("click", (e) => {
      e.preventDefault();
      this.showAbout();
    });

    // Cookie permission management
    document.getElementById("reset-permission").addEventListener("click", () => {
      this.showResetPermissionModal();
    });

    // Permission reset modal events
    document.getElementById("cancel-reset").addEventListener("click", () => {
      this.hideResetPermissionModal();
    });

    document.getElementById("confirm-reset").addEventListener("click", () => {
      this.hideResetPermissionModal();
      this.resetCookiePermission();
    });

    // Cookie consent modal events
    document.getElementById("accept-cookie-consent").addEventListener("click", () => {
      this.acceptCookieConsent();
    });

    document.getElementById("reject-cookie-consent").addEventListener("click", () => {
      this.rejectCookieConsent();
    });

    // Language switch button
    document.getElementById("lang-btn").addEventListener("click", () => {
      this.toggleLanguage();
    });
  }

  async updatePluginStatus() {
    if (!this.isLumaPage) {
      this.updatePluginStatusUI(LanguageManager.getText("messages.openLumaWebsite"), false);
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: "checkStatus",
      });

      if (response && response.loaded) {
        this.pluginStatus.eventsLoaded = response.eventsListVisible;
        this.pluginStatus.eventsCount = response.eventsCount;

        if (response.eventsListVisible && response.eventsCount > 0) {
          this.updatePluginStatusUI(
            `${LanguageManager.getText("messages.eventListLoaded")} (${response.eventsCount}${LanguageManager.getText("messages.events")})`,
            true,
          );
        } else if (response.authStatus) {
          this.updatePluginStatusUI(LanguageManager.getText("messages.authenticated"), true);
        } else {
          this.updatePluginStatusUI(LanguageManager.getText("messages.notAuthenticated"), false);
        }
      } else {
        this.updatePluginStatusUI(LanguageManager.getText("messages.pluginNotLoaded"), false);
      }
    } catch (error) {
      this.updatePluginStatusUI(LanguageManager.getText("messages.cannotConnect"), false);
    }
  }

  updatePluginStatusUI(message, isReady) {
    const indicator = document.getElementById("api-indicator");
    const status = document.getElementById("plugin-status");

    if (indicator) {
      indicator.className = isReady ? "api-indicator ready" : "api-indicator";
    }

    if (status) {
      status.textContent = message;
    }
  }

  async exportData() {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getData" });

      if (response.success && response.data) {
        this.downloadData(response.data);
      } else {
        alert(LanguageManager.getText("messages.noDataAlert"));
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert(LanguageManager.getText("messages.exportFailedAlert"));
    }
  }

  downloadData(data) {
    // Merge all data into one array
    const allData = [];

    Object.keys(data).forEach((key) => {
      const session = data[key];
      if (session.data && Array.isArray(session.data)) {
        session.data.forEach((item) => {
          allData.push({
            ...item,
            session: key,
            timestamp: session.timestamp,
            url: session.url,
            page: session.page,
          });
        });
      }
    });

    if (allData.length === 0) {
      alert(LanguageManager.getText("messages.noDataAlert"));
      return;
    }

    // Convert to CSV
    const csv = this.convertToCSV(allData);

    // Download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luma_data_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  convertToCSV(data) {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.map((h) => `"${h}"`).join(","));

    // Add data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '""';
        }
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  }

  toggleHistory() {
    const historySection = document.getElementById("history-section");
    const viewBtn = document.getElementById("view-history");

    if (historySection.style.display === "none") {
      this.loadHistory();
      historySection.style.display = "block";
      viewBtn.textContent = LanguageManager.getText("messages.hideHistory");
    } else {
      historySection.style.display = "none";
      viewBtn.textContent = LanguageManager.getText("messages.viewHistory");
    }
  }

  async loadHistory() {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getData" });

      if (response.success && response.data) {
        this.displayHistory(response.data);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }

  displayHistory(data) {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";

    if (!data || Object.keys(data).length === 0) {
      historyList.innerHTML = `<div style="text-align: center; color: #636e72; padding: 20px;">${LanguageManager.getText("messages.noHistoryRecords")}</div>`;
      return;
    }

    Object.keys(data).forEach((key) => {
      const session = data[key];
      const date = new Date(session.timestamp).toLocaleString();
      const count = session.data ? session.data.length : 0;

      const item = document.createElement("div");
      item.className = "history-item";
      item.innerHTML = `
        <div>
          <div style="font-weight: 500;">${date}</div>
          <div style="font-size: 11px; color: #636e72;">${session.url || LanguageManager.getText("messages.unknownPage")}</div>
        </div>
        <div class="history-count">${count} ${LanguageManager.getText("dataSummary.items")}</div>
      `;

      historyList.appendChild(item);
    });
  }

  async clearData() {
    if (!confirm(LanguageManager.getText("messages.confirmClearData"))) {
      return;
    }

    try {
      await chrome.storage.local.clear();
      this.updateDataSummary({});
      alert(LanguageManager.getText("messages.dataCleared"));
    } catch (error) {
      console.error("Failed to clear data:", error);
      alert(LanguageManager.getText("messages.clearFailedAlert"));
    }
  }

  updateUI() {
    // Update overall UI status
    this.checkLumaPage();
    this.updatePluginStatus();
  }

  showError(message) {
    const container = document.querySelector(".container");
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: #e17055;
      color: white;
      padding: 10px;
      border-radius: 4px;
      z-index: 1001;
      font-size: 12px;
    `;
    errorDiv.textContent = message;

    container.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  showHelp() {
    alert(LanguageManager.getText("messages.helpText"));
  }

  showAbout() {
    alert(`EventMate v2.0.0\n\n${LanguageManager.getText("messages.aboutText")}`);
  }

  hideLoading() {
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.add("hidden");
  }

  showLoading() {
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.remove("hidden");
  }

  async updatePermissionStatus() {
    try {
      const result = await chrome.storage.local.get(["cookieConsent"]);
      const permissionStatus = document.getElementById("permission-status");

      if (result.cookieConsent === "granted") {
        permissionStatus.textContent = LanguageManager.getText("permissions.granted");
        permissionStatus.style.color = "#00b894";
      } else if (result.cookieConsent === "denied") {
        permissionStatus.textContent = LanguageManager.getText("permissions.denied");
        permissionStatus.style.color = "#e17055";
      } else {
        permissionStatus.textContent = LanguageManager.getText("permissions.notSet");
        permissionStatus.style.color = "#fdcb6e";
      }
    } catch (error) {
      console.error("Failed to check permission status:", error);
      const permissionStatus = document.getElementById("permission-status");
      permissionStatus.textContent = LanguageManager.getText("permissions.checking");
      permissionStatus.style.color = "#636e72";
    }
  }

  async resetCookiePermission() {
    try {
      // Clear local stored permission status
      await chrome.storage.local.remove(["cookieConsent"]);

      // Notify content script to clear permission status
      if (this.currentTab && this.currentTab.id) {
        try {
          await chrome.tabs.sendMessage(this.currentTab.id, {
            action: "resetPermission",
          });
        } catch (error) {
          console.log("Content script not available, will reset on next visit");
        }
      }

      // Update UI status
      this.updatePermissionStatus();
      this.loadCookies(); // Re-check Cookie status

      // Show Cookie consent dialog for user to reselect
      if (this.isLumaPage) {
        this.showCookieConsentModal();
      } else {
        this.showSuccessMessage(LanguageManager.getText("messages.permissionReset"));
      }
    } catch (error) {
      console.error("Failed to reset permission:", error);
      this.showErrorMessage(LanguageManager.getText("messages.resetFailed"));
    }
  }

  showResetPermissionModal() {
    const modal = document.getElementById("reset-permission-modal");
    modal.style.display = "flex";
  }

  hideResetPermissionModal() {
    const modal = document.getElementById("reset-permission-modal");
    modal.style.display = "none";
  }

  showSuccessMessage(message) {
    this.showToast(message, "success");
  }

  showErrorMessage(message) {
    this.showToast(message, "error");
  }

  showToast(message, type = "success") {
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: ${type === "success" ? "#00b894" : "#e17055"};
      color: white;
      padding: 12px;
      border-radius: 6px;
      z-index: 2000;
      font-size: 13px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  showCookieConsentModal() {
    const modal = document.getElementById("cookie-consent-modal");
    modal.style.display = "flex";
  }

  hideCookieConsentModal() {
    const modal = document.getElementById("cookie-consent-modal");
    modal.style.display = "none";
  }

  async acceptCookieConsent() {
    try {
      // Save consent status to local storage
      await chrome.storage.local.set({ cookieConsent: "granted" });

      // Notify content script that user has agreed
      if (this.currentTab && this.currentTab.id) {
        try {
          await chrome.tabs.sendMessage(this.currentTab.id, {
            action: "cookieConsentGranted",
          });
        } catch (error) {
          console.log("Content script not available, consent will apply on next visit");
        }
      }

      this.hideCookieConsentModal();
      this.updatePermissionStatus();
      this.loadCookies();
      this.showSuccessMessage(LanguageManager.getText("messages.permissionGranted"));
    } catch (error) {
      console.error("Failed to accept cookie consent:", error);
      this.showErrorMessage(LanguageManager.getText("messages.permissionFailed"));
    }
  }

  async rejectCookieConsent() {
    try {
      // Save rejection status to local storage
      await chrome.storage.local.set({ cookieConsent: "denied" });

      this.hideCookieConsentModal();
      this.updatePermissionStatus();
      this.showErrorMessage(LanguageManager.getText("messages.permissionDenied"));
    } catch (error) {
      console.error("Failed to reject cookie consent:", error);
      this.showErrorMessage(LanguageManager.getText("messages.permissionFailed"));
    }
  }

  // Language related methods
  loadLanguage() {
    this.currentLang = LanguageManager.getCurrentLang();
    this.updateLanguageDisplay();
    this.updateAllTexts();
  }

  async toggleLanguage() {
    this.currentLang = this.currentLang === "en" ? "cn" : "en";
    LanguageManager.setCurrentLang(this.currentLang);
    this.updateLanguageDisplay();
    this.updateAllTexts();

    // Notify content script to update language
    if (this.currentTab && this.currentTab.id) {
      try {
        await chrome.tabs.sendMessage(this.currentTab.id, {
          action: "changeLanguage",
          language: this.currentLang,
        });
      } catch (error) {
        console.log("Content script not available for language update");
      }
    }
  }

  updateLanguageDisplay() {
    const langBtn = document.getElementById("lang-btn");
    if (langBtn) {
      langBtn.textContent = this.currentLang === "en" ? "CN" : "EN";
    }
  }

  updateAllTexts() {
    // Update title
    const title = document.querySelector("h1");
    if (title) {
      title.textContent = LanguageManager.getText("title");
    }

    // Update all elements with data-i18n attributes
    const i18nElements = document.querySelectorAll("[data-i18n]");
    i18nElements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const text = LanguageManager.getText(key);
      if (text) {
        element.textContent = text;
      }
    });

    // Special handling for view history button
    const viewHistoryBtn = document.getElementById("view-history");
    if (viewHistoryBtn) {
      const isHistoryVisible = document.getElementById("history-section").style.display !== "none";
      viewHistoryBtn.textContent = isHistoryVisible
        ? LanguageManager.getText("dataButtons.hideHistory")
        : LanguageManager.getText("dataButtons.viewHistory");
    }

    // Update status text
    this.checkLumaPage();

    // Update permission status and data summary
    this.updatePermissionStatus();
    this.loadStoredData();
    this.updateModalTexts();
  }

  updateModalTexts() {
    // Update modal texts using data-i18n attributes
    const modals = document.querySelectorAll(".modal-overlay");
    modals.forEach((modal) => {
      const i18nElements = modal.querySelectorAll("[data-i18n]");
      i18nElements.forEach((element) => {
        const key = element.getAttribute("data-i18n");
        const text = LanguageManager.getText(key);
        if (text) {
          element.textContent = text;
        }
      });
    });

    this.updateCookieConsentModalTexts();
  }

  updateCookieConsentModalTexts() {
    const cookieModal = document.getElementById("cookie-consent-modal");
    if (cookieModal) {
      // Update promise list items
      const promiseList = cookieModal.querySelector("ul");
      if (promiseList) {
        const promises = LanguageManager.getText("modal.promiseList");
        if (Array.isArray(promises)) {
          promiseList.innerHTML = promises
            .map((promise, index) => `<li data-i18n="modal.promiseList.${index}">${promise}</li>`)
            .join("");
        }
      }
    }
  }
}

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  new LumaPopup();
});
