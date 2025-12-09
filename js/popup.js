// Luma Data Scraper Popup Script

class LumaPopup {
  constructor() {
    this.currentTab = null;
    this.isLumaPage = false;
    this.cookies = null;
    this.pluginStatus = {
      eventsLoaded: false,
      eventsCount: 0
    };

    this.init();
  }

  async init() {
    try {
      await this.getCurrentTab();
      await this.checkLumaPage();
      await this.loadCookies();
      await this.loadStoredData();

      this.bindEvents();
      this.updateUI();
      this.hideLoading();

      // 定期更新状态
      setInterval(() => {
        this.updatePluginStatus();
      }, 3000);

    } catch (error) {
      console.error('Popup initialization error:', error);
      this.hideLoading();
      this.showError('初始化失败: ' + error.message);
    }
  }

  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tabs[0];
  }

  checkLumaPage() {
    if (this.currentTab && this.currentTab.url) {
      this.isLumaPage = this.currentTab.url.includes('luma.ai') ||
        this.currentTab.url.includes('lu.ma') ||
        this.currentTab.url.includes('luma.com');
    }

    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    if (this.isLumaPage) {
      statusDot.classList.add('connected');

      // 检查是否是事件页面
      if (this.currentTab.url.match(/\/event\/[^\/]+/)) {
        statusText.textContent = '已连接到Luma事件页';
      } else {
        statusText.textContent = '已连接到Luma';
      }
    } else {
      statusDot.classList.remove('connected');
      statusText.textContent = '请打开Luma网站';
    }
  }

  async loadCookies() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCookies' });

      if (response.success) {
        this.authCookie = response.authCookie;
        this.authValue = response.authValue;
        this.cookieHeader = response.cookieHeader;
        this.updateCookiesDisplay();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to load auth cookie:', error);
      this.updateCookiesDisplay(error.message);
    }
  }

  updateCookiesDisplay(error = null) {
    const cookiesCount = document.getElementById('cookies-count');
    const cookiesDetails = document.getElementById('cookies-details');

    if (error) {
      cookiesCount.textContent = 'Auth Cookie 获取失败';
      cookiesDetails.textContent = error;
      return;
    }

    if (!this.authCookie) {
      cookiesCount.textContent = '未找到 Auth Cookie';
      cookiesDetails.textContent = '未找到 luma.auth-session-key cookie';
      return;
    }

    cookiesCount.textContent = '✓ Auth Cookie 已获取';

    const expiryDate = this.authCookie.expirationDate
      ? new Date(this.authCookie.expirationDate * 1000).toLocaleString()
      : '会话结束时';

    // 提取authToken (cookie值的第一部分，.之前的部分)  
    const authToken = this.authValue.split('.')[0];

    const detailsText = `Cookie: luma.auth-session-key
过期时间: ${expiryDate}
安全: ${this.authCookie.secure ? '是' : '否'}
HttpOnly: ${this.authCookie.httpOnly ? '是' : '否'}

✅ API调用已就绪`;

    cookiesDetails.textContent = detailsText;
  }

  async loadStoredData() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getData' });

      if (response.success) {
        this.updateDataSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  }

  updateDataSummary(data) {
    const summary = document.getElementById('data-summary');

    if (!data || Object.keys(data).length === 0) {
      summary.textContent = '暂无数据';
      return;
    }

    const sessions = Object.keys(data).length;
    const totalItems = Object.values(data).reduce((sum, session) => {
      return sum + (session.data ? session.data.length : 0);
    }, 0);

    summary.textContent = `${sessions} 个抓取记录，共 ${totalItems} 条数据`;
  }

  bindEvents() {
    // 刷新cookies
    document.getElementById('refresh-cookies').addEventListener('click', () => {
      this.loadCookies();
    });


    // 导出数据
    document.getElementById('export-data').addEventListener('click', () => {
      this.exportData();
    });

    // 查看历史
    document.getElementById('view-history').addEventListener('click', () => {
      this.toggleHistory();
    });

    // 清除数据
    document.getElementById('clear-data').addEventListener('click', () => {
      this.clearData();
    });


    // 帮助和关于
    document.getElementById('help-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.showHelp();
    });

    document.getElementById('about-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.showAbout();
    });
  }


  async updatePluginStatus() {
    if (!this.isLumaPage) {
      this.updatePluginStatusUI('请打开Luma网站', false);
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'checkStatus'
      });

      if (response && response.loaded) {
        this.pluginStatus.eventsLoaded = response.eventsListVisible;
        this.pluginStatus.eventsCount = response.eventsCount;

        if (response.eventsListVisible && response.eventsCount > 0) {
          this.updatePluginStatusUI(`事件列表已加载 (${response.eventsCount}个事件)`, true);
        } else if (response.authStatus) {
          this.updatePluginStatusUI('已认证，等待事件列表加载', true);
        } else {
          this.updatePluginStatusUI('未认证或认证失败', false);
        }
      } else {
        this.updatePluginStatusUI('插件未加载', false);
      }
    } catch (error) {
      this.updatePluginStatusUI('无法连接到插件', false);
    }
  }

  updatePluginStatusUI(message, isReady) {
    const indicator = document.getElementById('api-indicator');
    const status = document.getElementById('plugin-status');

    if (indicator) {
      indicator.className = isReady ? 'api-indicator ready' : 'api-indicator';
    }

    if (status) {
      status.textContent = message;
    }
  }

  async exportData() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getData' });

      if (response.success && response.data) {
        this.downloadData(response.data);
      } else {
        alert('没有可导出的数据');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败');
    }
  }

  downloadData(data) {
    // 将所有数据合并到一个数组中
    const allData = [];

    Object.keys(data).forEach(key => {
      const session = data[key];
      if (session.data && Array.isArray(session.data)) {
        session.data.forEach(item => {
          allData.push({
            ...item,
            session: key,
            timestamp: session.timestamp,
            url: session.url,
            page: session.page
          });
        });
      }
    });

    if (allData.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    // 转换为CSV
    const csv = this.convertToCSV(allData);

    // 下载文件
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luma_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // 添加表头
    csvRows.push(headers.map(h => `"${h}"`).join(','));

    // 添加数据行
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '""';
        }
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  toggleHistory() {
    const historySection = document.getElementById('history-section');
    const viewBtn = document.getElementById('view-history');

    if (historySection.style.display === 'none') {
      this.loadHistory();
      historySection.style.display = 'block';
      viewBtn.textContent = '隐藏历史';
    } else {
      historySection.style.display = 'none';
      viewBtn.textContent = '查看历史';
    }
  }

  async loadHistory() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getData' });

      if (response.success && response.data) {
        this.displayHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  displayHistory(data) {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (!data || Object.keys(data).length === 0) {
      historyList.innerHTML = '<div style="text-align: center; color: #636e72; padding: 20px;">暂无历史记录</div>';
      return;
    }

    Object.keys(data).forEach(key => {
      const session = data[key];
      const date = new Date(session.timestamp).toLocaleString();
      const count = session.data ? session.data.length : 0;

      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div>
          <div style="font-weight: 500;">${date}</div>
          <div style="font-size: 11px; color: #636e72;">${session.url || '未知页面'}</div>
        </div>
        <div class="history-count">${count} 条</div>
      `;

      historyList.appendChild(item);
    });
  }

  async clearData() {
    if (!confirm('确定要清除所有抓取数据吗？此操作不可恢复。')) {
      return;
    }

    try {
      await chrome.storage.local.clear();
      this.updateDataSummary({});
      alert('数据已清除');
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('清除失败');
    }
  }


  updateUI() {
    // 更新整体UI状态
    this.checkLumaPage();
    this.updatePluginStatus();
  }

  showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
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
    alert(`使用说明：

1. 打开Luma网站并登录账户
2. 插件会自动显示可抓取的事件列表
3. 选择抓取模式：
   🤖 自动翻页 - 3-6秒随机延迟
   👆 手动翻页 - 手动控制节奏
4. 点击"开始抓取"获取访客数据
5. 完成后直接导出CSV文件

注意：
- 只有公开访客列表的事件可以抓取
- 自动保存数据，可在这里查看和导出`);
  }

  showAbout() {
    alert(`Luma Data Scraper v2.0.0

智能的Luma事件访客数据抓取工具。

功能特性：
- 🎯 自动识别可抓取的事件
- 🤖 智能双模式抓取（自动/手动）
- 📊 实时进度显示和统计
- 📁 CSV格式数据导出
- 🔐 安全的Cookie认证

版本: 2.0.0
更新时间: 2024年12月`);
  }

  hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('hidden');
  }

  showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.remove('hidden');
  }
}

// 初始化popup
document.addEventListener('DOMContentLoaded', () => {
  new LumaPopup();
});