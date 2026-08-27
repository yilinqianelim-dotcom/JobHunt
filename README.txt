求职记录台 · 可安装 App 包（PWA）
====================================

纯前端、零依赖。所有数据保存在浏览器本地（localStorage），不上传任何服务器。

【文件说明】
  index.html            应用本体（含 PWA 注入，部署用这个）
  manifest.json         PWA 安装信息（名称、图标、主题色）
  sw.js                 Service Worker：离线缓存（断网也能打开）
  icon.svg              矢量图标
  icon-192.png          安卓/Chrome 安装图标（必需）
  icon-512.png          高清安装图标 + 启动画面
  apple-touch-icon.png  iPhone/iPad 添加到主屏幕的图标
  README.txt            本说明

【本地运行（VS Code）】
  方式一（推荐）：装扩展 Live Server → 右键 index.html → Open with Live Server
  方式二：VS Code 终端里执行  python3 -m http.server 8080
          然后浏览器打开  http://localhost:8080
  注意：必须通过 http(s) 打开。双击 index.html（file:// 方式）只能当普通网页看，
  Service Worker / 离线缓存 / 安装到主屏幕 都不会生效。

【手机上试用（同一 WiFi）】
  1. 电脑上按上面方式起服务
  2. 手机浏览器访问  http://<电脑局域网IP>:8080
  3. 浏览器菜单 → 「添加到主屏幕」/「安装」→ 变成独立 App

【发布成别人也能用的网站/App】
  A. Netlify Drop（最简单，免登录）：把本文件夹整个拖到 https://app.netlify.com/drop
  B. GitHub Pages：新建仓库 → 上传全部文件 → Settings → Pages → 选 main 分支
  C. Vercel / Cloudflare Pages：导入仓库或拖拽上传
  拿到 https:// 网址后，任何人打开 → 浏览器「安装」/「添加到主屏幕」即可当 App 用。

【更新版本时务必做】
  改了 index.html 重新发布后，把 sw.js 第一行的缓存版本号 +1
  （'jobhunt-v2' → 'jobhunt-v3'），否则老用户可能长时间看到旧版页面。

【重要】
  - 每个人的数据只存在自己设备的浏览器里，互不可见（天然多用户，无需账号）。
  - 换设备或清浏览器缓存会丢数据：请用应用内「导出备份」保存 JSON，
    在新设备「导入恢复」。
  - 外观（主色/深色/字体）：应用内右上角「外观」。
