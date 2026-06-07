# CaliGuide 部署指南

## 🚀 部署到 Render（免费）

### 前置条件

1. GitHub 账号
2. Render 账号（https://render.com）
3. Google Gemini API Key（https://makersuite.google.com/app/apikey）

### 步骤 1：推送到 GitHub

```bash
# 1. 初始化 Git 仓库（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit"

# 4. 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/caliGuide.git

# 5. 推送
git push -u origin main
```

### 步骤 2：在 Render 创建服务

1. 访问 https://render.com 并登录
2. 点击右上角 **"New +"** 按钮
3. 选择 **"Blueprint"**
4. 连接你的 GitHub 仓库
5. Render 会自动检测 `render.yaml` 文件
6. 点击 **"Apply"** 开始部署

### 步骤 3：配置环境变量

在 Render 控制台中：

1. 进入你的服务
2. 点击 **"Environment"** 标签
3. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | 你的 API Key | Google Gemini API |
| `JWT_SECRET` | 随机字符串 | 用于 JWT 签名 |
| `NODE_ENV` | production | 环境 |

### 步骤 4：等待部署

- 部署通常需要 2-5 分钟
- 可以在 **"Logs"** 标签查看部署进度
- 部署完成后会显示服务 URL

### 步骤 5：测试应用

1. 访问你的服务 URL
2. 使用测试账号登录：
   - 邮箱：`alice@caliguide.com`
   - 密码：`hello123`

---

## 🔧 本地开发

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 GEMINI_API_KEY
```

### 初始化数据库

```bash
npm run seed
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 📦 构建和生产

### 构建项目

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

---

## 🐳 Docker 部署

### 构建 Docker 镜像

```bash
docker build -t caliguide .
```

### 运行容器

```bash
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e JWT_SECRET=your_secret \
  caliguide
```

### 使用 Docker Compose

```bash
docker-compose up
```

---

## 🔐 安全建议

1. **JWT_SECRET**: 使用强随机字符串
   ```bash
   openssl rand -hex 32
   ```

2. **GEMINI_API_KEY**: 从 Google AI Studio 获取
   - 访问 https://makersuite.google.com/app/apikey
   - 创建新的 API Key

3. **生产环境**:
   - 设置 `NODE_ENV=production`
   - 使用 HTTPS
   - 定期备份数据库

---

## 📊 监控

### 健康检查

```bash
curl https://your-app.onrender.com/api/health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

### 查看日志

在 Render 控制台的 **"Logs"** 标签查看实时日志。

---

## 🆘 常见问题

### Q: 部署失败怎么办？

A: 检查以下几点：
1. 环境变量是否正确配置
2. `package.json` 中的脚本是否正确
3. 查看 Render 日志获取错误信息

### Q: 数据库在哪里？

A: SQLite 数据库文件存储在服务器的文件系统中。Render 的免费 plan 会在重启时重置数据。

### Q: 如何自定义域名？

A: 在 Render 控制台的 **"Settings"** → **"Custom Domains"** 中添加。

### Q: 如何更新部署？

A: 推送代码到 GitHub，Render 会自动重新部署：
```bash
git add .
git commit -m "Update"
git push
```

---

## 📞 支持

- 📧 Email: support@caliguide.com
- 💬 In-app: 使用 CaliBot 聊天
- ❓ Help: 访问应用内的帮助中心
