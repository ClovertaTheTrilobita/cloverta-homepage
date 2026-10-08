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

主页与 About 共用 `Portfolio.astro` 和 `Backgrounds.astro`。About 正文进入时整体从下方滑入，返回时整体向下滑出；两个方向共用同一条 800ms 动画，与标题移动时长一致，以相反方向播放，快速往返时也会从当前位置反向移动。`src/scripts/portfolio.ts` 控制标题、箭头、主页部件与背景的位置动画；背景文字连同渐变区域从桌面主页的 25%–50% 滑至 75%–100%，返回时沿原路径倒放。手机主页已经使用 75%–100% 的背景范围，切换时保持该范围。浏览器前进、后退也会同步页面状态。系统开启减少动态效果时直接切换页面，并停止返回箭头跳跃。
