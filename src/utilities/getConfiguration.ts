export interface OktaConfig {
  oAuthClientId: string;
  oAuthDomain: string;
  redirectUri: string;
  scopes:string[];
}

let configPromise: Promise<AppConfig>;
const configRequst = () => configPromise || (configPromise = (() => {
  let baseUri: string | undefined = document.baseURI;
  if (!baseUri) {
    baseUri = document.querySelector('base')?.getAttribute('href') ?? undefined;
  }

  let result = baseUri;
  if (!result || result.startsWith('./')) {
    result = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  }

  if (!result.match(/^http/i)) {
    result = result.startsWith('/') ? result : `/${result}`;
    result = `${window.location.protocol}//${window.location.host}${result}`;
  }

  if(result.indexOf('#') > -1){
    result = result.split('#')[0];
  }
  else {
    result = result.split('?')[0];
  }

  const pathname = result.slice(result.indexOf(window.location.host) + window.location.host.length)

  let configJsonPath = `/${pathname}/app-config.json?${Date.now()}`;
  while (/\/\//.test(configJsonPath)) { 
    configJsonPath = configJsonPath.replace('//', '/');
  }

  return fetch(configJsonPath).then(async response => {
    try {
      const json = await response.json();
      return json;
    } catch (e: any) {
      throw new Error("Invalid json in app-config.json")
    }
  })
})());

export const getConfiguration = <T extends AppConfig>(): Promise<T> => {
  return configRequst() as Promise<T>;
}