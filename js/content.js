// Luma Data Scraper Content Script - Clean Version

class LumaDataScraper {
  constructor() {
    this.isRunning = false;
    this.initComplete = false;
    this.extensionValid = true;
    
    // Authentication
    this.authCookie = null;
    this.authValue = null;
    this.cookieHeader = null;
    
    // Current scraping session
    this.currentEventId = null;
    this.currentEventElement = null;
    this.currentMode = 'auto';
    this.currentPage = 0;
    this.totalVisitors = [];
    this.cursor = null;
    this.allEvents = [];
    
    this.init();
  }

  // Safe Chrome API wrapper
  async safeChromeMessage(message) {
    try {
      if (!chrome?.runtime?.sendMessage) {
        throw new Error('Chrome扩展API不可用');
      }
      
      if (!chrome.runtime.id) {
        throw new Error('扩展上下文已失效');
      }
      
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      if (error.message.includes('Extension context invalidated') || 
          error.message.includes('扩展上下文已失效')) {
        console.log('🔄 扩展上下文失效，尝试重新初始化...');
        this.extensionValid = false;
        this.showExtensionError();
        throw new Error('扩展已重新加载，请刷新页面');
      }
      throw error;
    }
  }

  // Show extension error notification
  showExtensionError() {
    const existingError = document.querySelector('#luma-extension-error');
    if (existingError) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.id = 'luma-extension-error';
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
      <div style="margin-bottom: 10px;"><strong>🔄 插件需要重新加载</strong></div>
      <div style="margin-bottom: 10px;">扩展已更新，请刷新页面以继续使用</div>
      <button onclick="window.location.reload()" style="
        background: white;
        color: #ff4757;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">刷新页面</button>
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
    console.log('🎯 Luma Data Scraper initialized on:', window.location.href);
    
    try {
      const cookieSuccess = await this.getCookies();
      console.log('Cookie获取结果:', cookieSuccess);
      
      await this.initEventsList();
      
      window.lumaDataScraper = this;
      this.initComplete = true;
      console.log('✅ Luma插件初始化完成');
      
    } catch (error) {
      console.error('❌ Luma插件初始化失败:', error);
      this.initComplete = false;
    }
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  // Get authentication cookies
  async getCookies() {
    try {
      if (!this.extensionValid) {
        throw new Error('扩展上下文已失效');
      }
      
      const response = await this.safeChromeMessage({ action: 'getCookies' });
      if (response.success) {
        this.authCookie = response.authCookie;
        this.authValue = response.authValue;
        this.cookieHeader = response.cookieHeader;
        console.log('Auth cookie loaded:', {
          domain: response.domain,
          value: this.authValue.substring(0, 20) + '...'
        });
        return true;
      } else {
        console.error('Auth cookie not found:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Failed to get auth cookie:', error);
      
      if (error.message.includes('扩展') || error.message.includes('Extension')) {
        this.extensionValid = false;
      }
      
      return false;
    }
  }

  // Initialize events list UI
  async initEventsList() {
    if (!this.authValue) {
      console.log('❌ No auth token, skipping events list initialization');
      this.createFallbackUI();
      return;
    }

    console.log('🔄 Initializing events list...');
    
    try {
      const userEvents = await this.getUserEvents();
      if (!userEvents) {
        console.log('❌ No response from API');
        this.createFallbackUI();
        return;
      }
      
      if (!userEvents.events) {
        console.log('❌ No events array in response:', userEvents);
        this.createFallbackUI();
        return;
      }

      const allEvents = userEvents.events.map(item => {
        const event = item.event || item;  // 处理嵌套的事件数据结构
        return {
          ...event,
          canScrape: event.show_guest_list === true && event.virtual_info?.has_access === true
        };
      });

      this.allEvents = allEvents;
      this.createEventsListUI(allEvents);
      
    } catch (error) {
      console.error('❌ Error in initEventsList:', error);
      this.createFallbackUI();
    }
  }

  // Create events list UI
  createEventsListUI(events) {
    const container = document.createElement('div');
    container.id = 'luma-scraper-events-container';
    container.innerHTML = `
      <div class="luma-scraper-header">
        <h3>🎯 Luma数据抓取器</h3>
        <div class="luma-status">
          ✅ 认证成功 | 找到 ${events.filter(e => e.canScrape).length}/${events.length} 个可抓取活动
        </div>
      </div>
      <div class="luma-events-list" id="luma-events-list">
        ${events.length === 0 ? '<div class="no-events">暂无可抓取的活动</div>' : ''}
      </div>
    `;

    const style = document.createElement('style');
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
        top: 20px;
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
      }
      .luma-scraper-header h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
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
      .luma-btn-primary {
        background: #667eea;
        color: white;
      }
      .luma-btn-primary:hover {
        background: #5a6fd8;
        transform: translateY(-1px);
      }
      .luma-btn-warning {
        background: #ffc107;
        color: #212529;
      }
      .luma-btn-warning:hover {
        background: #e0a800;
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
      .luma-btn-disabled {
        background: #6c757d;
        color: white;
        cursor: not-allowed;
        opacity: 0.65;
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
        background: linear-gradient(90deg, #667eea, #764ba2);
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
      }
      .luma-minimize-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      #luma-scraper-events-container.minimized {
        width: 60px;
        height: 60px;
      }
      #luma-scraper-events-container.minimized .luma-scraper-header {
        padding: 18px;
        text-align: center;
      }
      #luma-scraper-events-container.minimized h3 {
        display: none;
      }
      #luma-scraper-events-container.minimized .luma-status {
        display: none;
      }
      #luma-scraper-events-container.minimized .luma-events-list {
        display: none;
      }
    `;
  }

  // Add minimize button
  addMinimizeButton(container) {
    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'luma-minimize-btn';
    minimizeBtn.textContent = '−';
    minimizeBtn.addEventListener('click', () => {
      container.classList.toggle('minimized');
      minimizeBtn.textContent = container.classList.contains('minimized') ? '+' : '−';
    });
    container.querySelector('.luma-scraper-header').appendChild(minimizeBtn);
  }

  // Populate events list
  populateEventsList(events) {
    const listContainer = document.getElementById('luma-events-list');
    
    events.forEach(event => {
      const eventItem = document.createElement('div');
      eventItem.className = 'luma-event-item';
      
      const startDate = new Date(event.start_at).toLocaleString();
      const location = event.location_type === 'offline' 
        ? event.geo_address_info?.city || '线下活动'
        : event.location_type;

      const accessStatus = event.canScrape 
        ? '✅ 访客列表可见 | 🔑 有访问权限'
        : event.show_guest_list 
          ? '✅ 访客列表可见 | ❌ 无访问权限'
          : '❌ 访客列表不可见';

      eventItem.innerHTML = `
        <div class="luma-event-name">${event.name}</div>
        <div class="luma-event-info">
          📅 ${startDate}<br>
          📍 ${location}<br>
          🎫 ${event.visibility} | ${accessStatus}
        </div>
        ${event.canScrape ? `
        <div class="luma-event-actions">
          <div class="luma-scrape-mode">
            <button class="luma-mode-btn mode-auto active" data-mode="auto">🤖 自动翻页</button>
            <button class="luma-mode-btn mode-manual" data-mode="manual">👆 手动翻页</button>
          </div>
          <div class="luma-btn-row">
            <button class="luma-btn luma-btn-primary scrape-btn" data-event-id="${event.api_id}">
              开始抓取
            </button>
            <button class="luma-btn luma-btn-warning view-btn" data-event-id="${event.api_id}">
              查看详情
            </button>
          </div>
          <div class="luma-manual-controls" style="display: none;">
            <div class="luma-btn-row" style="margin-top: 8px;">
              <button class="luma-btn luma-btn-success next-page-btn" data-event-id="${event.api_id}">
                下一页
              </button>
              <button class="luma-btn luma-btn-danger stop-btn" data-event-id="${event.api_id}">
                停止抓取
              </button>
            </div>
          </div>
        </div>
        ` : `
        <div class="luma-event-actions">
          <div class="luma-btn-row">
            <button class="luma-btn luma-btn-disabled" disabled>
              无法抓取
            </button>
            <button class="luma-btn luma-btn-warning view-btn" data-event-id="${event.api_id}">
              查看详情
            </button>
          </div>
        </div>
        `}
        <div class="luma-progress" id="progress-${event.api_id}">
          <div class="progress-text">准备中...</div>
          <div class="luma-progress-bar">
            <div class="luma-progress-fill"></div>
          </div>
          <div class="progress-stats" style="font-size: 11px; margin-top: 4px; color: #666;">
            页数: <span class="page-count">0</span> | 数据: <span class="data-count">0</span> 条
          </div>
        </div>
      `;

      listContainer.appendChild(eventItem);
      this.bindEventHandlers(eventItem, event);
    });
  }

  // Bind event handlers
  bindEventHandlers(eventItem, event) {
    const modeButtons = eventItem.querySelectorAll('.luma-mode-btn');
    const manualControls = eventItem.querySelector('.luma-manual-controls');
    
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mode = btn.dataset.mode;
        if (mode === 'manual') {
          manualControls.style.display = 'block';
        } else {
          manualControls.style.display = 'none';
        }
      });
    });

    const scrapeBtn = eventItem.querySelector('.scrape-btn');
    const viewBtn = eventItem.querySelector('.view-btn');
    const nextPageBtn = eventItem.querySelector('.next-page-btn');
    const stopBtn = eventItem.querySelector('.stop-btn');

    if (scrapeBtn) {
      scrapeBtn.addEventListener('click', () => {
        const mode = eventItem.querySelector('.luma-mode-btn.active').dataset.mode;
        this.startEventScraping(event.api_id, eventItem, mode);
      });
    }

    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        this.showEventDetails(event);
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        this.manualNextPage(eventItem);
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.stopScraping(event.api_id, eventItem);
      });
    }
  }

  // Start event scraping
  async startEventScraping(eventApiId, eventElement, mode = 'auto') {
    console.log(`🚀 开始抓取事件 ${eventApiId}，模式: ${mode}`);
    
    try {
      if (!this.extensionValid) {
        throw new Error('扩展上下文已失效，请刷新页面');
      }
      
      await this.safeChromeMessage({ action: 'getCookies' });
      
      const progressEl = eventElement.querySelector('.luma-progress');
      const scrapeBtn = eventElement.querySelector('.scrape-btn');
      const manualControls = eventElement.querySelector('.luma-manual-controls');
      
      this.currentEventId = eventApiId;
      this.currentEventElement = eventElement;
      this.currentMode = mode;
      this.currentPage = 0;
      this.totalVisitors = [];
      this.isRunning = true;
      this.cursor = null;
      
      progressEl.classList.add('active');
      scrapeBtn.disabled = true;
      scrapeBtn.textContent = '抓取中...';
      
      if (mode === 'manual') {
        manualControls.style.display = 'block';
      }
      
      await this.fetchNextPage();
      
    } catch (error) {
      console.error('Event scraping failed:', error);
      
      const progressText = eventElement.querySelector('.progress-text');
      const scrapeBtn = eventElement.querySelector('.scrape-btn');
      
      if (progressText) {
        progressText.textContent = `抓取失败: ${error.message}`;
      }
      
      if (scrapeBtn) {
        scrapeBtn.textContent = '抓取失败';
        scrapeBtn.disabled = false;
        scrapeBtn.style.background = '#dc3545';
      }
      
      this.isRunning = false;
      
      if (error.message.includes('扩展') || error.message.includes('Extension')) {
        this.showExtensionError();
      }
    }
  }

  // Fetch next page of visitor data
  async fetchNextPage() {
    if (!this.isRunning) {
      console.log('❌ 抓取已停止');
      return;
    }
    
    if (!this.authValue || !this.cookieHeader) {
      console.log('❌ 认证失败');
      const cookieSuccess = await this.getCookies();
      if (!cookieSuccess) {
        console.log('❌ 重新获取Cookie失败，停止抓取');
        this.stopScraping(this.currentEventId, this.currentEventElement);
        return;
      }
      console.log('✅ 重新获取Cookie成功，继续抓取');
    }
    
    if (!this.currentEventId) {
      console.log('❌ 无效的事件ID');
      return;
    }

    const progressText = this.currentEventElement.querySelector('.progress-text');
    const progressFill = this.currentEventElement.querySelector('.luma-progress-fill');
    const pageCountEl = this.currentEventElement.querySelector('.page-count');
    const dataCountEl = this.currentEventElement.querySelector('.data-count');
    
    this.currentPage++;
    progressText.textContent = `抓取第 ${this.currentPage} 页...`;
    
    try {
      const baseUrl = "https://api2.luma.com/event/get-guest-list";
      const url = new URL(baseUrl);
      url.searchParams.set("event_api_id", this.currentEventId);
      url.searchParams.set("pagination_limit", "100");
      
      if (this.cursor) {
        url.searchParams.set("pagination_cursor", this.cursor);
      }

      const headers = {
        'accept': 'application/json',
        'accept-language': 'zh',
        'cookie': this.cookieHeader,
        'origin': 'https://luma.com',
        'referer': 'https://luma.com/',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'x-luma-client-type': 'luma-web',
        'x-luma-web-url': 'https://luma.com/home'
      };

      console.log(`📡 API调用: ${url.toString()}`);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📄 第 ${this.currentPage} 页响应:`, data);

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
        pageVisitors = rawEntries.map(entry => {
          const user = entry.user || entry.guest || entry;
          
          if (!user || !user.api_id) {
            return null;
          }
          
          return {
            api_id: user.api_id,
            event_api_id: this.currentEventId,
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
            updated_at: entry.updated_at || user.updated_at
          };
        }).filter(v => v !== null);
      }

      this.totalVisitors = [...this.totalVisitors, ...pageVisitors];
      
      pageCountEl.textContent = this.currentPage;
      dataCountEl.textContent = this.totalVisitors.length;
      progressText.textContent = `第 ${this.currentPage} 页完成，共 ${pageVisitors.length} 条新数据`;
      progressFill.style.width = Math.min((this.currentPage / 10) * 100, 90) + '%';

      console.log(`✅ 第 ${this.currentPage} 页完成，本页 ${pageVisitors.length} 条，累计 ${this.totalVisitors.length} 条`);
      
      this.cursor = data.next_cursor || data.pagination_cursor || data.cursor;
      const hasMore = !!this.cursor && pageVisitors.length > 0;

      if (hasMore && this.currentMode === 'auto') {
        const delay = Math.floor(Math.random() * 3000) + 3000; // 3-6秒随机延迟
        progressText.textContent = `等待 ${Math.ceil(delay/1000)} 秒后继续...`;
        
        setTimeout(() => {
          this.fetchNextPage();
        }, delay);
      } else if (hasMore && this.currentMode === 'manual') {
        progressText.textContent = `第 ${this.currentPage} 页完成，点击"下一页"继续`;
        const nextBtn = this.currentEventElement.querySelector('.next-page-btn');
        nextBtn.disabled = false;
        nextBtn.textContent = '下一页';
      } else {
        await this.completeScraping();
      }

    } catch (error) {
      console.error(`❌ 第 ${this.currentPage} 页抓取失败:`, error);
      progressText.textContent = `第 ${this.currentPage} 页失败: ${error.message}`;
      
      if (this.currentMode === 'manual') {
        const nextBtn = this.currentEventElement.querySelector('.next-page-btn');
        nextBtn.disabled = false;
        nextBtn.textContent = '重试';
      }
    }
  }

  // Manual next page
  async manualNextPage(eventElement) {
    const nextBtn = eventElement.querySelector('.next-page-btn');
    nextBtn.disabled = true;
    nextBtn.textContent = '抓取中...';
    
    await this.fetchNextPage();
  }

  // Stop scraping
  stopScraping(eventApiId, eventElement) {
    console.log(`⏹️ 停止抓取事件 ${eventApiId}`);
    
    this.isRunning = false;
    
    if (!eventElement) {
      console.log('⚠️ eventElement为空，无法更新UI');
      return;
    }
    
    const progressText = eventElement.querySelector('.progress-text');
    const scrapeBtn = eventElement.querySelector('.scrape-btn');
    const manualControls = eventElement.querySelector('.luma-manual-controls');
    
    if (progressText) {
      progressText.textContent = `已停止 (共抓取 ${this.totalVisitors ? this.totalVisitors.length : 0} 条数据)`;
    }
    
    if (scrapeBtn) {
      scrapeBtn.textContent = '已停止';
      scrapeBtn.disabled = true;
    }
    
    if (manualControls) {
      manualControls.style.display = 'none';
    }
    
    if (this.totalVisitors && this.totalVisitors.length > 0) {
      this.completeScraping();
    }
  }

  // Complete scraping
  async completeScraping() {
    console.log(`🎉 抓取完成! 共获取 ${this.totalVisitors.length} 条访客数据`);
    
    const progressText = this.currentEventElement.querySelector('.progress-text');
    const progressFill = this.currentEventElement.querySelector('.luma-progress-fill');
    const scrapeBtn = this.currentEventElement.querySelector('.scrape-btn');
    const manualControls = this.currentEventElement.querySelector('.luma-manual-controls');
    
    progressText.textContent = `抓取完成! 共 ${this.totalVisitors.length} 条访客数据`;
    progressFill.style.width = '100%';
    scrapeBtn.textContent = '抓取完成';
    scrapeBtn.style.background = '#28a745';
    manualControls.style.display = 'none';
    
    this.isRunning = false;

    if (this.totalVisitors.length > 0) {
      try {
        if (!this.extensionValid) {
          throw new Error('扩展上下文已失效，无法保存到扩展存储');
        }
        
        await this.safeChromeMessage({
          action: 'saveData',
          data: {
            source: 'api',
            event_api_id: this.currentEventId,
            data: this.totalVisitors,
            timestamp: Date.now(),
            url: window.location.href,
            total_visitors: this.totalVisitors.length,
            pages_scraped: this.currentPage,
            mode: this.currentMode
          }
        });

        console.log('✅ 数据已保存到本地存储');
        this.addExportButton(this.currentEventElement, this.totalVisitors);
        
      } catch (error) {
        console.error('❌ 保存数据失败:', error);
        
        if (error.message.includes('扩展') || error.message.includes('Extension')) {
          progressText.textContent = `抓取完成! 扩展存储失效，请直接导出CSV`;
          this.addExportButton(this.currentEventElement, this.totalVisitors);
        } else {
          progressText.textContent = `抓取完成但保存失败: ${error.message}`;
        }
      }
    }
  }

  // Add export button
  addExportButton(eventElement, visitors) {
    const actionsRow = eventElement.querySelector('.luma-btn-row');
    
    if (actionsRow.querySelector('.export-btn')) {
      return;
    }
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'luma-btn luma-btn-success export-btn';
    exportBtn.textContent = `导出 CSV (${visitors.length}条)`;
    exportBtn.style.marginTop = '8px';
    exportBtn.style.width = '100%';
    
    exportBtn.addEventListener('click', () => {
      this.exportToCSV(visitors, this.currentEventId);
    });
    
    actionsRow.parentNode.appendChild(exportBtn);
  }

  // Export to CSV
  exportToCSV(visitors, eventId) {
    if (!visitors || visitors.length === 0) {
      alert('没有数据可导出');
      return;
    }

    const headers = [
      'name', 'username', 'api_id', 'website', 'timezone', 'bio_short',
      'is_verified', 'last_online_at', 'twitter_handle', 'youtube_handle',
      'linkedin_handle', 'instagram_handle', 'avatar_url', 'created_at', 'updated_at'
    ];
    
    const csvContent = [
      headers.join(','),
      ...visitors.map(visitor => 
        headers.map(header => {
          const value = visitor[header] || '';
          if (value.toString().includes(',') || value.toString().includes('"')) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luma_visitors_${eventId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`📁 CSV文件已下载: ${visitors.length} 条访客数据`);
  }

  // Create fallback UI
  createFallbackUI() {
    console.log('Creating fallback UI...');
  }

  // Show event details
  showEventDetails(event) {
    alert(`事件详情:\n\n名称: ${event.name}\n时间: ${new Date(event.start_at).toLocaleString()}\n链接: https://lu.ma/${event.url}`);
  }

  // Get user events from API
  async getUserEvents() {
    try {
      const apiUrl = 'https://api2.luma.com/search/get-results?query=';
      const headers = {
        'accept': '*/*',
        'accept-language': 'zh',
        'cookie': this.cookieHeader,
        'origin': 'https://luma.com',
        'referer': 'https://luma.com/',
        'x-luma-client-type': 'luma-web',
        'x-luma-web-url': 'https://luma.com/home'
      };

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user events:', error);
      return null;
    }
  }

  // Handle messages from popup
  handleMessage(request, _sender, sendResponse) {
    if (request.action === 'getStatus') {
      sendResponse({
        isRunning: this.isRunning,
        currentPage: this.currentPage,
        dataCount: this.totalVisitors ? this.totalVisitors.length : 0
      });
    } else if (request.action === 'startScraping') {
      console.log('⚠️ 接收到旧的startScraping消息，已忽略');
      sendResponse({ success: true });
    } else if (request.action === 'stopScraping') {
      console.log('⚠️ 接收到旧的stopScraping消息，已忽略');
      sendResponse({ success: true });
    } else if (request.action === 'checkStatus') {
      const eventsContainer = document.querySelector('#luma-events-list');
      sendResponse({
        loaded: true,
        eventsListVisible: eventsContainer && eventsContainer.style.display !== 'none',
        eventsCount: this.allEvents ? this.allEvents.length : 0,
        containerExists: !!eventsContainer,
        authStatus: !!this.authValue,
        initComplete: this.initComplete || false
      });
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LumaDataScraper();
  });
} else {
  new LumaDataScraper();
}