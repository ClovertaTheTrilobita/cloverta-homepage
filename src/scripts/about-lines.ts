/** Group the rendered words into their actual visual lines, preserving links. */
export function createLineSplitter(copy: HTMLElement) {
	const paragraphs = Array.from(copy.querySelectorAll<HTMLParagraphElement>('p'));
	const originals = paragraphs.map((paragraph) => paragraph.innerHTML);

	return () => {
		const lines: HTMLElement[] = [];
		paragraphs.forEach((paragraph, index) => {
			paragraph.innerHTML = originals[index];
			const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
			const words: { text: string; top: number; link: HTMLAnchorElement | null }[] = [];
			let node: Node | null;
			while ((node = walker.nextNode())) {
				const text = node.textContent ?? '';
				for (const match of text.matchAll(/\S+/g)) {
					const range = document.createRange();
					range.setStart(node, match.index!);
					range.setEnd(node, match.index! + match[0].length);
					words.push({ text: match[0], top: range.getBoundingClientRect().top, link: node.parentElement?.closest('a') ?? null });
				}
			}
			const fragment = document.createDocumentFragment();
			let line: HTMLSpanElement | undefined;
			let top = -Infinity;
			let previousLink: HTMLAnchorElement | null = null;
			let lineLink: HTMLAnchorElement | null = null;
			words.forEach((word) => {
				if (!line || Math.abs(word.top - top) > 2) {
					line = document.createElement('span');
					line.className = 'about-line';
					fragment.append(line);
					lines.push(line);
					top = word.top;
					previousLink = null;
					lineLink = null;
				}
				if (word.link) {
					if (word.link !== previousLink) {
						if (line.childNodes.length) line.append(' ');
						lineLink = word.link.cloneNode(false) as HTMLAnchorElement;
						line.append(lineLink);
					} else {
						lineLink!.append(' ');
					}
					lineLink!.append(word.text);
				} else {
					if (line.childNodes.length) line.append(' ');
					line.append(word.text);
					lineLink = null;
				}
				previousLink = word.link;
			});
			paragraph.replaceChildren(fragment);
			// Keep font kerning across word boundaries identical to the original text.
			paragraph.normalize();
		});
		return lines;
	};
}
