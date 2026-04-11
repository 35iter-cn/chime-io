# Chime-io Hero Image AI Generation Prompts

> 为 chime-io 项目设计的 AI 生成图像提示词集合
> 适用工具：Midjourney / DALL-E / Stable Diffusion

---

## 项目核心信息

**产品名称**：chime-io  
**核心价值**：为 Claude Code / OpenCode 用户提供 Telegram 通知，当 AI 编程助手完成长时间任务时发送手机通知  
**目标用户**：开发者、AI 编程助手用户  
**品牌关键词**：notification, automation, developer tools, productivity, AI assistant

---

## 1. 主视觉概念（3个版本）

### 版本A：极简科技风 (Minimal Tech)

#### 概念描述
干净的界面元素、通知图标、柔和渐变背景，体现科技产品的简洁与专业。适合技术型用户，传达工具的可靠性和现代感。

#### Midjourney 提示词
```
Minimalist tech hero image, floating notification bell icon with soft blue glow, clean geometric shapes, gradient background from deep navy #0a1628 to teal #1a4d5c, subtle grid pattern, modern UI elements, glassmorphism cards, soft shadows, professional developer tool aesthetic, 8k, ultra detailed --ar 16:9 --style raw --q 2 --v 6
```

#### DALL-E 提示词
```
A minimalist technology hero image featuring a floating notification bell icon with a soft cyan-blue glow. Clean geometric shapes and modern UI card elements with glassmorphism effect. Background is a smooth gradient from dark navy blue (#0a1628) to teal (#1a4d5c) with a very subtle grid pattern. Professional, sleek, and modern developer tool aesthetic. Soft shadows, high quality, 16:9 aspect ratio.
```

#### Stable Diffusion 提示词
```
masterpiece, best quality, minimalist tech illustration, notification bell icon, glowing cyan accent, clean geometric composition, gradient background dark navy to teal, subtle grid overlay, glassmorphism ui elements, soft volumetric lighting, professional developer tool branding, 8k uhd, sharp focus
Negative prompt: cluttered, busy, text, watermark, blurry, low quality, distorted, amateur, cartoonish, oversaturated
Steps: 30, CFG: 7, Sampler: DPM++ 2M Karras, Size: 1216x704
```

#### 使用场景
- 官方网站首页 Hero 区域
- 产品落地页顶部横幅
- GitHub README 顶部配图
- 技术博客文章封面

---

### 版本B：场景化实用风 (Contextual Lifestyle)

#### 概念描述
展示真实使用场景：开发者离开电脑去喝咖啡/散步，手机收到 chime-io 通知，体现产品解决的真实痛点。温暖、生活化的色调。

#### Midjourney 提示词
```
Developer lifestyle scene, person walking away from laptop in modern home office, smartphone in hand showing notification popup, warm ambient lighting, cozy workspace with plants, shallow depth of field, coffee cup on desk, coding screen visible in background, golden hour lighting, candid photography style, lifestyle tech photography, 8k --ar 16:9 --style raw --q 2 --v 6
```

#### DALL-E 提示词
```
A lifestyle photography-style image showing a developer in a modern home office environment walking away from their desk while looking at a smartphone notification. The desk has a laptop with code on screen, a coffee cup, and indoor plants. Warm, cozy ambient lighting with golden hour tones. Shallow depth of field focusing on the person and phone. The notification popup on phone shows a simple bell icon. Professional lifestyle tech photography aesthetic, modern and inviting atmosphere.
```

#### Stable Diffusion 提示词
```
masterpiece, best quality, lifestyle photography, developer person leaving desk, modern home office, smartphone notification popup, warm ambient lighting, cozy interior, indoor plants, laptop with code screen, coffee cup, golden hour lighting, shallow depth of field, candid moment, professional photography, bokeh background, natural colors, inviting atmosphere
Negative prompt: cartoon, anime, illustration, drawing, painting, artificial, studio lighting, flash, harsh shadows, cluttered, messy, low quality
Steps: 30, CFG: 7, Sampler: DPM++ 2M Karras, Size: 1216x704
```

#### 使用场景
- 产品官网 "How it works" 页面
- 营销落地页展示产品价值
- 社交媒体推广图
- 产品介绍视频缩略图

---

### 版本C：品牌标识风 (Brand Identity)

#### 概念描述
专注 chime-io 品牌视觉，突出 Logo 展示，适合作为 GitHub Social Preview 和品牌识别材料。强烈的视觉冲击力，简洁有力的构图。

#### Midjourney 提示词
```
Bold brand identity hero, large stylized "CHIME" typography with notification bell integrated into letter "I", electric blue and dark navy color scheme, abstract sound wave patterns, dynamic diagonal composition, premium tech branding, glowing neon accents, dark mode aesthetic, vector-style clean lines, professional SaaS company banner, 8k --ar 16:9 --style raw --q 2 --v 6
```

#### DALL-E 提示词
```
A bold brand identity hero image featuring large modern typography spelling "CHIME" with a notification bell icon creatively integrated into the design. Color scheme is electric blue and dark navy with glowing neon accents. Abstract sound wave patterns in the background suggesting notification sounds. Dynamic diagonal composition with premium tech branding aesthetic. Dark mode design with clean vector-style lines. Professional SaaS company visual identity, high impact and memorable.
```

#### Stable Diffusion 提示词
```
masterpiece, best quality, brand identity design, large typography "CHIME", notification bell icon integration, electric blue and dark navy colors, abstract sound waves, neon glow effects, diagonal dynamic composition, premium tech branding, dark mode aesthetic, clean vector lines, professional SaaS banner, glowing accents, modern corporate identity
Negative prompt: photorealistic, photography, cluttered, busy, multiple colors, pastel, watercolor, sketch, hand drawn, vintage, retro
Steps: 30, CFG: 7, Sampler: DPM++ 2M Karras, Size: 1216x704
```

#### 使用场景
- GitHub Social Preview (1280x640)
- Twitter/X 品牌头图
- LinkedIn 公司页面封面
- 产品发布会 PPT 封面

---

## 2. 具体提示词示例（每个版本 2-3 个变体）

### 版本A 变体

#### A1: 深蓝科技渐变
```
Minimalist hero image, isometric notification bell floating in space, deep ocean blue gradient background (#001a33 to #003d66), subtle geometric wireframe patterns, soft ambient occlusion, glass morphism UI cards with teal accents, professional developer SaaS aesthetic, clean composition, negative space, 8k render --ar 16:9 --v 6 --style raw --q 2
```
**负面提示词**: `text, watermark, cluttered, busy, cartoon, illustration, oversaturated, blurry, low poly`
**参数**: Aspect 16:9, Quality 2, Style raw

#### A2: 紫蓝极光
```
Tech hero banner, notification icon with particle effects, aurora borealis gradient (deep purple #1a0a2e to electric blue #00d4ff), holographic UI elements, futuristic interface, subtle noise texture, dark theme, premium software branding, cinematic lighting, 8k --ar 16:9 --v 6 --q 2
```
**负面提示词**: `daylight, bright, cartoon, anime, sketch, watercolor, text, logo, watermark`
**参数**: Aspect 16:9, Quality 2, Chaos 20

#### A3: 单色极简
```
Monochrome minimalist design, white notification bell on dark charcoal background (#1a1a1a), single accent line in cyan (#00bcd4), Swiss design principles, grid system, generous whitespace, typographic hierarchy, professional editorial style, print quality, 8k --ar 16:9 --v 6 --style raw
```
**负面提示词**: `colorful, gradient, texture, pattern, busy, cluttered, illustration, 3d render, shadows`
**参数**: Aspect 16:9, Style raw, Stylize 100

---

### 版本B 变体

#### B1: 咖啡厅场景
```
Developer in trendy coffee shop, checking smartphone notification, laptop open on wooden table with code visible, latte art coffee cup, warm interior lighting, exposed brick wall background, candid street photography style, shallow depth of field, urban professional lifestyle, morning atmosphere --ar 16:9 --v 6 --style raw --q 2
```
**负面提示词**: `studio, artificial lighting, posed, stock photo look, oversaturated, cartoon, illustration`
**参数**: Aspect 16:9, Quality 2, Style raw

#### B2: 户外散步
```
Person walking in modern city park, checking phone notification, autumn golden hour, blurred background with trees and city skyline, casual tech professional attire, wireless earbuds, dynamic walking pose, lifestyle photography, natural candid moment, warm tones, peaceful productivity --ar 16:9 --v 6 --q 2
```
**负面提示词**: `winter, cold colors, studio, artificial, posed, looking at camera, selfie angle`
**参数**: Aspect 16:9, Quality 2, Stylize 250

#### B3: 居家办公
```
Cozy home office scene, developer standing up from desk stretching, smartphone showing notification in hand, dual monitor setup with dark IDE theme, indoor plants, warm desk lamp, evening blue hour window light, comfortable casual clothes, work-life balance atmosphere --ar 16:9 --v 6 --style raw --q 2
```
**负面提示词**: `messy, cluttered, dark, gloomy, corporate office, formal wear, stressed, tired`
**参数**: Aspect 16:9, Quality 2, Chaos 15

---

### 版本C 变体

#### C1: 声波动态
```
Bold brand hero, "CHIME" text with sound wave visualization, notification bell as dot of "i", electric blue (#0099ff) and midnight black, dynamic radial composition, audio frequency bars, modern tech logo design, vector illustration style, high contrast, memorable brand mark --ar 16:9 --v 6 --q 2
```
**负面提示词**: `photorealistic, photo, texture, gradient mesh, watercolor, sketch, 3d render, shadows`
**参数**: Aspect 16:9, Quality 2, Style raw

#### C2: 霓虹科技
```
Cyberpunk brand identity, neon "CHIME" signage, notification bell hologram, dark city background with bokeh lights, cyan and magenta accent colors, futuristic tech aesthetic, glowing edges, synthwave vibes, premium startup branding, high energy composition --ar 16:9 --v 6 --q 2
```
**负面提示词**: `daylight, natural, organic, soft, pastel, vintage, retro, minimalist, white background`
**参数**: Aspect 16:9, Quality 2, Chaos 30

#### C3: 几何抽象
```
Abstract geometric brand mark, interlocking shapes forming notification bell, "CHIME" in modern sans-serif font, gradient from coral (#ff6b6b) to teal (#4ecdc4), clean vector design, Bauhaus influence, memorable iconography, versatile logo system, brand guidelines ready --ar 16:9 --v 6 --style raw
```
**负面提示词**: `photorealistic, 3d, texture, noise, gradient background, complex, detailed, busy`
**参数**: Aspect 16:9, Style raw, Stylize 150

---

## 3. 封面图/缩略图提示词

### GitHub Social Preview (1280x640)

#### 推荐提示词
```
GitHub social preview banner, chime-io branding, notification bell icon center, "Never Miss a Build" tagline space, dark gradient background #0d1117 to #161b22, GitHub-style dark mode aesthetic, clean typography area, professional open source project banner, 1280x640 composition --ar 2:1 --v 6 --q 2
```

**负面提示词**: `light mode, bright colors, busy background, multiple focal points, small text`

**参数设置**:
- Aspect Ratio: 2:1 (或 1280x640)
- Quality: 2
- Style: raw
- 确保中心区域留白给文字叠加

#### 变体 - 科技蓝
```
GitHub repo banner, centered notification bell with code brackets, gradient dark blue #0a2540 to black, minimalist geometric accent, developer tool aesthetic, space for repo name and description, modern SaaS open source branding --ar 2:1 --v 6 --style raw
```

---

### Dev.to 封面图 (1000x420)

#### 推荐提示词
```
Dev.to article cover, developer productivity theme, notification automation concept, split screen showing code and phone notification, warm developer environment, readable title space at top, friendly approachable style, community-focused aesthetic, 1000x420 composition --ar 21:9 --v 6 --q 2
```

**负面提示词**: `corporate, cold, formal, cluttered, small details, dark and gloomy`

**参数设置**:
- Aspect Ratio: 21:9 (或 1000x420)
- Quality: 2
- 顶部 20% 区域保持简洁便于叠加标题

#### 变体 - 教程风格
```
Dev.to tutorial cover, step-by-step automation guide aesthetic, hand-drawn style tech illustration, friendly colors, notification workflow diagram elements, approachable learning vibe, clean title space --ar 21:9 --v 6 --stylize 200
```

---

### Twitter/X 头图 (1500x500)

#### 推荐提示词
```
Twitter header banner, chime-io brand colors, flowing notification waves, dark mode optimized, left side clean for profile picture overlay, subtle pattern, modern tech startup aesthetic, wide panoramic composition, professional social media branding --ar 3:1 --v 6 --q 2
```

**负面提示词**: `center focal point, busy center, bright white, complex details in left third`

**参数设置**:
- Aspect Ratio: 3:1 (或 1500x500)
- Quality: 2
- 左侧 400px 区域保持简洁（头像遮挡区域）

#### 变体 - 动态线条
```
Twitter profile header, abstract flowing lines representing notifications, gradient purple to blue, dark background, profile-safe zone on left, modern minimalist tech aesthetic, wide format --ar 3:1 --v 6 --style raw
```

---

## 4. 动画/视频场景描述

### 场景分镜脚本（5 个镜头，总时长 15-20 秒）

#### 镜头 1: 问题呈现 (3秒)
**视觉描述**:
- 开发者专注盯着屏幕，代码在滚动
- 进度条缓慢前进（表示长时间任务）
- 环境：现代办公室/家庭工作区
- 色调：略带紧张感的冷色调

**文字叠加建议**:
```
Waiting for your AI to finish?
（等待 AI 完成？）
位置：屏幕中央，字体：现代无衬线，动画：淡入淡出
```

---

#### 镜头 2: 转场动作 (2秒)
**视觉描述**:
- 开发者起身，看了看手表/窗外
- 拿起外套/咖啡杯
- 走出画面
- 电脑屏幕仍在显示运行中

**文字叠加建议**:
```
Don't wait around.
（不必一直等待。）
位置：底部居中，字体：加粗无衬线，动画：滑入
```

---

#### 镜头 3: 解决方案展示 (5秒)
**视觉描述**:
- 分屏效果：左侧电脑完成动画（勾选标记）
- 右侧手机接收通知动画
- 通知弹出动画：从顶部滑入，轻微弹跳
- 显示 chime-io logo/品牌色
- 色调：转为温暖积极的色调

**文字叠加建议**:
```
Chime-io notifies you instantly
（Chime-io 即时通知你）
位置：屏幕上方，字体：大号无衬线，动画：逐字显示
```

---

#### 镜头 4: 产品功能展示 (5秒)
**视觉描述**:
- 手机屏幕特写，展示 Telegram 通知界面
- 显示简洁的通知内容："Task Complete ✓"
- 背景模糊的城市/咖啡厅场景
- 开发者微笑着看手机

**文字叠加建议**:
```
Via Telegram
（通过 Telegram）
位置：手机屏幕旁边，字体：简洁无衬线，动画：淡入
```

---

#### 镜头 5: 行动号召 (3-5秒)
**视觉描述**:
- 回归简洁的品牌画面
- chime-io logo 居中显示
- GitHub 仓库链接或官网 URL
- 简单的安装命令动画：npm install -g chime-io

**文字叠加建议**:
```
Get chime-io
github.com/yourusername/chime-io
位置：中央 logo 下方，字体：等宽字体，动画：打字机效果
```

---

### 动画风格建议

| 元素 | 建议 |
|------|------|
| **动画曲线** | 使用 ease-out 或 spring 弹性效果，避免线性动画 |
| **过渡方式** | 平滑滑动或缩放过渡，避免硬切 |
| **时长控制** | 每个动作 0.3-0.5 秒，保持流畅但不拖沓 |
| **配色过渡** | 从冷色调（问题）到暖色调（解决方案） |
| **音效** | 轻微的通知提示音（叮/铃铛声）作为点缀 |

---

## 5. 设计规范建议

### 推荐配色方案

#### 主色方案 - 深海科技
```css
:root {
  --primary: #0099ff;        /* 电光蓝 - 主要强调色 */
  --primary-dark: #0066cc;   /* 深蓝 - 按钮/链接 */
  --secondary: #00d4aa;      /* 青绿 - 成功/完成状态 */
  --accent: #ff6b6b;         /* 珊瑚红 - 警告/重要通知 */
  --background: #0a1628;     /* 深海蓝 - 深色背景 */
  --surface: #1a2a3a;        /* 表面色 - 卡片/面板 */
  --text-primary: #ffffff;   /* 主要文字 */
  --text-secondary: #8b9dc3; /* 次要文字 */
}
```

#### 备选方案 - 极光紫
```css
:root {
  --primary: #8b5cf6;        /* 紫罗兰 */
  --primary-dark: #6d28d9;
  --secondary: #06b6d4;      /* 青色 */
  --accent: #f59e0b;         /* 琥珀 */
  --background: #0f0a1e;
  --surface: #1a1525;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
}
```

#### 浅色模式方案
```css
:root {
  --primary: #0066cc;
  --primary-light: #4d94ff;
  --secondary: #00a884;
  --background: #fafbfc;
  --surface: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #6b7280;
}
```

---

### 字体风格建议

#### 标题字体
- **英文**: Inter, SF Pro Display, or Space Grotesk
- **特点**: 几何感、现代、高可读性
- **字重**: Bold (700) for headlines

#### 正文字体
- **英文**: Inter, Source Sans Pro, or Roboto
- **特点**: 中性、清晰、长时间阅读舒适
- **字重**: Regular (400) for body, Medium (500) for emphasis

#### 代码字体
- **推荐**: JetBrains Mono, Fira Code, or SF Mono
- **特点**: 等宽、清晰的字符区分、连字支持

#### 字体层级建议
| 元素 | 大小 | 字重 | 行高 |
|------|------|------|------|
| Hero 标题 | 48-64px | Bold | 1.1 |
| 副标题 | 24-32px | Medium | 1.3 |
| 正文 | 16-18px | Regular | 1.6 |
| 代码 | 14px | Regular | 1.5 |
| 小字 | 12-14px | Regular | 1.4 |

---

### 图标风格建议

#### 线性图标 (推荐用于 UI)
- **风格**: 2px 描边，圆角端点
- **尺寸**: 24x24px (标准), 20x20px (紧凑)
- **特点**: 简洁、易识别、适合深色模式

#### 填充图标 (推荐用于品牌)
- **风格**: 纯色填充，轻微圆角
- **尺寸**: 48x48px 及以上
- **特点**: 高可见度、品牌识别性强

#### 品牌图标规范
```
主图标: 通知铃铛 (Notification Bell)
- 简洁轮廓风格
- 可选：声音波纹效果暗示
- 最小尺寸: 32x32px
- 推荐格式: SVG

辅助图标:
- 代码符号: </> 或 {}
- 连接/自动化: 箭头或流程线
- 完成状态: 勾选标记
```

#### 图标配色规则
- 主图标：使用 `--primary` 色
- 激活状态：使用 `--secondary` 色
- 警告/错误：使用 `--accent` 色
- 禁用状态：降低透明度至 40%

---

## 快速参考卡片

### Midjourney 参数速查
| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `--ar` | 宽高比 | 16:9 (banner), 2:1 (GitHub), 3:1 (Twitter) |
| `--q` | 质量 | 2 (最高) |
| `--v` | 版本 | 6 (最新) |
| `--style` | 风格 | raw (更忠实提示词) |
| `--stylize` | 风格化程度 | 100-250 |
| `--chaos` | 随机性 | 0-30 |

### 通用负面提示词
```
text, watermark, signature, blurry, low quality, distorted, amateur, oversaturated, cluttered, busy, multiple focal points, cropped, out of frame
```

### 文件命名建议
```
hero-v1-minimal-tech.jpg
hero-v2-lifestyle-coffee.jpg
hero-v3-brand-neon.jpg
github-social-preview.jpg
dev-to-cover-automation.jpg
twitter-header-brand.jpg
```

---

*文档版本: 1.0*  
*最后更新: 2025-04-11*  
*适用项目: chime-io*
