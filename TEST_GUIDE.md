# Luma插件测试指南

## 🚀 快速测试流程

### 1. 环境准备 (5分钟)
```bash
✅ 安装Chrome插件 (chrome://extensions/ → 开发者模式 → 加载插件)
✅ 登录Luma账户 (https://luma.com)
✅ 测试Cookie获取 (打开test-cookie.html)
```

### 2. 基础功能测试 (3分钟)
```bash
✅ 点击插件图标 → 查看连接状态
✅ 确认Auth Cookie状态显示 "✅ Auth Cookie 已获取"
✅ 检查认证详细信息显示正确的AuthToken
```

### 3. 事件发现测试 (5分钟)
```bash
✅ 点击"查看可用事件"按钮
✅ 查看事件列表弹窗是否正常显示
✅ 确认API状态显示 "找到 X 个事件"
✅ 检查事件详情（名称、时间、地点、权限状态）
```

### 4. 数据抓取测试 (5-10分钟)
```bash
✅ 选择有 ✅ 标记的事件
✅ 确认开始抓取并观察进度
✅ 等待API抓取完成
✅ 查看数据统计 "共获取 X 条访客数据"
```

### 5. 数据导出测试 (2分钟)
```bash
✅ 点击"导出数据"按钮
✅ 确认CSV文件下载
✅ 打开CSV文件检查数据结构和内容
```

## 🐛 问题排查清单

### Cookie问题
- [ ] 已登录Luma账户
- [ ] test-cookie.html显示成功获取Cookie
- [ ] Cookie值不为空且格式正确 (usr-xxx.xxx格式)

### API问题
- [ ] 网络连接正常
- [ ] 控制台无错误信息
- [ ] API响应状态码为200
- [ ] 返回数据包含entries数组

### 权限问题
- [ ] 账户参与了至少一个事件
- [ ] 事件设置了show_guest_list: true
- [ ] 事件状态为active或即将开始

### 插件问题
- [ ] Chrome扩展管理页面插件状态为"已启用"
- [ ] 插件图标在工具栏中可见
- [ ] 开发者工具控制台无JavaScript错误

## 📊 测试数据验证

### 期望的CSV输出格式：
```csv
"api_id","event_api_id","name","username","website","timezone","bio_short","avatar_url","is_verified","last_online_at","twitter_handle","youtube_handle","linkedin_handle","instagram_handle","tiktok_handle","timestamp","source"
"usr-abc123","evt-xyz789","John Doe","johndoe","https://example.com","America/New_York","Software developer","https://cdn.lu.ma/avatar.jpg","false","2025-12-08T10:00:00Z","@johndoe","","linkedin.com/in/johndoe","","","1733123456789","api"
```

### 关键字段验证：
- api_id: 用户唯一标识 (usr-xxx格式)
- event_api_id: 事件唯一标识 (evt-xxx格式) 
- name: 用户真实姓名
- social handles: Twitter, LinkedIn等社交媒体账号
- source: "api" 表示通过API获取

## 🔍 详细调试步骤

### 1. 检查插件加载
```javascript
// 在控制台执行
chrome.runtime.sendMessage({action: 'getCookies'}, response => {
  console.log('Plugin response:', response);
});
```

### 2. 手动测试API调用
```javascript
// 在Luma网站控制台执行
fetch('https://api2.luma.com/search/get-results?query=', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### 3. 检查事件权限
```javascript
// 查找有访客列表权限的事件
const events = data.entries.filter(e => e.event?.show_guest_list);
console.log('Accessible events:', events);
```

## ⚠️ 常见错误及解决方案

### 错误1: "luma.auth-session-key cookie not found"
```bash
解决方案:
1. 访问 https://luma.com 并重新登录
2. 清除浏览器Cookie后重新登录
3. 检查是否在正确的域名下 (.luma.com)
```

### 错误2: "API error: 401 Unauthorized"  
```bash
解决方案:
1. Cookie可能已过期，重新登录
2. 检查请求头格式是否正确
3. 确认账户有访问权限
```

### 错误3: "找到 0 个事件"
```bash
解决方案:
1. 确保账户参与了一些事件
2. 检查事件是否为public或你有访问权限
3. 尝试参加一个测试事件
```

### 错误4: 插件图标不显示
```bash
解决方案:
1. 刷新扩展程序页面
2. 重新加载插件
3. 检查manifest.json语法是否正确
4. 查看Chrome扩展管理页面的错误信息
```

## 📈 性能测试

### API响应时间测试
```javascript
const start = Date.now();
// 执行API调用
const end = Date.now();
console.log(`API调用耗时: ${end - start}ms`);
```

### 数据量测试
- 小型事件 (< 50人): 应在 5秒内完成
- 中型事件 (50-200人): 应在 15秒内完成  
- 大型事件 (200+人): 应在 30秒内完成

## ✅ 测试完成检查清单

- [ ] 插件成功安装并在工具栏显示
- [ ] Cookie获取功能正常
- [ ] 事件列表能正确显示
- [ ] API抓取功能工作正常
- [ ] 数据导出功能正常
- [ ] CSV文件格式正确
- [ ] 用户界面交互流畅
- [ ] 错误处理机制有效
- [ ] 浏览器控制台无关键错误
- [ ] 性能表现符合预期

如果以上检查都通过，说明插件测试成功！🎉