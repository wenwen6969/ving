import type { AxiosRequestConfig } from 'axios';

const pending = new Map<string, AbortController>();

const getPendingUrl = (config: AxiosRequestConfig): string => {
	return [config.method, config.url].join('&');
};

export class AxiosCanceler {
	public addPending(config: AxiosRequestConfig): void {
		this.removePending(config);
		const url = getPendingUrl(config);
		const controller = new AbortController();
		config.signal = config.signal || controller.signal;
		if (!pending.has(url)) {
			pending.set(url, controller);
		}
	}
	public removePending(config: AxiosRequestConfig) {
		const url = getPendingUrl(config);
		if (pending.has(url)) {
			const abortController = pending.get(url);
			if (abortController) {
				abortController.abort();
			}
			pending.delete(url);
		}
	}
	public removeAllPending(): void {
		pending.forEach((abortController) => {
			if (abortController) {
				abortController.abort();
			}
			this.reset();
		});
	}
	public reset(): void {
		pending.clear();
	}
}
