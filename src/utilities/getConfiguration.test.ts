const initLocation = global.window.location;

const patchLocation = (url: string) => {
  const urlBase = new URL(url);

  global.window.location = {
    ancestorOrigins: {} as DOMStringList,
    assign: jest.fn(),
    hash: urlBase.hash,
    href: urlBase.href,
    host: urlBase.host,
    hostname: urlBase.hostname,
    origin: urlBase.origin,
    pathname: urlBase.pathname,
    port: urlBase.port,
    protocol: urlBase.protocol,
    reload: jest.fn(),
    replace: jest.fn(),
    search: urlBase.search,
  };
}

const patchBaseUri = (baseUri: string | undefined) => {
  Object.defineProperty(global.window.document, 'baseURI', {
    writable: true,
    value: baseUri,
  })
}


describe('configuration-service', () => {
  beforeEach(() => {
    delete global.window.location;
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      json: jest.fn(() => Promise.resolve({ config: true })),
    }));
    global.Date.now = jest.fn(() => 123);
    (global.fetch as jest.Mock).mockClear();
     patchBaseUri(undefined);
    const base = document.querySelector('base');
    if (base) {
      document.head.removeChild(base);
    }
  });

  afterEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    global.window.location = initLocation;
  });

  const testScenarios: [string, string | undefined, string][] = [
    ['https://localhost:3000/', '/', '/app-config.json?123'],
    ['https://localhost:3000/', '', '/app-config.json?123'],
    ['https://localhost:3000/', './', '/app-config.json?123'],
    ['https://localhost:3000', '/', '/app-config.json?123'],
    ['https://localhost:3000', '', '/app-config.json?123'],
    ['https://localhost:3000', './', '/app-config.json?123'],
    ['https://localhost:3000', undefined, '/app-config.json?123'],
    ['https://localhost:3000/', undefined, '/app-config.json?123'],
    ['https://localhost:3000/', 'https://localhost:3000/', '/app-config.json?123'],
    ['https://localhost:3000/', 'https://localhost:3000', '/app-config.json?123'],
    ['https://localhost:3000', 'https://localhost:3000/', '/app-config.json?123'],
    ['https://localhost:3000', 'https://localhost:3000', '/app-config.json?123'],
    // handle all the slashes with paths
    ['https://localhost:3000/path/to/app/', '/path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/', './', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/', 'path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/', 'path/to/app', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app', '/path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app', './', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app', 'path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app', 'path/to/app', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/', 'https://localhost:3000/path/to/app', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/', 'https://localhost:3000/path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app', 'https://localhost:3000/path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app', 'https://localhost:3000/path/to/app', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/', undefined, '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app', undefined, '/path/to/app/app-config.json?123'],
    // handle it all, but with the page on a different route than the baseUri
    ['https://localhost:3000/path/to/app/with/more/paths/', '/path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths/', './', '/path/to/app/with/more/paths/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths/', 'path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths/', 'path/to/app', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths', '/path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths', './', '/path/to/app/with/more/paths/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths', 'path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths', 'path/to/app', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths/', 'https://localhost:3000/path/to/app', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths/', 'https://localhost:3000/path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths', 'https://localhost:3000/path/to/app/', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths', 'https://localhost:3000/path/to/app', '/path/to/app/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths/', undefined, '/path/to/app/with/more/paths/app-config.json?123'],
    ['https://localhost:3000/path/to/app/with/more/paths', undefined, '/path/to/app/with/more/paths/app-config.json?123'],
    // handle paths with hash
    ['https://localhost:3000/#/', 'https://localhost:3000/#/', '/app-config.json?123'],
    ['https://localhost:3000/#/user', 'https://localhost:3000/#/user', '/app-config.json?123'],
    ['https://localhost:3000/user/#/', 'https://localhost:3000/user/#/', '/user/app-config.json?123'],
    // sometimes the trailing slash to the virtual directory is missing
    ['https://localhost:3000/user#/', 'https://localhost:3000/user#/', '/user/app-config.json?123'],
  ]

  describe('fetches app-config ', () => {
    it.each(testScenarios)(
      'and throws error due to syntax',
      async(href, baseUri, expected) => {
        try{
          global.fetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockImplementation(() => { throw "Invalid App Config Syntax"}),
          });
          patchLocation(`${href}#/hash/route`);
  
          expect(document.baseURI).toBeUndefined();
  
          if (typeof baseUri !== 'undefined') {
            const base = document.createElement('base');
            base.setAttribute('href', baseUri);
            document.head.appendChild(base);
          }
  
          const { getConfiguration } = require('./getConfiguration');
          const config = await getConfiguration();
  
          // should never happen
          expect(true).toBeFalsy()
        } catch(e){
          expect(global.fetch).toHaveBeenCalledTimes(1);
          expect(global.fetch).toHaveBeenLastCalledWith(expected);

          expect(e.message).toEqual('Invalid json in app-config.json');
          global.window.location = initLocation;
        }
      }
    );
  });

  describe('fetches app-config', () => {
    it.each(testScenarios)(
      `%s with baseUri of %s resolves an app-config at %s`,
      async (href, baseUri, expected) => {
        patchLocation(href);
        patchBaseUri(baseUri);

        expect(document.baseURI).toBe(baseUri);

        const { getConfiguration } = require('./getConfiguration');
        const config = await getConfiguration();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenLastCalledWith(expected);
        expect(config).toEqual({ config: true });
      }
    );
  });

  describe('fetches app-config with a hash route', () => {
    it.each(testScenarios)(
      `%s#/hash/route with baseUri of %s resolves an app-config at %s`,
      async(href, baseUri, expected) => {
        patchLocation(`${href}#/hash/route`);
        patchBaseUri(baseUri);

        expect(document.baseURI).toBe(baseUri);

        const { getConfiguration } = require('./getConfiguration');
        const config = await getConfiguration();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenLastCalledWith(expected);
        expect(config).toEqual({ config: true });
        global.window.location = initLocation;
      }
    );
  });

  describe('fetches app-config while setting baseUri through the base element', () => {
    it.each(testScenarios)(
      `%s with baseUri of %s resolves an app-config at %s`,
      async(href, baseUri, expected) => {
        patchLocation(`${href}#/hash/route`);

        expect(document.baseURI).toBeUndefined();

        if (typeof baseUri !== 'undefined') {
          const base = document.createElement('base');
          base.setAttribute('href', baseUri);
          document.head.appendChild(base);
        }

        const { getConfiguration } = require('./getConfiguration');
        const config = await getConfiguration();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenLastCalledWith(expected);
        expect(config).toEqual({ config: true });
        global.window.location = initLocation;
      }
    );
  });


})