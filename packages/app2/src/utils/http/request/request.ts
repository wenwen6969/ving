const requestBefore = Symbol('requestBefore')
const requestAfter = Symbol('requestAfter')
const isCompleteURL = Symbol('isCompleteURL')
const config = Symbol('config')

export default class Request {
  config: { baseURL?: string } & UniApp.RequestOptions = {
    baseURL: '',
    url: '',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    method: 'GET',
    timeout: 3000,
    dataType: 'json',
    responseType: 'text',
  }

  /**
   *  @description 拦截器
   */
  interceptors = {
    request: (func: Fn) => {
      if (func) {
        Request.requestBefore = func
      } else {
        Request.requestBefore = (request) => request
      }
    },
    response: (func: Fn) => {
      if (func) {
        Request[requestAfter] = func
      } else {
        Request[requestAfter] = (response) => response
      }
    },
  }
  static requestBefore(config: UniApp.RequestOptions) {
    return config
  }
  static requestAfter(response: unknown) {
    return response
  }
  /**
   * 判断url是否完整
   * */
  static isCompleteURL(url: string) {
    return /(http|https):\/\/([\w.]+\/?)\S*/.test(url)
  }
  request(options: UniApp.RequestOptions & { baseURL?: string }) {
    options.baseURL = options.baseURL || this.config.baseURL
    options.dataType = options.dataType || this.config.dataType
    options.url = Request.isCompleteURL(options.url) ? options.url : options.baseURL + options.url
    options.header = { ...options.header, ...this.config.header }
    // eslint-disable-next-line no-self-assign
    options.data = options.data
    options.method = options.method || this.config.method

    options = { ...options, ...Request.requestBefore(options) }

    return new Promise((resolve, reject) => {
      options.success = function (res) {
        resolve(Request[requestAfter](res))
      }
      options.fail = function (err) {
        reject(Request[requestAfter](err))
      }
      uni.request(options)
      // 中断请求实现方法
      // let obj: any = {}
      // obj[request.url] = uni.request(options)
      // abortRequest() {
      //   for (const key in obj) {
      //     if (Object.prototype.hasOwnProperty.call(obj, key)) {
      //       const element = obj[key];
      //       element.abort()
      //     }
      //   }
      // }
    })
  }
  get(url: string, data: string | AnyObject | ArrayBuffer = {}, options: Recordable = {}) {
    return this.request({ ...options, url, data, method: 'GET' })
  }

  post(url: string, data: string | AnyObject | ArrayBuffer = {}, options: Recordable = {}) {
    return this.request({ ...options, url, data, method: 'POST' })
  }

  put(url: string, data: string | AnyObject | ArrayBuffer = {}, options: Recordable = {}) {
    return this.request({ ...options, url, data, method: 'PUT' })
  }

  delete(url: string, data: string | AnyObject | ArrayBuffer = {}, options: Recordable = {}) {
    return this.request({ ...options, url, data, method: 'DELETE' })
  }

  getConfig() {
    return this.config
  }

  // 修改默认配置的一个方法，可以修改请求地址，请求方式等等..
  setConfig(func: Fn) {
    console.log(func)
    this.config = func(this.config)
  }
}
