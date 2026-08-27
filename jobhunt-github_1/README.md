# JobHunting · 求职记录台

个人求职投递 / 面试 / Offer 记录看板。纯前端 PWA，数据存用户浏览器本地（localStorage），
另含一个 Netlify 云函数用于 AI 识别职位描述。

在线地址：https://jobhunt.yifaith.com

## 文件结构

| 文件 | 作用 | 能否手改 |
|---|---|---|
| `jobhunt.html` | **源文件**，所有功能改这里 | ✅ 改这个 |
| `build_pwa.py` | 构建脚本：由 jobhunt.html 生成 index.html | 一般不动 |
| `index.html` | 网站本体（构建产物） | ❌ 别手改，跑 build 生成 |
| `manifest.json` | PWA 安装信息（App 名称/图标/主题色） | 需要时改 |
| `sw.js` | Service Worker 离线缓存 | 每次发版把第一行版本号 +1 |
| `icon.svg` / `icon-*.png` / `apple-touch-icon.png` | 各平台图标 | 换图标时替换 |
| `netlify.toml` | Netlify 配置（发布目录 + 函数目录） | 不动 |
| `netlify/functions/parse-jd.js` | AI 识别云函数（调大模型抽取 JD 字段） | 需要时改 |

## 更新流程（每次发版）

1. 修改 `jobhunt.html`
2. 运行 `python3 build_pwa.py`，把生成的 `jobhunt-app/index.html` 覆盖到仓库根目录
3. `sw.js` 第一行缓存版本号 +1（如 `jobhunt-v8` → `jobhunt-v9`）
4. 提交并推送 → Netlify 自动部署（约 1 分钟）
5. 无痕窗口打开线上地址确认生效（自己设备缓存需刷新两次）

## AI 识别配置（已配好则无需重复）

密钥只存 Netlify 环境变量，**绝不写进本仓库任何文件**。
Site configuration → Environment variables：

- `LLM_API_KEY`：大模型平台密钥
- `LLM_API_URL`：`https://open.bigmodel.cn/api/paas/v4/chat/completions`（智谱）
- `LLM_MODEL`：`glm-4-flash`

改环境变量后需重新部署一次才生效。

## 数据说明

- 每位访问者的数据只存在自己浏览器本地，互不可见，服务器不保存任何记录
- 换设备迁移：应用内「⬇ 备份」导出 JSON →「⬆ 恢复」导入
- 发新版不影响任何用户的已有数据
