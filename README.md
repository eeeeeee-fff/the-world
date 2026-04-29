# 产业智能情报 · 3D 可视化 Demo

> **本项目为地图交互数据可视化 demo，仅演示了江苏扬州和湖北武汉的假数据。**

### 在线演示

- **主 Demo（3D 指挥屏）**：<https://eeeeeee-fff.github.io/interactive-map-visualization-demo-/>
- **Blueprint 链路演示**：<https://eeeeeee-fff.github.io/interactive-map-visualization-demo-/demo-blueprint.html>

---

一个基于 Vue 3 + Vite + Three.js 的产业情报可视化项目，包含两个相对独立的可视化页面：

- **主 Demo（`index.html`）** —— 沉浸式 3D 指挥屏，集成中国地图分布、节点详情、ECharts 图表与情报面板。
- **`demo-blueprint.html`** —— 独立的 Three.js 单文件演示场景：Focus Driven Chain Space，聚焦"产业链"动效。

---

## 一、技术栈

| 类别 | 依赖 |
| --- | --- |
| 框架 | Vue 3.5 |
| 构建 | Vite 6 |
| 3D | three 0.183、postprocessing 6（Bloom / OutlineEffect / ShockWave） |
| 动画 | gsap 3 |
| 图表 | echarts 5 |

---

## 二、主 Demo：产业智能情报 3D 指挥屏

入口：[index.html](index.html) → [src/main.js](src/main.js) → [src/App.vue](src/App.vue) → [src/components/ThreeDashboard.vue](src/components/ThreeDashboard.vue)

### 功能模块

- **3D 地图主场景**：中国省/市层级下钻，粒子节点表示行业资源分布。
- **品牌 HUD / 顶部指标条**：实时演算徽章 + headline 关键指标。
- **Hero 面板**：当前下钻范围标题、行业类目筛选（filter pill）、统计卡片。
- **省级菜单 / 城市快捷入口**：选中省后展开城市菜单，选中城市后展示该类目下的快捷入口卡。
- **情报相关组件**：[IntelSection.vue](src/components/IntelSection.vue)、[IntelModal.vue](src/components/IntelModal.vue)、[TickerStrip.vue](src/components/TickerStrip.vue)。
- **图表与侧栏**：[ChartsSection.vue](src/components/ChartsSection.vue)、[SideRail.vue](src/components/SideRail.vue)、[TechSidebar.vue](src/components/TechSidebar.vue)。
- **节点详情页**：[NodeDetailPage.vue](src/components/NodeDetailPage.vue)，点击节点切换到 detail 模式。
- **人才动态视图**：[TalentDynamicsView.vue](src/components/TalentDynamicsView.vue) 等系列面板。

---

## 三、demo-blueprint.html：Focus Driven Chain Space

入口：[demo-blueprint.html](demo-blueprint.html)（**单文件、零打包依赖**，直接通过 `<script type="module">` 引用 `node_modules` 内的 three / gsap / postprocessing）。

### 场景说明

- 概览态：6 个漂浮的产业扇区（**IC、Bio、Robotics、Aerospace、Low Alt、Storage**）在镜头前缓慢漂移。
- 点击任一扇区：
  1. 镜头推进到该扇区位置；
  2. 核心 ShockWave 脉冲冲击；
  3. **主链节点（Main）依次生长**到右侧；
  4. **分支节点（Branch）** 围绕主链展开。
- 右上角 HUD 显示当前 Scene State 文案；右下角 Legend 标注 Main / Branch / Pulse 三种节点。
- `Esc` 或点击 **Back To Overview** 按钮回到概览。


---

## 四、使用方式（终端指令）

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

启动后默认监听 `http://localhost:5173`，两个页面分别访问：

```text
主 Demo（3D 指挥屏）: http://localhost:5173/
Blueprint 链路演示  : http://localhost:5173/demo-blueprint.html
```
---

## 五、目录结构

```text
.
├── index.html               # 主 Demo 入口（Vue 应用）
├── demo-blueprint.html      # 独立 Three.js 单文件演示
├── vite.config.js
├── package.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── components/          # ThreeDashboard 及各业务面板
│   ├── charts/              # ECharts 配置
│   ├── composables/         # Vue 组合式函数
│   ├── data/                # 静态数据集（地图、扇区、人才动态等）
│   ├── styles/
│   └── utils/
└── docs/                    # 构建产物（GitHub Pages 部署目录）
```

---

## 六、常见问题

- **`demo-blueprint.html` 打开是空白？** 必须通过 `npm run dev` / `npm run preview` 等 HTTP 服务访问，不能用 `file://` 协议双击打开（ES Module + 相对路径 import 不支持 file 协议）。
- **构建后路径 404？** [vite.config.js](vite.config.js) 中 `base` 设为 `/interactive-map-visualization-demo-/`，部署到子路径仓库时正确；如果想本地预览构建产物，请用 `npm run preview`。

---

## 七、参考与致谢

本项目部分逻辑参考以下开源项目：

- <https://github.com/vasturiano/three-globe>
- <https://github.com/vasturiano/3d-force-graph>
- <https://github.com/uiwjs/province-city-china>

This project follows the license of the original work where applicable.
