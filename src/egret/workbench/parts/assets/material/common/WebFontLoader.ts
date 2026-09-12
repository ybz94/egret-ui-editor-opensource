import { ResLibData } from './ResLibData';

/**
 * 把资源库中的 ttf 字体注册为文档可用的 web 字体。
 * 注册后 egret.TextField 的 fontFamily（canvas fillText）即可解析到该字体。
 */
export class WebFontLoader {

	/** 每个 document 各自维护一份已注册的字体名，iframe 与主文档互不干扰 */
	private static registered: WeakMap<Document, Set<string>> = new WeakMap<Document, Set<string>>();

	/**
	 * 确保指定文档已经注册了所有 ttf 字体（增量注入，重复调用安全）
	 * @param doc 目标文档（主文档或运行时 iframe 的 document）
	 */
	public static ensureTTFFonts(doc: Document): void {
		if (!doc || !doc.head) {
			return;
		}
		let names = WebFontLoader.registered.get(doc);
		if (!names) {
			names = new Set<string>();
			WebFontLoader.registered.set(doc, names);
		}
		const fonts = ResLibData.getTTFFonts();
		let styleText = '';
		for (let i = 0; i < fonts.length; i++) {
			const font = fonts[i];
			if (!font.name || names.has(font.name)) {
				continue;
			}
			names.add(font.name);
			styleText += '@font-face{font-family:"' + font.name + '";'
				+ 'src:url("' + WebFontLoader.toFileUrl(font.url) + '") format("truetype");}';
		}
		if (!styleText) {
			return;
		}
		const style = doc.createElement('style');
		style.type = 'text/css';
		style.textContent = styleText;
		doc.head.appendChild(style);
		// 触发浏览器实际加载字体（@font-face 本身是惰性的，canvas 使用前必须加载完成）
		const docFonts: any = (<any>doc).fonts;
		if (docFonts && docFonts.load) {
			fonts.forEach(font => {
				try {
					docFonts.load('12px "' + font.name + '"').catch(() => void 0);
				} catch (e) { }
			});
		}
	}

	/**
	 * 本地绝对路径转 file:// URL
	 */
	private static toFileUrl(path: string): string {
		let normalized = path.replace(/\\/g, '/');
		if (normalized.charAt(0) !== '/') {
			normalized = '/' + normalized;
		}
		return 'file://' + normalized;
	}
}