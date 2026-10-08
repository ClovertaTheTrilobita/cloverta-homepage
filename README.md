# ClovertaTheTrilobita Homepage

根据效果图制作的 Astro 个人主页。

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

## 页面与交互

- 桌面保留效果图的留白、右上头像、左下导航和底部备案信息；小屏幕自动调整布局。
- Blog 链接为 `https://blog.cloverta.top`。
- Projects 链接为 `https://github.com/ClovertaTheTrilobita`。
- About Me 跳转 `/about/`；根据要求，暂不创建该页面，因此访问此地址目前会返回 404。
- 鼠标悬停或键盘聚焦菜单时，菜单放大、箭头延长，背景淡入对应的 −30° 倾斜文字，并沿右上方连续滚动。
- 背景文字在页面横向 25%–50% 的范围清晰显示，两侧在 15%–25% 和 50%–60% 的范围渐变淡出。
- 背景文字在页面纵向 25%–75% 清晰显示，顶部 0%–25% 和底部 75%–100% 渐变淡出。
- 社交图标统一使用灰色和相同的图标容器；QQ 使用提供的 SVG，收紧画布并细化轮廓，与其他图标保持相近的线条粗细。手机和平板（宽度不超过 1150px）在头像右侧竖排显示社交图标。
- 未悬停时箭头显示完整短横线，悬停时延长为虚线。
- About Me 的背景文字是 `More About Me`。
- 尊重系统的减少动态效果设置。
- 社交账号配置在 `src/data/profile.ts`。

## 字体

- 标题、别名与导航使用 **ZCOOL QingKe HuangYou**。
- 背景文字使用 **Source Han Serif / 思源宋体**。
- 两款开源字体均从原版裁出页面所需字符，作为本地 WOFF2 文件加载，许可证保存在 `public/fonts/`。
- 专业与兴趣文字优先使用 **字由点字典黑**，页脚优先使用 **字由点字乐园体**；当前没有可用的供应商 CDN 嵌入代码，使用系统字体回退。
- 已保留 CDN 样式表入口：复制 `.env.example` 为 `.env`，在 `PUBLIC_HELLOFONT_CSS_URL` 填入字体供应商提供的样式表地址。供应商样式表中的字体名称应与 `src/layouts/Layout.astro` 及 `src/components/Home.astro` 的字体栈匹配。

头像与社交图标采用提供的图片；备案链接指向对应的官方查询页。
