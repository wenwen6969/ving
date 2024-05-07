import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { Result, UploadFileParams, RequestOptions } from '@/types/axios';
import { cloneDeep } from 'lodash-es';
import { CreateAxiosOptions } from './axiosTransform';
import { isFunction } from '@/utils/is';
import { AxiosCanceler } from './axiosCancel';
import { ContentType, RequestEnum } from '@/enums/HttpEnum';
import qs from 'qs';

export class WAxios {
	private instance: AxiosInstance;
	private readonly options: CreateAxiosOptions;
	constructor(options: CreateAxiosOptions) {
		this.options = options;
		this.instance = axios.create(options);
		this.setupInterceptors();
	}
	getAxios(): AxiosInstance {
		return this.instance;
	}
	private createAxios(config: AxiosRequestConfig) {
		this.instance = axios.create(config);
	}
	setAxiosConfig(config: AxiosRequestConfig) {
		if (!this.instance) {
			return;
		}
		this.createAxios(config);
	}
	getTransform() {
		const { transform } = this.options;
		return transform;
	}
	public setupInterceptors() {
		const {
			instance,
			options: { transform },
		} = this;
		if (!transform) {
			return;
		}

		const { requestInterceptors, requestInterceptorsCatch, responseInterceptors, responseInterceptorsCatch } = transform;
		const axiosCanceler = new AxiosCanceler();

		this.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
			const { requestOptions } = this.options;
			const ignoreCancelToken = requestOptions?.ignoreCancelToken ?? true;

			!ignoreCancelToken && axiosCanceler.addPending(config);

			if (requestInterceptors && isFunction(requestInterceptors)) {
				config = requestInterceptors(config, this.options);
			}
			return config;
		}, undefined);

		requestInterceptorsCatch && isFunction(requestInterceptorsCatch) && this.instance.interceptors.request.use(undefined, requestInterceptorsCatch);

		this.instance.interceptors.response.use((res: AxiosResponse<any>) => {
			res && axiosCanceler.removePending(res.config);
			if (responseInterceptors && isFunction(responseInterceptors)) {
				res = responseInterceptors(res);
			}
			return res;
		}, undefined);

		responseInterceptorsCatch &&
			isFunction(responseInterceptorsCatch) &&
			this.instance.interceptors.response.use(undefined, (error) => {
				return responseInterceptorsCatch(instance, error);
			});
	}
	setHeader(header: any): void {
		if (!this.instance) {
			return;
		}
		Object.assign(this.instance.defaults.headers, header);
	}

	/**发起axios请求 */
	request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
		let conf: CreateAxiosOptions = cloneDeep(config);
		if (config.cancelToken) {
			conf.cancelToken = config.cancelToken;
		}
		const transform = this.getTransform();
		const { requestOptions } = this.options;
		const opt: RequestOptions = Object.assign({}, requestOptions, options);

		const { beforeRequestHook, requestCatchHook, transformResponseHook } = transform || {};

		if (beforeRequestHook && isFunction(beforeRequestHook)) {
			conf = beforeRequestHook(conf, opt);
		}

		conf.requestOptions = opt;

		conf = this.supportFormData(conf);

		return new Promise((resolve, reject) => {
			this.instance
				.request<any, AxiosResponse<Result>>(conf)
				.then((res: AxiosResponse<Result>) => {
					if (transformResponseHook && isFunction(transformResponseHook)) {
						try {
							const ret = transformResponseHook(res, opt);
							resolve(ret);
						} catch (err) {
							reject(err || new Error('request error!'));
						}
						return;
					}
					resolve(res as unknown as Promise<T>);
				})
				.catch((e: Error | AxiosError) => {
					if (requestCatchHook && isFunction(requestCatchHook)) {
						reject(requestCatchHook(e, opt));
						return;
					}
					if (axios.isAxiosError(e)) {
						console.log(e);
					}
					reject(e);
				});
		});
	}

	/**上传文件的axios请求 */
	uploadFile<T = any>(config: AxiosRequestConfig, params: UploadFileParams) {
		const FormData = new window.FormData();
		const customFilename = params.name || 'file';
		if (params.filename) {
			FormData.append(customFilename, params.file, params.filename);
		} else {
			FormData.append(customFilename, params.file);
		}
		if (params.data) {
			Object.keys(params.data).forEach((key) => {
				const value = params.data![key];
				if (Array.isArray(value)) {
					value.forEach((item) => {
						FormData.append(`${key}[]`, item);
					});
					return;
				}
				FormData.append(key, params.data![key]);
			});
		}

		return this.instance.request<T>({
			...config,
			method: 'POST',
			data: FormData,
			headers: {
				'Content-Type': ContentType.FORM_DATA,
				ignoredCancelToken: true,
			},
		});
	}

	/**是否支持上传formData数据 */
	supportFormData(config: AxiosRequestConfig) {
		const header = config.headers || this.options.headers;
		const contentType = header?.['Content-Type'] || header?.['content-type'];
		if (contentType !== ContentType.FORM_URLENCODED || !Reflect.has(config, 'data') || config.method?.toLowerCase() === RequestEnum.GET) {
			return config;
		}
		return {
			...config,
			data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
		};
	}
	/**发送get请求 */
	get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
		return this.request({ ...config, method: 'GET' }, options);
	}
	/**发送post请求 */
	post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
		return this.request({ ...config, method: 'POST' }, options);
	}

	put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
		return this.request({ ...config, method: 'PUT' }, options);
	}

	delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
		return this.request({ ...config, method: 'DELETE' }, options);
	}
}
