# 产业智能情报 · 3D 可视化 Demo

> **本项目为地图交互数据可视化 demo，仅演示了江苏扬州和湖北武汉的假数据。**

### 在线演示

- 访问地址：<https://eeeeeee-fff.github.io/interactive-map-visualization-demo-/>
- 进入主页 → 点击顶部居中的 **Industry Chain** 按钮，可切换到产业链场景；点击 **← Back to Map** 返回主地图。

---

一个基于 Vue 3 + Vite + Three.js 的产业情报可视化项目，整体是一个 SPA，包含两个核心视图：

- **主视图：3D 地图指挥屏** —— 沉浸式 3D 中国地图，集成省/市下钻、节点详情、ECharts 图表与情报面板。
- **副视图：Industry Chain 产业链场景** —— 6 个漂浮产业扇区，点击任一扇区触发产业链生长动画（主链 + 分支节点）。

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

## 二、主视图：3D 地图指挥屏

### 功能模块

- **3D 地图主场景**：中国省/市层级下钻，粒子节点表示行业资源分布（仅 **江苏扬州** 与 **湖北武汉** 有完整假数据）。
- **品牌 HUD / 顶部指标条**：实时演算徽章 + headline 关键指标。
- **Hero 面板**：当前下钻范围标题、行业类目筛选（filter pill）、统计卡片。
- **省级菜单 / 城市快捷入口**：选中省后展开城市菜单，选中城市后展示该类目下的快捷入口卡。
- **情报相关组件**：[IntelSection.vue](src/components/IntelSection.vue)、[IntelModal.vue](src/components/IntelModal.vue)、[TickerStrip.vue](src/components/TickerStrip.vue)。
- **图表与侧栏**：[ChartsSection.vue](src/components/ChartsSection.vue)、[SideRail.vue](src/components/SideRail.vue)、[TechSidebar.vue](src/components/TechSidebar.vue)。
- **节点详情页**：[NodeDetailPage.vue](src/components/NodeDetailPage.vue)，点击节点切换到 detail 模式。
- **人才动态视图**：[TalentDynamicsView.vue](src/components/TalentDynamicsView.vue) 等系列面板。

---

## 三、副视图：Industry Chain 产业链场景

入口：主页顶部居中的 **Industry Chain** 胶囊按钮 → 切换到 [src/components/BlueprintScene.vue](src/components/BlueprintScene.vue)。

### 场景说明

- **概览态**：6 个漂浮产业扇区在镜头前缓慢轨道漂移：

- **聚焦态**：点击任一扇区触发：
  1. 镜头推进到该扇区位置
  2. 核心 ShockWave 脉冲冲击
  3. **主链节点（Main）依次生长**到右侧
  4. **分支节点（Branch）** 围绕主链展开

- **退出**：
  - `Esc` 或 **Back To Overview** 按钮 → 在 chain 场景内回到概览态
  - **← Back to Map** 按钮 → 返回主地图视图

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

启动后访问：

```text
http://localhost:5173/
```
---

## 五、目录结构

```text
.
├── index.html                                # SPA 入口
├── vite.config.js
├── package.json
├── src/
│   ├── main.js
│   ├── App.vue                               # 视图切换 + Industry Chain 按钮
│   ├── components/
│   │   ├── ThreeDashboard.vue                # 主视图：3D 地图指挥屏
│   │   ├── BlueprintScene.vue                # 副视图：产业链场景
│   │   └── ...                               # 各业务面板（Intel / Charts / TopBar 等）
│   ├── charts/                               # ECharts 配置
│   ├── composables/                          # Vue 组合式函数
│   ├── data/                                 # 静态数据集（地图、扇区、人才动态等）
│   ├── styles/
│   └── utils/
└── docs/                                     # 构建产物（GitHub Pages 部署目录）
```
---

## 七、参考与致谢

本项目部分逻辑参考以下开源项目：

- <https://github.com/vasturiano/three-globe>
- <https://github.com/vasturiano/3d-force-graph>
- <https://github.com/uiwjs/province-city-china>

This project follows the license of the original work where applicable.
