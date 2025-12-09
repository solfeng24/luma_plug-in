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
    
    // Events data
    this.allEvents = [];
    
    // 每个事件独立的抓取状态
    this.eventStates = new Map();
    
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
          authenticated: true,
          length: this.authValue.length
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

  // 获取或创建事件的独立状态
  getEventState(eventId, eventElement = null) {
    if (!this.eventStates.has(eventId)) {
      this.eventStates.set(eventId, {
        eventId: eventId,
        eventElement: eventElement,
        mode: 'auto',
        page: 0,
        visitors: [],
        cursor: null,
        isRunning: false,
        totalVisitors: []
      });
    }
    
    // 更新eventElement如果提供了新的
    if (eventElement) {
      this.eventStates.get(eventId).eventElement = eventElement;
    }
    
    return this.eventStates.get(eventId);
  }

  // 清除事件状态
  clearEventState(eventId) {
    this.eventStates.delete(eventId);
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
          ✅ 已认证 | 找到 ${events.filter(e => e.canScrape).length}/${events.length} 个可抓取活动
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
        ? '✅ Guest列表可见 | 🔑 有访问权限'
        : event.show_guest_list 
          ? '✅ Guest列表可见 | ❌ 无访问权限'
          : '❌ Guest列表不可见';

      eventItem.innerHTML = `
        <div class="luma-event-name">${event.name}</div>
        <div class="luma-event-info">
          📅 ${startDate}<br>
          📍 ${location}<br>
          🎫 ${event.visibility} | ${accessStatus}
        </div>
        ${event.canScrape ? `
        <div class="luma-event-actions">
          <div class="luma-btn-row">
            <button class="luma-btn luma-btn-primary scrape-auto-btn" data-event-id="${event.api_id}" data-mode="auto">
              🤖 自动抓取
            </button>
            <button class="luma-btn luma-btn-success scrape-manual-btn" data-event-id="${event.api_id}" data-mode="manual">
              👆 手动抓取
            </button>
          </div>
          <div class="luma-btn-row" style="margin-top: 8px;">
            <button class="luma-btn luma-btn-warning view-btn" data-event-id="${event.api_id}">
              查看详情
            </button>
            <button class="luma-btn luma-btn-danger stop-btn" data-event-id="${event.api_id}" style="display: none;">
              停止抓取
            </button>
          </div>
          <div class="luma-manual-controls" style="display: none;">
            <div class="luma-btn-row" style="margin-top: 8px;">
              <button class="luma-btn luma-btn-success next-page-btn" data-event-id="${event.api_id}">
                下一页
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
    const scrapeAutoBtn = eventItem.querySelector('.scrape-auto-btn');
    const scrapeManualBtn = eventItem.querySelector('.scrape-manual-btn');
    const viewBtn = eventItem.querySelector('.view-btn');
    const nextPageBtn = eventItem.querySelector('.next-page-btn');
    const stopBtn = eventItem.querySelector('.stop-btn');
    const manualControls = eventItem.querySelector('.luma-manual-controls');

    // 自动抓取按钮
    if (scrapeAutoBtn) {
      scrapeAutoBtn.addEventListener('click', () => {
        this.startEventScraping(event.api_id, eventItem, 'auto');
      });
    }

    // 手动抓取按钮
    if (scrapeManualBtn) {
      scrapeManualBtn.addEventListener('click', () => {
        this.startEventScraping(event.api_id, eventItem, 'manual');
      });
    }

    // 查看详情按钮
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        this.showEventDetails(event);
      });
    }

    // 下一页按钮
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        this.manualNextPage(event.api_id, eventItem);
      });
    }

    // 停止抓取按钮
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
      const scrapeAutoBtn = eventElement.querySelector('.scrape-auto-btn');
      const scrapeManualBtn = eventElement.querySelector('.scrape-manual-btn');
      const stopBtn = eventElement.querySelector('.stop-btn');
      const manualControls = eventElement.querySelector('.luma-manual-controls');
      
      // 获取事件独立状态
      const eventState = this.getEventState(eventApiId, eventElement);
      eventState.mode = mode;
      eventState.page = 0;
      eventState.visitors = [];
      eventState.isRunning = true;
      eventState.cursor = null;
      
      progressEl.classList.add('active');
      
      // 禁用抓取按钮，显示停止按钮
      if (scrapeAutoBtn) {
        scrapeAutoBtn.disabled = true;
        scrapeAutoBtn.textContent = mode === 'auto' ? '🤖 抓取中...' : '🤖 自动抓取';
      }
      if (scrapeManualBtn) {
        scrapeManualBtn.disabled = true;
        scrapeManualBtn.textContent = mode === 'manual' ? '👆 抓取中...' : '👆 手动抓取';
      }
      
      stopBtn.style.display = 'inline-block';
      
      if (mode === 'manual') {
        manualControls.style.display = 'block';
      }
      
      await this.fetchNextPage(eventApiId);
      
    } catch (error) {
      console.error('Event scraping failed:', error);
      
      const progressText = eventElement.querySelector('.progress-text');
      const scrapeAutoBtn = eventElement.querySelector('.scrape-auto-btn');
      const scrapeManualBtn = eventElement.querySelector('.scrape-manual-btn');
      const stopBtn = eventElement.querySelector('.stop-btn');
      
      if (progressText) {
        progressText.textContent = `抓取失败: ${error.message}`;
      }
      
      // 重置按钮状态
      if (scrapeAutoBtn) {
        scrapeAutoBtn.textContent = '🤖 自动抓取';
        scrapeAutoBtn.disabled = false;
        scrapeAutoBtn.style.background = '#dc3545';
      }
      if (scrapeManualBtn) {
        scrapeManualBtn.textContent = '👆 手动抓取';
        scrapeManualBtn.disabled = false;
        scrapeManualBtn.style.background = '#dc3545';
      }
      if (stopBtn) {
        stopBtn.style.display = 'none';
      }
      
      this.isRunning = false;
      
      if (error.message.includes('扩展') || error.message.includes('Extension')) {
        this.showExtensionError();
      }
    }
  }

  // Fetch next page of visitor data
  async fetchNextPage(eventId) {
    const eventState = this.getEventState(eventId);
    
    if (!eventState.isRunning) {
      console.log('❌ 抓取已停止');
      return;
    }
    
    if (!this.authValue || !this.cookieHeader) {
      console.log('❌ 认证失败');
      const cookieSuccess = await this.getCookies();
      if (!cookieSuccess) {
        console.log('❌ 重新获取Cookie失败，停止抓取');
        this.stopScraping(eventId, eventState.eventElement);
        return;
      }
      console.log('✅ 重新获取Cookie成功，继续抓取');
    }
    
    if (!eventId) {
      console.log('❌ 无效的事件ID');
      return;
    }

    const progressText = eventState.eventElement.querySelector('.progress-text');
    const progressFill = eventState.eventElement.querySelector('.luma-progress-fill');
    const pageCountEl = eventState.eventElement.querySelector('.page-count');
    const dataCountEl = eventState.eventElement.querySelector('.data-count');
    
    eventState.page++;
    progressText.textContent = `抓取第 ${eventState.page} 页...`;
    
    try {
      const baseUrl = "https://api2.luma.com/event/get-guest-list";
      const url = new URL(baseUrl);
      url.searchParams.set("event_api_id", eventId);
      url.searchParams.set("pagination_limit", "100");
      
      if (eventState.cursor) {
        url.searchParams.set("pagination_cursor", eventState.cursor);
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
      console.log(`📄 第 ${eventState.page} 页响应:`, data);

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
            updated_at: entry.updated_at || user.updated_at
          };
        }).filter(v => v !== null);
      }

      // 添加去重逻辑，根据api_id去重
      const existingIds = new Set(eventState.totalVisitors.map(v => v.api_id));
      const newVisitors = pageVisitors.filter(v => !existingIds.has(v.api_id));
      eventState.totalVisitors = [...eventState.totalVisitors, ...newVisitors];
      
      pageCountEl.textContent = eventState.page;
      dataCountEl.textContent = eventState.totalVisitors.length;
      progressText.textContent = `第 ${eventState.page} 页完成，共 ${newVisitors.length} 条新数据 (去重后)`;
      progressFill.style.width = Math.min((eventState.page / 10) * 100, 90) + '%';

      console.log(`✅ 第 ${eventState.page} 页完成，本页 ${pageVisitors.length} 条，新增 ${newVisitors.length} 条，累计 ${eventState.totalVisitors.length} 条`);
      
      eventState.cursor = data.next_cursor || data.pagination_cursor || data.cursor;
      const hasMore = !!eventState.cursor && pageVisitors.length > 0;

      if (hasMore && eventState.mode === 'auto') {
        const delay = Math.floor(Math.random() * 3000) + 3000; // 3-6秒随机延迟
        progressText.textContent = `等待 ${Math.ceil(delay/1000)} 秒后继续...`;
        
        setTimeout(() => {
          this.fetchNextPage(eventId);
        }, delay);
      } else if (hasMore && eventState.mode === 'manual') {
        progressText.textContent = `第 ${eventState.page} 页完成，点击"下一页"继续`;
        const nextBtn = eventState.eventElement.querySelector('.next-page-btn');
        nextBtn.disabled = false;
        nextBtn.textContent = '下一页';
      } else {
        await this.completeScraping(eventId);
      }

    } catch (error) {
      console.error(`❌ 第 ${eventState.page} 页抓取失败:`, error);
      progressText.textContent = `第 ${eventState.page} 页失败: ${error.message}`;
      
      if (eventState.mode === 'manual') {
        const nextBtn = eventState.eventElement.querySelector('.next-page-btn');
        nextBtn.disabled = false;
        nextBtn.textContent = '重试';
      }
    }
  }

  // Manual next page
  async manualNextPage(eventApiId, eventElement) {
    const nextBtn = eventElement.querySelector('.next-page-btn');
    nextBtn.disabled = true;
    nextBtn.textContent = '抓取中...';
    
    await this.fetchNextPage(eventApiId);
  }

  // Stop scraping
  stopScraping(eventApiId, eventElement) {
    console.log(`⏹️ 停止抓取事件 ${eventApiId}`);
    
    const eventState = this.getEventState(eventApiId, eventElement);
    eventState.isRunning = false;
    
    if (!eventElement) {
      console.log('⚠️ eventElement为空，无法更新UI');
      return;
    }
    
    const progressText = eventElement.querySelector('.progress-text');
    const scrapeAutoBtn = eventElement.querySelector('.scrape-auto-btn');
    const scrapeManualBtn = eventElement.querySelector('.scrape-manual-btn');
    const stopBtn = eventElement.querySelector('.stop-btn');
    const manualControls = eventElement.querySelector('.luma-manual-controls');
    
    if (progressText) {
      progressText.textContent = `已停止 (共抓取 ${eventState.totalVisitors ? eventState.totalVisitors.length : 0} 条数据)`;
    }
    
    // 重置按钮状态并添加重置按钮
    if (scrapeAutoBtn) {
      scrapeAutoBtn.textContent = '🤖 自动抓取';
      scrapeAutoBtn.disabled = true;
      scrapeAutoBtn.style.background = '#6c757d';
    }
    if (scrapeManualBtn) {
      scrapeManualBtn.textContent = '👆 手动抓取';
      scrapeManualBtn.disabled = true;
      scrapeManualBtn.style.background = '#6c757d';
    }
    if (stopBtn) {
      stopBtn.style.display = 'none';
    }
    
    // 添加重置按钮
    this.addResetButton(eventElement, eventApiId);
    
    if (manualControls) {
      manualControls.style.display = 'none';
    }
    
    if (eventState.totalVisitors && eventState.totalVisitors.length > 0) {
      this.completeScraping(eventApiId);
    }
  }

  // Complete scraping
  async completeScraping(eventId) {
    const eventState = this.getEventState(eventId);
    console.log(`🎉 抓取完成! 共获取 ${eventState.totalVisitors.length} 条guest数据`);
    
    const progressText = eventState.eventElement.querySelector('.progress-text');
    const progressFill = eventState.eventElement.querySelector('.luma-progress-fill');
    const scrapeAutoBtn = eventState.eventElement.querySelector('.scrape-auto-btn');
    const scrapeManualBtn = eventState.eventElement.querySelector('.scrape-manual-btn');
    const stopBtn = eventState.eventElement.querySelector('.stop-btn');
    const manualControls = eventState.eventElement.querySelector('.luma-manual-controls');
    
    progressText.textContent = `抓取完成! 共 ${eventState.totalVisitors.length} 条guest数据`;
    progressFill.style.width = '100%';
    
    // 更新按钮状态
    if (scrapeAutoBtn) {
      scrapeAutoBtn.textContent = '✅ 抓取完成';
      scrapeAutoBtn.style.background = '#28a745';
      scrapeAutoBtn.disabled = true;
    }
    if (scrapeManualBtn) {
      scrapeManualBtn.textContent = '✅ 抓取完成';
      scrapeManualBtn.style.background = '#28a745';
      scrapeManualBtn.disabled = true;
    }
    if (stopBtn) {
      stopBtn.style.display = 'none';
    }
    manualControls.style.display = 'none';
    
    eventState.isRunning = false;

    if (eventState.totalVisitors.length > 0) {
      try {
        if (!this.extensionValid) {
          throw new Error('扩展上下文已失效，无法保存到扩展存储');
        }
        
        await this.safeChromeMessage({
          action: 'saveData',
          data: {
            source: 'api',
            event_api_id: eventState.eventId,
            data: eventState.totalVisitors,
            timestamp: Date.now(),
            url: window.location.href,
            total_visitors: eventState.totalVisitors.length,
            pages_scraped: eventState.page,
            mode: eventState.mode
          }
        });

        console.log('✅ 数据已保存到本地存储');
        this.addExportButton(eventState.eventElement, eventState.totalVisitors, eventState.eventId);
        this.addResetButton(eventState.eventElement, eventState.eventId);
        
      } catch (error) {
        console.error('❌ 保存数据失败:', error);
        
        if (error.message.includes('扩展') || error.message.includes('Extension')) {
          progressText.textContent = `抓取完成! 扩展存储失效，请直接导出CSV`;
          this.addExportButton(eventState.eventElement, eventState.totalVisitors, eventState.eventId);
          this.addResetButton(eventState.eventElement, eventState.eventId);
        } else {
          progressText.textContent = `抓取完成但保存失败: ${error.message}`;
        }
      }
    }
  }

  // Add export button
  addExportButton(eventElement, visitors, eventId) {
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
      this.exportToCSV(visitors, eventId);
    });
    
    actionsRow.parentNode.appendChild(exportBtn);
  }

  // Add reset button
  addResetButton(eventElement, eventApiId) {
    const actionsContainer = eventElement.querySelector('.luma-event-actions');
    
    // 检查是否已经有重置按钮
    if (actionsContainer.querySelector('.reset-btn')) {
      return;
    }
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'luma-btn luma-btn-secondary reset-btn';
    resetBtn.textContent = '🔄 重置状态';
    resetBtn.style.cssText = `
      margin-top: 8px;
      width: 100%;
      background: #17a2b8;
      color: white;
    `;
    
    resetBtn.addEventListener('click', () => {
      this.resetEventState(eventApiId, eventElement);
    });
    
    actionsContainer.appendChild(resetBtn);
  }

  // Reset event state to initial condition
  resetEventState(eventApiId, eventElement) {
    console.log(`🔄 重置事件状态: ${eventApiId}`);
    
    // 清除事件状态
    this.clearEventState(eventApiId);
    
    // 重置UI元素
    const progressEl = eventElement.querySelector('.luma-progress');
    const progressText = eventElement.querySelector('.progress-text');
    const progressFill = eventElement.querySelector('.luma-progress-fill');
    const pageCountEl = eventElement.querySelector('.page-count');
    const dataCountEl = eventElement.querySelector('.data-count');
    const scrapeAutoBtn = eventElement.querySelector('.scrape-auto-btn');
    const scrapeManualBtn = eventElement.querySelector('.scrape-manual-btn');
    const stopBtn = eventElement.querySelector('.stop-btn');
    const manualControls = eventElement.querySelector('.luma-manual-controls');
    const resetBtn = eventElement.querySelector('.reset-btn');
    const exportBtn = eventElement.querySelector('.export-btn');
    
    // 隐藏进度条
    if (progressEl) {
      progressEl.classList.remove('active');
    }
    
    // 重置进度文本和填充
    if (progressText) {
      progressText.textContent = '准备中...';
    }
    if (progressFill) {
      progressFill.style.width = '0%';
    }
    if (pageCountEl) {
      pageCountEl.textContent = '0';
    }
    if (dataCountEl) {
      dataCountEl.textContent = '0';
    }
    
    // 重置按钮状态
    if (scrapeAutoBtn) {
      scrapeAutoBtn.textContent = '🤖 自动抓取';
      scrapeAutoBtn.disabled = false;
      scrapeAutoBtn.style.background = '';
    }
    if (scrapeManualBtn) {
      scrapeManualBtn.textContent = '👆 手动抓取';
      scrapeManualBtn.disabled = false;
      scrapeManualBtn.style.background = '';
    }
    if (stopBtn) {
      stopBtn.style.display = 'none';
    }
    if (manualControls) {
      manualControls.style.display = 'none';
    }
    
    // 移除重置按钮和导出按钮
    if (resetBtn) {
      resetBtn.remove();
    }
    if (exportBtn) {
      exportBtn.remove();
    }
    
    console.log('✅ 事件状态已重置到初始状态');
  }

  // Export to CSV
  exportToCSV(visitors, eventId, eventName = null) {
    if (!visitors || visitors.length === 0) {
      alert('没有数据可导出');
      return;
    }

    // 如果没有提供事件名称，尝试从 allEvents 中查找
    if (!eventName && this.allEvents) {
      const event = this.allEvents.find(e => e.api_id === eventId);
      eventName = event ? event.name : null;
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
    
    // 生成文件名
    const now = new Date();
    const dateTime = now.getFullYear() + 
      String(now.getMonth() + 1).padStart(2, '0') + 
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') + 
      String(now.getMinutes()).padStart(2, '0') + 
      String(now.getSeconds()).padStart(2, '0');
    
    // 清理会议名称，移除不适合文件名的字符
    const cleanEventName = eventName 
      ? eventName.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50)
      : 'luma_event';
    
    a.download = `${cleanEventName}_guest_${dateTime}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`📁 CSV文件已下载: ${visitors.length} 条guest数据, 文件名: ${a.download}`);
  }

  // Create fallback UI
  createFallbackUI() {
    console.log('Creating fallback UI...');
  }

  // Show event details
  showEventDetails(event) {
    // 移除已存在的详情弹窗
    const existingModal = document.querySelector('#luma-event-detail-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // 创建详情弹窗
    const modal = document.createElement('div');
    modal.id = 'luma-event-detail-modal';
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

    const modalContent = document.createElement('div');
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
    const location = event.location_type === 'offline' 
      ? (event.geo_address_info?.address || event.geo_address_info?.city || '线下活动')
      : event.location_type;
    
    const accessStatus = event.canScrape 
      ? '✅ Guest列表可见 | 🔑 有访问权限'
      : event.show_guest_list 
        ? '✅ Guest列表可见 | ❌ 无访问权限'
        : '❌ Guest列表不可见';

    modalContent.innerHTML = `
      <div style="position: relative;">
        ${event.cover_url ? `
          <img src="${event.cover_url}" alt="活动封面" style="
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 12px 12px 0 0;
          "/>
        ` : `
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
        `}
        
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
              <div><strong>开始时间:</strong> ${startDate.toLocaleString()}</div>
              ${endDate ? `<div><strong>结束时间:</strong> ${endDate.toLocaleString()}</div>` : ''}
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📍</span>
            <div><strong>地点:</strong> ${location}</div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🎫</span>
            <div><strong>可见性:</strong> ${event.visibility}</div>
          </div>
          
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-size: 16px;">🔐</span>
            <div><strong>抓取状态:</strong> ${accessStatus}</div>
          </div>
          
          ${event.description ? `
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span style="font-size: 16px;">📝</span>
              <div>
                <div><strong>描述:</strong></div>
                <div style="margin-top: 4px; line-height: 1.5; max-height: 120px; overflow-y: auto; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                  ${event.description.replace(/\n/g, '<br>')}
                </div>
              </div>
            </div>
          ` : ''}
          
          ${event.guest_count ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">👥</span>
              <div><strong>参与人数:</strong> ${event.guest_count} 人</div>
            </div>
          ` : ''}
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
            🔗 查看原页面
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
            关闭
          </button>
        </div>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 点击模态框背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // ESC键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
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