import type { AxiosResponse, AxiosInstance } from 'axios';
import { WAxios } from './axios';
import { deepMerge } from '@/utils';
import type { CreateAxiosOptions, AxiosRequestTransform } from './axiosTransform';
import { clone } from 'lodash-es';
import { ContentType } from '@/enums/HttpEnum';
import type { Result, RequestOptions } from '@/types/axios';
import axios from 'axios';
import { useGlobSetting } from '@/hooks/setting';
const globSetting = useGlobSetting();
const urlPrefix = globSetting.urlPrefix;

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosRequestTransform = {
	/**
	 * @description: 处理响应数据。如果数据不是预期格式，可直接抛出错误
	 */
	transformResponseHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
		return null;
	},

	// 请求之前处理config
	beforeRequestHook: (config, options) => {
		const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix } = options;

		if (joinPrefix) {
			config.url = `${urlPrefix}${config.url}`;
		}

		return config;
	},

	/**
	 * @description: 请求拦截器处理
	 */
	requestInterceptors: (config, options) => {
		// 请求之前处理config
		const token = 'getToken()';
		if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
			// jwt token
			(config as Recordable).headers.Authorization = options.authScheme ? `${options.authScheme} ${token}` : token;
		}
		return config;
	},

	/**
	 * @description: 响应拦截器处理
	 */
	responseInterceptors: (res: AxiosResponse<any>) => {
		return res;
	},

	/**
	 * @description: 响应错误处理
	 */
	responseInterceptorsCatch: (axiosInstance: AxiosInstance, error: any) => {
		const { response, code, message, config } = error || {};
		const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none';
		const msg: string = response?.data?.error?.message ?? '';
		const err: string = error?.toString?.() ?? '';
		const errMessage = '';

		if (axios.isCancel(error)) {
			return Promise.reject(error);
		}

		try {
			if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
				// errMessage = t('sys.api.apiTimeoutMessage');
			}
			if (err?.includes('Network Error')) {
				// errMessage = t('sys.api.networkExceptionMsg');
			}

			if (errMessage) {
				if (errorMessageMode === 'modal') {
					// createErrorModal({ title: t('sys.api.errorTip'), content: errMessage });
				} else if (errorMessageMode === 'message') {
					// createMessage.error(errMessage);
				}
				return Promise.reject(error);
			}
		} catch (error) {
			throw new Error(error as unknown as string);
		}

		return Promise.reject(error);
	},
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
	return new WAxios(
		// 深度合并
		deepMerge(
			{
				// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
				// authentication schemes，e.g: Bearer
				// authenticationScheme: 'Bearer',
				authenticationScheme: '',
				timeout: 10 * 1000,
				// 基础接口地址
				// baseURL: globSetting.apiUrl,

				headers: { 'Content-Type': ContentType.JSON },
				// 如果是form-data格式
				// headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
				// 数据处理方式
				transform: clone(transform),
				// 配置项，下面的选项都可以在独立的接口请求中覆盖
				requestOptions: {
					// 默认将prefix 添加到url
					joinPrefix: true,
					// 是否返回原生响应头 比如：需要获取响应头时使用该属性
					isReturnNativeResponse: false,
					// 需要对返回数据进行处理
					isTransformResponse: true,
					// post请求的时候添加参数到url
					joinParamsToUrl: false,
					// 格式化提交参数时间
					formatDate: true,
					// 消息提示类型
					errorMessageMode: 'message',
					// 接口地址
					apiUrl: globSetting.apiUrl,
					// 接口拼接地址
					urlPrefix: urlPrefix,
					//  是否加入时间戳
					joinTime: true,
					// 忽略重复请求
					ignoreCancelToken: true,
					// 是否携带token
					withToken: true,
					retryRequest: {
						isOpenRetry: true,
						count: 5,
						waitTime: 100,
					},
				},
			},
			opt || {}
		)
	);
}
export const defHttp = createAxios();
