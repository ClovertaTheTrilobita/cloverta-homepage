# Cloverta's Homepage

> [!CAUTION]
> In development

<img width="1582" height="1035" alt="image" src="https://github.com/user-attachments/assets/f7f1178a-22ce-46bf-81d9-85b82804fdf5" />

## 本地开发

```sh
npm install
npm run dev -- --background
```

默认预览地址为 `http://localhost:4321`。后台服务管理：

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

构建静态网站：

```sh
npm run build
```

输出目录为 `dist/`。

## About 页面

`/about/` 可直接访问，正文与样式位于 `src/components/About.astro`，使用本地 Josefin Slab Light 字体；许可证保存在 `public/fonts/JosefinSlab-OFL.txt`。

主页与 About 共用 `Portfolio.astro`。`src/scripts/portfolio.ts` 将标题、箭头、主页部件和正文放在同一条动画时间线上，返回时倒放；浏览器前进、后退也会同步页面状态。正文按实际屏幕换行拆分为逐行动画，拆分逻辑位于 `src/scripts/about-lines.ts`。系统开启减少动态效果时直接切换页面，并停止返回箭头跳跃。

