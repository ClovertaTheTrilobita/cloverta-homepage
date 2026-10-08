import { createLineSplitter } from './about-lines';

type View = 'home' | 'about';
const root = document.querySelector<HTMLElement>('.portfolio');

if (root) {
	const home = root.querySelector<HTMLElement>('.home-view')!;
	const about = root.querySelector<HTMLElement>('.about-view')!;
	const homeLink = home.querySelector<HTMLAnchorElement>('[data-menu="about"]')!;
	const homeTitle = homeLink.querySelector<HTMLElement>(':scope > span:first-child')!;
	const homeChevron = homeLink.querySelector<HTMLElement>('.arrow-head')!;
	const title = about.querySelector<HTMLElement>('.about-title')!;
	const back = about.querySelector<HTMLAnchorElement>('.about-return')!;
	const chevron = back.querySelector<HTMLElement>('.return-chevron')!;
	const copy = about.querySelector<HTMLElement>('.about-copy')!;
	const splitLines = createLineSplitter(copy);
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	const homePageTitle = '三叶草 -More About Me-';
	let view = root.dataset.view as View;
	let destination = view;
	let sequence = 0;
	let homeScroll = 0;
	let animations: Animation[] = [];
	let introAnimations: Animation[] = [];
	let clones: HTMLElement[] = [];
	let duration = 0;
	let width = innerWidth;
	let resizeTimer: ReturnType<typeof setTimeout>;
	let backRequested = false;
	history.scrollRestoration = 'manual';
	const fontsReady = Promise.all([
		document.fonts.load('400 48px "ZCOOL QingKe HuangYou"'),
		document.fonts.load('300 32px "Josefin Slab"'),
	]).catch(() => []);

	const clearTimeline = () => {
		animations.forEach((animation) => animation.cancel());
		animations = [];
		clones.forEach((clone) => clone.remove());
		clones = [];
		homeLink.style.visibility = '';
		title.style.visibility = '';
		chevron.style.visibility = '';
	};

	const settle = (next: View, moveFocus = true) => {
		view = next;
		destination = next;
		root.dataset.view = next;
		root.classList.remove('is-transitioning');
		root.style.minHeight = '';
		home.inert = next !== 'home';
		about.inert = next !== 'about';
		document.documentElement.style.overflow = '';
		title.style.visibility = '';
		chevron.style.visibility = '';
		clones.forEach((clone) => { clone.style.display = 'none'; });
		document.title = next === 'about' ? 'About Me · ClovertaTheTrilobita' : homePageTitle;
		if (next === 'home') {
			clearTimeline();
			home.style.top = '';
			window.scrollTo(0, homeScroll);
			if (moveFocus) homeLink.focus({ preventScroll: true });
		} else if (moveFocus) {
			title.focus({ preventScroll: true });
		}
	};

	const createTimeline = () => {
		introAnimations.forEach((animation) => animation.cancel());
		introAnimations = [];
		root.classList.add('is-transitioning');
		home.style.top = `${-homeScroll}px`;
		root.style.minHeight = `${Math.max(innerHeight, about.scrollHeight)}px`;
		const lines = splitLines();
		copy.classList.add('is-ready');
		const travel = 800;
		const textStart = 600;
		const lineStagger = 90;
		const lineFade = 360;
		duration = Math.max(travel, textStart + Math.max(0, lines.length - 1) * lineStagger + lineFade);
		const animate = (element: HTMLElement, keyframes: Keyframe[]) => {
			const animation = element.animate(keyframes, { duration, fill: 'both' });
			animation.pause();
			animations.push(animation);
		};
		const movement = (start: Keyframe, end: Keyframe) => [
			{ ...start, offset: 0, easing: 'cubic-bezier(.65, 0, .25, 1)' },
			{ ...end, offset: travel / duration },
			{ ...end, offset: 1 },
		];

		const startTitle = homeTitle.getBoundingClientRect();
		const endTitle = title.getBoundingClientRect();
		const homeStyle = getComputedStyle(homeTitle);
		const titleStyle = getComputedStyle(title);
		const menuScale = new DOMMatrixReadOnly(getComputedStyle(homeLink).transform).a;
		const movingTitle = document.createElement('span');
		movingTitle.className = 'transition-title';
		movingTitle.textContent = 'About Me';
		movingTitle.setAttribute('aria-hidden', 'true');
		document.body.append(movingTitle);
		clones.push(movingTitle);
		animate(movingTitle, movement(
			{ left: `${startTitle.left}px`, top: `${startTitle.top}px`, fontSize: `${parseFloat(homeStyle.fontSize) * menuScale}px`, lineHeight: homeStyle.lineHeight === 'normal' ? '1.3' : `${parseFloat(homeStyle.lineHeight) * menuScale}px`, color: homeStyle.color },
			{ left: `${endTitle.left}px`, top: `${endTitle.top}px`, fontSize: titleStyle.fontSize, lineHeight: titleStyle.lineHeight, color: titleStyle.color },
		));

		const startArrow = homeChevron.getBoundingClientRect();
		const endArrow = chevron.getBoundingClientRect();
		const arrowStyle = getComputedStyle(homeChevron);
		const endArrowStyle = getComputedStyle(chevron);
		const movingArrow = document.createElement('span');
		movingArrow.className = 'transition-chevron';
		movingArrow.setAttribute('aria-hidden', 'true');
		document.body.append(movingArrow);
		clones.push(movingArrow);
		animate(movingArrow, movement(
			{ left: `${startArrow.left + startArrow.width / 2}px`, top: `${startArrow.top + startArrow.height / 2}px`, width: `${parseFloat(arrowStyle.width) * menuScale}px`, height: `${parseFloat(arrowStyle.height) * menuScale}px`, borderWidth: `${parseFloat(arrowStyle.borderTopWidth) * menuScale}px`, color: arrowStyle.color, transform: 'translate(-50%, -50%) rotate(45deg)' },
			{ left: `${endArrow.left + endArrow.width / 2}px`, top: `${endArrow.top + endArrow.height / 2}px`, width: endArrowStyle.width, height: endArrowStyle.height, borderWidth: endArrowStyle.borderTopWidth, color: endArrowStyle.color, transform: 'translate(-50%, -50%) rotate(-45deg)' },
		));

		homeLink.style.visibility = 'hidden';
		title.style.visibility = 'hidden';
		chevron.style.visibility = 'hidden';
		home.querySelectorAll<HTMLElement>('.identity, .profile, .navigation, .description, .footer, .backgrounds').forEach((element) => {
			const distance = Math.max(innerHeight + 40, element.getBoundingClientRect().bottom + 40);
			animate(element, movement({ transform: 'translateY(0)' }, { transform: `translateY(${-distance}px)` }));
		});
		lines.forEach((line, index) => {
			const start = (textStart + index * lineStagger) / duration;
			const end = (textStart + index * lineStagger + lineFade) / duration;
			animate(line, [
				{ opacity: 0, transform: 'translateY(10px)', offset: 0 },
				{ opacity: 0, transform: 'translateY(10px)', offset: start, easing: 'ease-out' },
				{ opacity: 1, transform: 'translateY(0)', offset: end },
				...(end < 1 ? [{ opacity: 1, transform: 'translateY(0)', offset: 1 }] : []),
			]);
		});
	};

	const transitionTo = async (next: View) => {
		if (next === destination) return;
		const run = ++sequence;
		destination = next;
		await fontsReady;
		if (run !== sequence) return;
		if (!animations.length && next === view) return;
		if (!animations.length) {
			if (view === 'home') homeScroll = scrollY;
			window.scrollTo(0, 0);
			createTimeline();
			animations.forEach((animation) => { animation.currentTime = view === 'home' ? 0 : duration; });
		}
		if (reducedMotion.matches) {
			animations.forEach((animation) => { animation.currentTime = next === 'about' ? duration : 0; });
			settle(next);
			return;
		}
		root.classList.add('is-transitioning');
		title.style.visibility = 'hidden';
		chevron.style.visibility = 'hidden';
		clones.forEach((clone) => { clone.style.display = ''; });
		home.inert = true;
		about.inert = false;
		document.documentElement.style.overflow = 'hidden';
		const time = Number(animations[0].currentTime ?? 0);
		const startTime = document.timeline.currentTime!;
		animations.forEach((animation) => {
			animation.playbackRate = next === 'about' ? 1 : -1;
			animation.currentTime = time;
			animation.play();
			animation.startTime = next === 'about' ? startTime - time : startTime + time;
		});
		await Promise.allSettled(animations.map((animation) => animation.finished));
		if (run === sequence) settle(next);
	};

	const plainClick = (event: MouseEvent) => event.button === 0 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
	homeLink.addEventListener('click', (event) => {
		if (!plainClick(event)) return;
		event.preventDefault();
		if (destination === 'about') return;
		history.pushState({ portfolioView: 'about', portfolioFromHome: true }, '', '/about/');
		void transitionTo('about');
	});
	back.addEventListener('click', (event) => {
		if (!plainClick(event)) return;
		event.preventDefault();
		if (destination === 'home' || backRequested) return;
		if (history.state?.portfolioFromHome) {
			backRequested = true;
			history.back();
		} else {
			history.pushState({ portfolioView: 'home' }, '', '/');
			void transitionTo('home');
		}
	});
	window.addEventListener('popstate', () => {
		backRequested = false;
		void transitionTo(location.pathname.replace(/\/$/, '') === '/about' ? 'about' : 'home');
	});
	window.addEventListener('resize', () => {
		if (innerWidth === width) return;
		width = innerWidth;
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			++sequence;
			settle(destination, false);
			clearTimeline();
			if (view === 'about') { splitLines(); copy.classList.add('is-ready'); }
		}, 120);
	});

	if (view === 'about') {
		void fontsReady.then(() => {
			if (sequence || destination !== 'about') return;
			const lines = splitLines();
			copy.classList.add('is-ready');
			if (!reducedMotion.matches) {
				introAnimations = lines.map((line, index) => line.animate([
					{ opacity: 0, transform: 'translateY(10px)' },
					{ opacity: 1, transform: 'translateY(0)' },
				], { duration: 360, delay: index * 90, fill: 'both', easing: 'ease-out' }));
			}
		});
	}
}
