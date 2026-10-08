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
	let animations: Animation[] = [];
	let copyAnimation: Animation | undefined;
	let clones: HTMLElement[] = [];
	let width = innerWidth;
	let resizeTimer: ReturnType<typeof setTimeout>;
	let backRequested = false;
	history.scrollRestoration = 'manual';
	const fontsReady = Promise.all([
		document.fonts.load('400 48px "ZCOOL QingKe HuangYou"'),
		document.fonts.load('300 17px "Josefin Slab"'),
	]).catch(() => []);

	const clearTimeline = () => {
		animations.forEach((animation) => animation.cancel());
		animations = [];
		copyAnimation?.cancel();
		copyAnimation = undefined;
		root.classList.remove('is-copy-entering');
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
		root.classList.remove('is-transitioning', 'is-copy-entering');
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
			backgrounds.forEach((background) => background.classList.remove('visible'));
			home.style.top = '';
			window.scrollTo(0, homeScroll);
			if (moveFocus) homeLink.focus({ preventScroll: true });
		} else {
			if (moveFocus) title.focus({ preventScroll: true });
		}
	};

	const createCopyAnimation = (time: number) => {
		const distance = Math.max(innerHeight, innerHeight - copy.getBoundingClientRect().top + 24);
		copyAnimation = copy.animate([
			{ transform: 'translateY(0)' },
			{ transform: `translateY(${distance}px)` },
		], { duration: copyTravel, fill: 'both', easing: 'cubic-bezier(.55, 0, .2, 1)' });
		copyAnimation.pause();
		copyAnimation.currentTime = time;
	};

	const createTimeline = () => {
		root.classList.add('is-transitioning');
		home.style.top = `${-homeScroll}px`;
		root.style.minHeight = `${Math.max(innerHeight, about.scrollHeight)}px`;
		copy.classList.add('is-ready');
		if (!copyAnimation) createCopyAnimation(view === 'home' ? copyTravel : 0);
		const animate = (element: HTMLElement, keyframes: Keyframe[]) => {
			const animation = element.animate(keyframes, { duration: travel, fill: 'both' });
			animation.pause();
			animations.push(animation);
		};
		const movement = (start: Keyframe, end: Keyframe) => [
			{ ...start, offset: 0, easing: 'cubic-bezier(.65, 0, .25, 1)' },
			{ ...end, offset: 1 },
		];
		// Moving the masked layer by half the viewport carries its 25–50% band to 75–100%.
		animate(backdrop, movement(
			{ transform: 'translateX(0)' },
			{ transform: `translateX(${getComputedStyle(backdrop).getPropertyValue('--about-backdrop-shift').trim()})` },
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
		home.querySelectorAll<HTMLElement>('.identity, .profile, .navigation, .description, .footer').forEach((element) => {
			const distance = Math.max(innerHeight + 40, element.getBoundingClientRect().bottom + 40);
			animate(element, movement({ transform: 'translateY(0)' }, { transform: `translateY(${-distance}px)` }));
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
			animations.forEach((animation) => { animation.currentTime = view === 'home' ? 0 : travel; });
		}
		if (reducedMotion.matches) {
			animations.forEach((animation) => { animation.currentTime = next === 'about' ? travel : 0; });
			copyAnimation!.currentTime = next === 'about' ? 0 : copyTravel;
			settle(next);
			return;
		}
		root.classList.add('is-transitioning');
		backgrounds.forEach((background) => background.classList.toggle('visible', background === backdrop));
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
		const pending = animations.map((animation) => animation.finished);
		// One animation runs outward on return and backward on entry, including mid-flight reversals.
		const copyTime = Number(copyAnimation!.currentTime ?? 0);
		copyAnimation!.playbackRate = next === 'about' ? -1 : 1;
		copyAnimation!.currentTime = copyTime;
		copyAnimation!.play();
		copyAnimation!.startTime = next === 'about' ? startTime + copyTime : startTime - copyTime;
		pending.push(copyAnimation!.finished);
		await Promise.allSettled(pending);
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
			if (view === 'about') copy.classList.add('is-ready');
		}, 120);
	});

	if (view === 'about') {
		void fontsReady.then(() => {
			if (sequence || destination !== 'about') return;
			copy.classList.add('is-ready');
			if (!reducedMotion.matches) {
				root.classList.add('is-copy-entering');
				document.documentElement.style.overflow = 'hidden';
				createCopyAnimation(copyTravel);
				copyAnimation!.playbackRate = -1;
				copyAnimation!.play();
				void copyAnimation!.finished.then(() => {
					if (sequence) return;
					root.classList.remove('is-copy-entering');
					document.documentElement.style.overflow = '';
				}).catch(() => {});
			}
		});
	}
}
