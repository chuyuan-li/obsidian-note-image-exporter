import { isCreatable } from "./imageFormatTester";

type SettingsRecord = Record<string, unknown>;

function isRecord(value: unknown): value is SettingsRecord {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeObject<T>(defaults: T, saved: unknown): T {
	if (!isRecord(defaults)) {
		return saved === undefined ? defaults : (saved as T);
	}

	const result: SettingsRecord = {};
	for (const [key, value] of Object.entries(defaults)) {
		result[key] = mergeObject(
			value,
			isRecord(saved) ? saved[key] : undefined,
		);
	}

	if (isRecord(saved)) {
		for (const [key, value] of Object.entries(saved)) {
			if (!(key in result)) {
				result[key] = value;
			}
		}
	}

	return result as T;
}

export function mergeSettings(
	saved: Partial<ISettings> | null | undefined,
): ISettings {
	return mergeObject(DEFAULT_SETTINGS, saved);
}

export const DEFAULT_SETTINGS: ISettings = {
	width: 750,
	showFilename: true,

	resolutionMode: "3x",
	format: "png0",
	showMetadata: false,
	recursive: false,
	quickExportSelection: false,
	padding: {
		top: 24,
		right: 24,
		bottom: 24,
		left: 24,
		unified: true,
	},
	authorInfo: {
		show: false,
		align: "right",
		position: "bottom",
	},
	watermark: {
		enable: false,
		type: "text",
		text: {
			content: "",
			fontSize: 28,
			color: "#cccccc",
		},
		image: {
			src: "",
		},
		opacity: 0.2,
		rotate: 30,
		height: 64,
		width: 120,
		x: 100,
		y: 100,
	},
	split: {
		height: 1000,
		overlap: 80,
		mode: "none",
	},
};

const formatList: FileFormat[] = ["png0", "png1", "jpg", "webp", "pdf"];
export const formatAvailable: FileFormat[] = [...formatList];
let formatAvailablePromise: Promise<FileFormat[]> | undefined;

export function getAvailableFormats(): Promise<FileFormat[]> {
	if (!formatAvailablePromise) {
		formatAvailablePromise = (async () => {
			const available: FileFormat[] = [];
			for (const type of formatList) {
				if (await isCreatable(type)) {
					available.push(type);
				}
			}
			formatAvailable.splice(0, formatAvailable.length, ...available);
			return formatAvailable;
		})();
	}

	return formatAvailablePromise;
}
