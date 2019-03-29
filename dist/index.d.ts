declare type Properties<T = any> = {
    [P in string]?: T;
};
interface FetchOption {
    path: string;
    method: string;
}
declare type Fn = (...args: []) => any;
declare type Fetch = (option: FetchOption, ...args: any[]) => any;
interface ModelOption {
    root?: string;
    fetch: Fetch;
    domains: Properties;
}
declare type SubConfig = string[] & Properties & {
    _self?: string[];
};
export default class Model {
    _root: string;
    _fetch: Fetch;
    constructor({ root, fetch, domains, }: ModelOption);
    _getPath(subDomain?: string, postfix?: string): string;
    _getMethods(subDomain: string, methods: string[]): Properties<Fn>;
    _generateSubDomain(subDomain: string, subConfig: SubConfig): void;
}
export {};
