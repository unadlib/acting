type Properties<T = any> = {
  [P in string]?: T;
}
interface FetchOption {
  path: string,
  method: string,
}
type Fn = (...args:[]) => any;
type Fetch = (option: FetchOption, ...args) => any;
interface ModelOption {
  root?: string,
  fetch: Fetch,
  domains: Properties,
}
type SubConfig = string[] & Properties & {
  _self?: string[],
}

export default class Model {
  public _root: string;
  public _fetch: Fetch;

  constructor({
    root = ``,
    fetch,
    domains = {},
  }: ModelOption) {
    this._root = root;
    this._fetch = fetch;
    (<any>Object).entries(domains).forEach(
      ([subDomain, subConfig]) => this._generateSubDomain(subDomain, subConfig)
    );
  }

  _getPath(subDomain: string = '', postfix: string = ''): string {
    return `${this._root}/${subDomain}${postfix}`;
  }
  
  _getMethods(subDomain: string, methods: string[]): Properties<Fn> {
    return methods.reduce(
      (_subDomain, method) => (<any>Object).assign(_subDomain, {
        [method.toLowerCase()]: async (postfix, ...args) => {
          const path = this._getPath(subDomain, postfix);
          return await this._fetch({ path, method }, ...args);
        }
      }),
    {});
  }

  _generateSubDomain(subDomain: string, subConfig: SubConfig) {
    if (Array.isArray(subConfig)) {
      this[subDomain] = this._getMethods(subDomain, subConfig);
    }
    if (Array.isArray(subConfig._self)) {
      this[subDomain] = this._getMethods(subDomain, subConfig._self);
    }
    if ((<any>Object).prototype.toString.call(subConfig) === '[object Object]') {
      this[subDomain] = {
        ...this[subDomain],
        ...new Model({
          root: this._getPath(subDomain),
          fetch: this._fetch,
          domains: subConfig,
        }),
      };
    }
  }
}