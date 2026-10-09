type View = 'home' | 'about';
type Frame = Record<string, string>;
type Track = { element: HTMLElement; frames: { offset: number; style: Frame }[] };

const easing = (progress: number, x1: number, x2: number) => {
	if (progress <= 0 || progress >= 1) return progress;
	let low = 0;
	let high = 1;
	let t = progress;
	for (let i = 0; i < 20; i++) {
		const x = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3;
		if (x < progress) low = t;
		else high = t;
		t = (low + high) / 2;
	}
	return 3 * (1 - t) * t ** 2 + t ** 3;
};

const interpolate = (from: string, to: string, progress: number) => {
	if (progress <= 0) return from;
	if (progress >= 1) return to;
	const numbers = from.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) ?? [];
	let index = 0;
	return to.replace(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi, (value) => {
		const start = Number(numbers[index++] ?? value);
		return String(start + (Number(value) - start) * progress);
	});
};
const root = document.querySelector<HTMLElement>('.portfolio');

if (root) {
	const home = root.querySelector<HTMLElement>('.home-view')!;
	const about = root.querySelector<HTMLElement>('.about-view')!;
	const homeLink = home.querySelector<HTMLAnchorElement>('[data-menu="about"]')!;
	const homeTitle = homeLink.querySelector<HTMLElement>(':scope > span:first-child')!;
	const homeChevron = homeLink.querySelector<HTMLElement>('.arrow-head')!;
	const homeShaft = homeLink.querySelector<HTMLElement>('.arrow-shaft')!;
	const title = about.querySelector<HTMLElement>('.about-title')!;
	const back = about.querySelector<HTMLAnchorElement>('.about-return')!;
	const chevron = back.querySelector<HTMLElement>('.return-chevron')!;
	const copy = about.querySelector<HTMLElement>('.about-copy')!;
	const backdrop = root.querySelector<HTMLElement>('[data-background="about"]')!;
	const backgrounds = root.querySelectorAll<HTMLElement>('[data-background]');
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	const homePageTitle = '三叶草 -More About Me-';
	const travel = 800;
	const copyTravel = travel;
	let view = root.dataset.view as View;
	let destination = view;
	let sequence = 0;
	let homeScroll = 0;
	let tracks: Track[] = [];
	let time = view === 'home' ? 0 : travel;
	let copyTime = view === 'home' ? copyTravel : 0;
	let copyDistance = 0;
	let animationFrame = 0;
	let clones: HTMLElement[] = [];
	const originalStyles = new Map<HTMLElement, string | null>();
	let width = innerWidth;
	let resizeTimer: ReturnType<typeof setTimeout>;
	let backRequested = false;
	history.scrollRestoration = 'manual';
	const fontsReady = Promise.all([
		document.fonts.load('400 48px "ZCOOL QingKe HuangYou"'),
		document.fonts.load('300 17px "Josefin Slab"'),
	]).catch(() => []);

	const releaseMenu = () => {
		homeLink.style.transform = '';
		homeLink.style.color = '';
		homeLink.style.transition = '';
		homeShaft.style.width = '';
		homeShaft.style.transition = '';
	};

	const applyFrame = (element: HTMLElement, frame: Frame) => {
		if (!originalStyles.has(element)) originalStyles.set(element, element.getAttribute('style'));
		for (const [property, value] of Object.entries(frame)) {
			if (property in element.style) (element.style as unknown as Record<string, string>)[property] = String(value);
		}
	};

	const clearTimeline = () => {
		cancelAnimationFrame(animationFrame);
		animationFrame = 0;
		tracks = [];
		originalStyles.forEach((style, element) => {
			if (style === null) element.removeAttribute('style');
			else element.setAttribute('style', style);
		});
		originalStyles.clear();
		copyDistance = 0;
		root.classList.remove('is-copy-entering', 'is-preparing');
		clones.forEach((clone) => clone.remove());
		clones = [];
		homeLink.style.visibility = '';
		releaseMenu();
		title.style.visibility = '';
		chevron.style.visibility = '';
	};

	const settle = (next: View, moveFocus = true) => {
		view = next;
		destination = next;
		time = next === 'home' ? 0 : travel;
		copyTime = next === 'home' ? copyTravel : 0;
		root.dataset.view = next;
		root.classList.remove('is-transitioning', 'is-copy-entering');
		root.style.minHeight = '';
		home.inert = next !== 'home';
		about.inert = next !== 'about';
		document.documentElement.style.overflow = '';
		title.style.visibility = '';
		chevron.style.visibility = '';
		clearTimeline();
		document.title = next === 'about' ? 'About Me · ClovertaTheTrilobita' : homePageTitle;
		if (next === 'home') {
			backgrounds.forEach((background) => background.classList.remove('visible'));
			home.style.top = '';
			window.scrollTo(0, homeScroll);
			if (moveFocus) homeLink.focus({ preventScroll: true });
		} else {
			copy.classList.add('is-ready');
			if (moveFocus) title.focus({ preventScroll: true });
		}
	};

	const measureCopy = () => {
		const translation = new DOMMatrixReadOnly(getComputedStyle(copy).transform).m42;
		const top = copy.getBoundingClientRect().top - translation;
		copyDistance = Math.max(innerHeight, innerHeight - top + 24);
	};

	const renderCopy = () => {
		applyFrame(copy, { transform: `translateY(${copyDistance * easing(copyTime / copyTravel, .55, .2)}px)` });
	};

	const renderTimeline = () => {
		const progress = time / travel;
		for (const { element, frames } of tracks) {
			const endIndex = Math.max(1, frames.findIndex((frame) => frame.offset >= progress));
			const start = frames[endIndex - 1];
			const end = frames[endIndex];
			const fraction = easing(Math.max(0, Math.min(1, (progress - start.offset) / (end.offset - start.offset))), .65, .25);
			const style: Frame = {};
			for (const property of Object.keys(start.style)) style[property] = interpolate(start.style[property], end.style[property], fraction);
			applyFrame(element, style);
		}
		renderCopy();
	};

	const createTimeline = () => {
		// Preserve the return arrow's current bounce position when taking it over.
		const returnArrow = view === 'about' ? chevron.getBoundingClientRect() : undefined;
		root.classList.add('is-preparing');
		home.style.top = `${-homeScroll}px`;
		root.style.minHeight = `${Math.max(innerHeight, about.scrollHeight)}px`;
		measureCopy();
		renderCopy();
		copy.classList.add('is-ready');
		const animate = (element: HTMLElement, frames: Track['frames']) => {
			tracks.push({ element, frames });
		};
		const movement = (start: Frame, end: Frame) => [
			{ style: start, offset: 0 },
			{ style: end, offset: 1 },
		];
		// Moving the masked layer by half the viewport carries its 25–50% band to 75–100%.
		const backdropShift = getComputedStyle(backdrop).getPropertyValue('--about-backdrop-shift').trim();
		const backdropDistance = parseFloat(backdropShift) * (backdropShift.endsWith('vw') ? innerWidth / 100 : 1);
		animate(backdrop, movement(
			{ transform: 'translateX(0px)' },
			{ transform: `translateX(${backdropDistance}px)` },
		));

		const startTitle = homeTitle.getBoundingClientRect();
		const endTitle = title.getBoundingClientRect();
		const homeStyle = getComputedStyle(homeTitle);
		const titleStyle = getComputedStyle(title);
		const menuScale = new DOMMatrixReadOnly(getComputedStyle(homeLink).transform).a;
		const movingTitle = document.createElement('span');
		movingTitle.className = 'transition-title';
		movingTitle.textContent = 'About Me';
		movingTitle.setAttribute('aria-hidden', 'true');
		movingTitle.style.visibility = 'hidden';
		document.body.append(movingTitle);
		clones.push(movingTitle);
		animate(movingTitle, movement(
			{ left: `${startTitle.left}px`, top: `${startTitle.top}px`, fontSize: `${parseFloat(homeStyle.fontSize) * menuScale}px`, lineHeight: `${(homeStyle.lineHeight === 'normal' ? parseFloat(homeStyle.fontSize) * 1.3 : parseFloat(homeStyle.lineHeight)) * menuScale}px`, color: homeStyle.color },
			{ left: `${endTitle.left}px`, top: `${endTitle.top}px`, fontSize: titleStyle.fontSize, lineHeight: titleStyle.lineHeight, color: titleStyle.color },
		));

		const startArrow = homeChevron.getBoundingClientRect();
		const endArrow = returnArrow ?? chevron.getBoundingClientRect();
		const arrowStyle = getComputedStyle(homeChevron);
		const endArrowStyle = getComputedStyle(chevron);
		const movingArrow = document.createElement('span');
		movingArrow.className = 'transition-chevron';
		movingArrow.setAttribute('aria-hidden', 'true');
		movingArrow.style.visibility = 'hidden';
		document.body.append(movingArrow);
		clones.push(movingArrow);
		animate(movingArrow, movement(
			{ left: `${startArrow.left + startArrow.width / 2}px`, top: `${startArrow.top + startArrow.height / 2}px`, width: `${parseFloat(arrowStyle.width) * menuScale}px`, height: `${parseFloat(arrowStyle.height) * menuScale}px`, borderWidth: `${parseFloat(arrowStyle.borderTopWidth) * menuScale}px`, color: arrowStyle.color, transform: 'translate(-50%, -50%) rotate(45deg)' },
			{ left: `${endArrow.left + endArrow.width / 2}px`, top: `${endArrow.top + endArrow.height / 2}px`, width: endArrowStyle.width, height: endArrowStyle.height, borderWidth: endArrowStyle.borderTopWidth, color: endArrowStyle.color, transform: 'translate(-50%, -50%) rotate(-45deg)' },
		));

		home.querySelectorAll<HTMLElement>('.identity, .profile, .navigation, .description, .footer').forEach((element) => {
			const distance = Math.max(innerHeight + 40, element.getBoundingClientRect().bottom + 40);
			animate(element, movement({ transform: 'translateY(0)' }, { transform: `translateY(${-distance}px)` }));
		});
	};

	const collapseReturnEndpoint = () => {
		const progress = Math.min(1, Math.max(0, time / travel));
		const frames = tracks.slice(1, 3).map((track) => {
			const style = getComputedStyle(track.element);
			const current: Frame = {};
			for (const property of Object.keys(track.frames[0].style)) {
				current[property] = style[property as keyof CSSStyleDeclaration] as string;
			}
			// Preserve the numeric transform template rather than its computed matrix.
			if ('transform' in current) current.transform = track.element.style.transform;
			return { track, current };
		});
		homeLink.classList.add('is-returned');
		releaseMenu();
		// Measure the resting endpoint without moving the live navigation back to it.
		const navigation = homeLink.closest<HTMLElement>('.navigation')!;
		const navigationOffset = new DOMMatrixReadOnly(getComputedStyle(navigation).transform).m42;
		const titleRect = homeTitle.getBoundingClientRect();
		const arrowRect = homeChevron.getBoundingClientRect();
		const titleStyle = getComputedStyle(homeTitle);
		const arrowStyle = getComputedStyle(homeChevron);
		const endpoints = [
			{ left: `${titleRect.left}px`, top: `${titleRect.top - navigationOffset}px`, fontSize: titleStyle.fontSize, lineHeight: titleStyle.lineHeight, color: titleStyle.color },
			{ left: `${arrowRect.left + arrowRect.width / 2}px`, top: `${arrowRect.top + arrowRect.height / 2 - navigationOffset}px`, width: arrowStyle.width, height: arrowStyle.height, borderWidth: arrowStyle.borderTopWidth, color: arrowStyle.color },
		];
		frames.forEach(({ track, current }, index) => {
			const start = { offset: 0, style: { ...track.frames[0].style, ...endpoints[index] } };
			track.frames = [start, ...(progress > 0 && progress < 1 ? [{ offset: progress, style: current }] : []), track.frames[track.frames.length - 1]];
		});
	};

	const playTimeline = (next: View, run: number) => {
		cancelAnimationFrame(animationFrame);
		let previous = performance.now();
		const target = next === 'about' ? travel : 0;
		const copyTarget = next === 'about' ? 0 : copyTravel;
		const advance = (value: number, target: number, elapsed: number) => value < target ? Math.min(target, value + elapsed) : Math.max(target, value - elapsed);
		const tick = (now: number) => {
			if (run !== sequence) return;
			const elapsed = Math.max(0, now - previous);
			previous = now;
			time = advance(time, target, elapsed);
			copyTime = advance(copyTime, copyTarget, elapsed);
			renderTimeline();
			if (time === target && copyTime === copyTarget) settle(next);
			else animationFrame = requestAnimationFrame(tick);
		};
		animationFrame = requestAnimationFrame(tick);
	};

	const transitionTo = async (next: View) => {
		if (next === destination) return;
		const run = ++sequence;
		destination = next;
		await fontsReady;
		if (run !== sequence) return;
		if (!tracks.length && next === view) {
			settle(next);
			return;
		}
		if (tracks.length && next === 'home') collapseReturnEndpoint();
		const preparing = !tracks.length;
		if (preparing) {
			if (view === 'home') homeScroll = scrollY;
			// Freeze the current hover geometry before the link becomes inert/hidden.
			// A return always measures a fresh, collapsed homepage endpoint.
			if (next === 'home') homeLink.classList.add('is-returned');
			const menuStyle = getComputedStyle(homeLink);
			const menuTransform = menuStyle.transform;
			const menuColor = menuStyle.color;
			const shaftWidth = getComputedStyle(homeShaft).width;
			homeLink.style.transform = menuTransform;
			homeLink.style.color = menuColor;
			homeLink.style.transition = 'none';
			homeShaft.style.width = shaftWidth;
			homeShaft.style.transition = 'none';
			window.scrollTo(0, 0);
			createTimeline();
		}
		if (reducedMotion.matches) {
			settle(next);
			return;
		}
		document.documentElement.style.overflow = 'hidden';
		// Set every moving element's initial style before revealing either view.
		// One main-thread frame owns both visibility and motion; there is no pending
		// compositor animation that can briefly expose the destination's resting pose.
		renderTimeline();
		root.classList.add('is-transitioning');
		root.classList.remove('is-preparing');
		backgrounds.forEach((background) => background.classList.toggle('visible', background === backdrop));
		homeLink.style.visibility = 'hidden';
		title.style.visibility = 'hidden';
		chevron.style.visibility = 'hidden';
		clones.forEach((clone) => { clone.style.visibility = ''; });
		home.inert = true;
		about.inert = false;
		playTimeline(next, run);
	};

	const plainClick = (event: MouseEvent) => event.button === 0 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
	// Keep focus accessible on return without expanding the button until a new interaction.
	homeLink.addEventListener('pointerenter', () => homeLink.classList.remove('is-returned'));
	homeLink.addEventListener('blur', () => homeLink.classList.remove('is-returned'));
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
		}, 120);
	});

	if (view === 'about') {
		void fontsReady.then(() => {
			if (sequence || destination !== 'about') return;
			if (!reducedMotion.matches) {
				root.classList.add('is-copy-entering');
				document.documentElement.style.overflow = 'hidden';
				copyTime = copyTravel;
				measureCopy();
				renderCopy();
				copy.classList.add('is-ready');
				let previous = performance.now();
				const tick = (now: number) => {
					if (sequence) return;
					copyTime = Math.max(0, copyTime - Math.max(0, now - previous));
					previous = now;
					renderCopy();
					if (copyTime) animationFrame = requestAnimationFrame(tick);
					else {
						root.classList.remove('is-copy-entering');
						document.documentElement.style.overflow = '';
					}
				};
				animationFrame = requestAnimationFrame(tick);
			} else {
				copy.classList.add('is-ready');
			}
		});
	}
}
