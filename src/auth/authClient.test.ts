jest.mock('jwt-decode', () => jest.fn());
jest.mock('@okta/okta-auth-js', () => {
  const getWithRedirectMock = jest.fn();
  const renewMock = jest.fn();
  const parseUrlMock = jest.fn();
  const signOutMock = jest.fn();
  const existsMock = jest.fn();
  const addMock = jest.fn();
  const setTokensMock = jest.fn();
  const getTokenMock = jest.fn();
  const getMock = jest.fn();
  const onMock = jest.fn();
  const getWithoutPromptMock = jest.fn();

  return {
    OktaAuth: class {
      options = {
        redirectUri : 'state=%2f'
      };
      session = {
        exists: existsMock,
        get: getMock,
      };
      token = {
        getWithoutPrompt: getWithoutPromptMock,
        getWithRedirect: getWithRedirectMock,
        parseFromUrl: parseUrlMock,
      };
      tokenManager = {
        add: addMock,
        setTokens: setTokensMock,
        renew: renewMock,
        get: getTokenMock,
        on: onMock,
      };
      signOut = signOutMock;
    }
  };
});

import * as utils from './utils';
import { AccessToken, IDToken, OktaAuth } from '@okta/okta-auth-js';
import createClient , { AuthClient, OAuthConfig, QueryParams } from './authClient';
import { create } from 'domain';


describe('authClient tests', () => {
  let testOktaConfig: OAuthConfig;
  let oauth: jest.Mock<OktaAuth>;
  let authClient: AuthClient;

  beforeEach(() => {
    oauth = require('@okta/okta-auth-js').OktaAuth; 
    testOktaConfig = {
      oAuthClientId: 'testId',
      oAuthDomain: 'http://test.com',
      redirectUri: 'testRedirectUrl',
      scopes: ['profile'],
    } as OAuthConfig;
    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        href: 'https://localhost',
        pathname: 'no_token',
        assign: jest.fn(),
        replace: jest.fn(),
      },
      writable: true,
    });
  });

  describe('construction', () => {
    it('creates client', () => {
      jest.spyOn(utils, 'getRedirectUrl').mockReturnValue('some-url');
      const client = createClient(testOktaConfig);
      expect(client).not.toBeNull();
      expect(client).toHaveProperty('login')
    });

    it('creates client with tokens', () =>{
      const accessToken = {
        scopes: ['profile'],
        expiresAt: 234,
        accessToken: 'testToken',
        idToken: 'testToken',
      };
    
      const idToken = {
        scopes: ['profile'],
        expiresAt: 542,
        accessToken: 'testIdentityToken',
        idToken: 'testIdToken',
      };

      const mock = new oauth();

      const client = createClient(testOktaConfig, accessToken, idToken);
      expect(mock.tokenManager.setTokens).toHaveBeenCalledWith({accessToken: accessToken, idToken: idToken });
    });

    it('calls on function and the on function should renew a token', async () => {
      const mock = new oauth();
      const client = createClient(testOktaConfig);
      (<jest.Mock>mock.tokenManager.renew).mockResolvedValue('done');

      expect(mock.tokenManager.on).toHaveBeenCalled();
      let fn = (<jest.Mock>mock.tokenManager.on).mock.calls[0][1];
      await fn('testkey');
      expect(mock.tokenManager.renew).toHaveBeenCalled();
    });

    it('calls on function and the on function should throw error if renew errors', async () => {
      const mock = new oauth();
      const client = createClient(testOktaConfig);
      (<jest.Mock>mock.tokenManager.renew).mockRejectedValue('done');

      expect(mock.tokenManager.on).toHaveBeenCalled();
      let fn = (<jest.Mock>mock.tokenManager.on).mock.calls[0][1];
      expect(fn('testkey')).rejects.toBeTruthy();
    });

    it('should throw error if config parameter is undefined', () => {
      const testOktaConfig = undefined as unknown as OktaConfig;
      expect(() => createClient(testOktaConfig)).toThrowError('missing configuration');
    });

    it('should throw error if invalid access token is supplied on construction', () => {
      const accessToken = {
        scopes: ['profile'],
        expiresAt: 234,
        accessToken: 'testToken',
        idToken: 'testToken',
      };
    
      const idToken = {
        scopes: ['profile'],
        expiresAt: 542,
        accessToken: 'testIdentityToken',
        idToken: 'testIdToken',
      };

      const mock = new oauth();

      (<jest.Mock>mock.tokenManager.setTokens).mockImplementation(() => {
        throw new Error('failed to add tokens');
      });
    
      expect(() => createClient(testOktaConfig, accessToken, idToken)).toThrowError('failed to add tokens');
    });
  });

  describe('methods and properties', () => {
    const testToken = {accessToken: 'test', idToken: 'test'}

    beforeEach(() => {
      jest.resetAllMocks();

      authClient = createClient(testOktaConfig);
    });

    it('logout throws error when logout redirect url is null', async () => {
      const queryParams = {
        post_logout_redirect_uri: undefined,
      } as unknown as QueryParams
      await expect(authClient.logout(queryParams))
      .rejects.toThrowError('Please specify queryParams.post_logout_redirect_url so we can redirect')
    });

    it('logout calls okta signout, clears jwt, and updates window', async () => {
      const queryParams = {
        post_logout_redirect_uri: 'some redirect url',
      } as unknown as QueryParams
      jest.spyOn(utils, 'clearStoredJwt');
      const mock = new oauth();
      await authClient.logout(queryParams);
      expect(mock.signOut).toHaveBeenCalled();
      expect(utils.clearStoredJwt).toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith(queryParams.post_logout_redirect_uri);
    });

    it('login calls okta getWithRedriect, sets state session', async () => {
      jest.spyOn(utils, 'setStateSession').mockImplementation(() => {
        return 'state session';
      });
      const mock = new oauth();
      await authClient.login();
      expect(mock.token.getWithRedirect).toHaveBeenCalledWith({
        scopes: ['openid','email','profile'],
        state: 'state session'
      });
      expect(utils.setStateSession).toHaveBeenCalledTimes(1);
    });

    it('getIdentity calls tokenManager.get and decodes response', async () => {
      const decode = require('jwt-decode');
      decode.mockImplementation(() => {return 'testToken'});
      const idToken = { 
        idToken: 'test'
      } as IDToken
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValue(idToken);
      const result = await authClient.getIdentity();
      expect(result).toBe('testToken');
      expect(decode).toHaveBeenCalledTimes(1);
      expect(mock.tokenManager.get).toHaveBeenCalledTimes(1);
    });

    it('getAccessToken calls tokenManager.get and returns token', async () => {
      const accessToken = { 
        accessToken: 'test'
      } as AccessToken
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValue(accessToken);
      const result = await authClient.getAccessToken();
      expect(result).toBe(accessToken.accessToken);
      expect(mock.tokenManager.get).toHaveBeenCalledTimes(1);
    });

    it('getIdentityToken calls tokenManager.get and returns token', async () => {
      const idToken = { 
        idToken: 'test'
      } as IDToken
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValue(idToken);
      const result = await authClient.getIdentityToken();
      expect(result).toBe(idToken.idToken);
      expect(mock.tokenManager.get).toHaveBeenCalledTimes(1);
    });

    it('ensureAuthed gets tokens from token manager when code token is not in query', async () => {
      const accessToken = {
        accessToken: 'test access token'
      } as AccessToken;
      const idToken = { 
        idToken: 'test identity token',
        claims: {}
      } as IDToken
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(accessToken);
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(idToken);
      const result = await authClient.ensureAuthed();
      expect(result).not.toBeNull();
      expect(result.accessToken).toBe(accessToken.accessToken);
      expect(result.identityToken).toBe(idToken.idToken);
      expect(result.identity).toBe(idToken.claims);
      expect(mock.tokenManager.get).toHaveBeenCalledTimes(2);
    });

    it('ensureAuthed gets tokens from session when code token is not in query or in local storage', async () => {
      const idToken = { 
        idToken: 'test identity token',
        claims: {
          iss: 'test'
        }
      } as IDToken
      const session = {
        status: 'ACTIVE',
        id: 1232
      }
      const tokens = {
        tokens:{
          accessToken:{
            accessToken: 'test session access token'
          },
          idToken:{
            idToken: 'test session identity token',
            claims: {
              iss:'sesssion iis'
            }
          }
        }
      }
      jest.spyOn(utils, 'setRetry').mockImplementation();
      jest.spyOn(utils, 'getRetry').mockReturnValue("1");
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(undefined);
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(idToken);
      (<jest.Mock>mock.session.exists).mockResolvedValueOnce(true);
      (<jest.Mock>mock.session.get).mockResolvedValueOnce(session);
      (<jest.Mock>mock.token.getWithoutPrompt).mockResolvedValueOnce(tokens);
      const result = await authClient.ensureAuthed();
      expect(result).not.toBeNull();
      expect(result.accessToken).toBe(tokens.tokens.accessToken.accessToken);
      expect(result.identityToken).toBe(tokens.tokens.idToken.idToken);
      expect(result.identity).toBe(tokens.tokens.idToken.claims);
      expect(mock.tokenManager.get).toHaveBeenCalledTimes(2);
      expect(mock.session.exists).toHaveBeenCalledTimes(1);
      expect(mock.session.get).toHaveBeenCalledTimes(1);
      expect(mock.token.getWithoutPrompt).toHaveBeenCalledWith({
        scopes: testOktaConfig.scopes,
        responseType: ['token', 'id_token'],
        sessionToken: session.id,
      });
    });

    it('ensureAuthed throws when session isn\'t active', async () => {
      const idToken = { 
        idToken: 'test identity token',
        claims: {
          iss: 'test'
        }
      } as IDToken
      const session = {
        id: 1232
      }
      const tokens = {
        tokens:{
          accessToken:{
            accessToken: 'test session access token'
          },
          idToken:{
            idToken: 'test session identity token',
            claims: {
              iss:'sesssion iis'
            }
          }
        }
      }
      jest.spyOn(utils, 'setRetry').mockImplementation();
      jest.spyOn(utils, 'getRetry').mockReturnValue("1");
      jest.spyOn(authClient, 'login');
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(undefined);
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(idToken);
      (<jest.Mock>mock.session.exists).mockResolvedValueOnce(true);
      (<jest.Mock>mock.session.get).mockResolvedValueOnce(session);
      (<jest.Mock>mock.token.getWithoutPrompt).mockResolvedValueOnce(tokens);
      await expect(authClient.ensureAuthed())
        .rejects.toThrowError('no token in query and session is not active');
      expect(authClient.login).toHaveBeenCalledTimes(1);
    });

    it('ensureAuthed throws when session doesn\'t exist', async () => {
      const idToken = { 
        idToken: 'test identity token',
        claims: {
          iss: 'test'
        }
      } as IDToken
      const session = {
        id: 1232
      }
      const tokens = {
        tokens:{
          accessToken:{
            accessToken: 'test session access token'
          },
          idToken:{
            idToken: 'test session identity token',
            claims: {
              iss:'sesssion iis'
            }
          }
        }
      }
      jest.spyOn(utils, 'setRetry').mockImplementation();
      jest.spyOn(utils, 'getRetry').mockReturnValue("1");
      jest.spyOn(authClient, 'login');
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(undefined);
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(idToken);
      (<jest.Mock>mock.session.exists).mockResolvedValueOnce(false);
      (<jest.Mock>mock.session.get).mockResolvedValueOnce(session);
      (<jest.Mock>mock.token.getWithoutPrompt).mockResolvedValueOnce(tokens);
      await expect(authClient.ensureAuthed())
        .rejects.toThrowError('no token in query and session did not exist');
      expect(authClient.login).toHaveBeenCalledTimes(1);
    });

    it('ensureAuthed throws maximum retry error when session doesn\'t exist and there are 3 retrys', async () => {
      const idToken = { 
        idToken: 'test identity token',
        claims: {
          iss: 'test'
        }
      } as IDToken
      const session = {
        id: 1232
      }
      const tokens = {
        tokens:{
          accessToken:{
            accessToken: 'test session access token'
          },
          idToken:{
            idToken: 'test session identity token',
            claims: {
              iss:'sesssion iis'
            }
          }
        }
      }
      jest.spyOn(utils, 'setRetry').mockImplementation();
      jest.spyOn(utils, 'getRetry').mockReturnValue("3");
      jest.spyOn(authClient, 'login');
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(undefined);
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(idToken);
      (<jest.Mock>mock.session.exists).mockResolvedValueOnce(false);
      (<jest.Mock>mock.session.get).mockResolvedValueOnce(session);
      (<jest.Mock>mock.token.getWithoutPrompt).mockResolvedValueOnce(tokens);
      await expect(authClient.ensureAuthed())
        .rejects.toThrowError('exceed maximum retrys. Error: no token in query and session did not exist');
      expect(authClient.login).not.toHaveBeenCalled();
    });

    it('ensureAuthed gets tokens from query string', async () => {
      window.location.href = 'https://test-login?code=ajdduudfah2'
      const idToken = { 
        idToken: 'test identity token',
        claims: {
          iss: 'test'
        }
      } as IDToken
      const session = {
        status: 'ACTIVE',
        id: 1232
      }
      const tokens = {
        tokens:{
          accessToken:{
            accessToken: 'test session access token'
          },
          idToken:{
            idToken: 'test session identity token',
            claims: {
              iss:'sesssion iis'
            }
          }
        }
      }
      jest.spyOn(utils, 'setRetry').mockImplementation();
      jest.spyOn(utils, 'getRetry').mockReturnValue("1");
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(undefined);
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(idToken);
      (<jest.Mock>mock.session.exists).mockResolvedValueOnce(true);
      (<jest.Mock>mock.session.get).mockResolvedValueOnce(session);
      (<jest.Mock><unknown>mock.token.parseFromUrl).mockResolvedValueOnce(tokens);
      const result = await authClient.ensureAuthed();
      expect(result).not.toBeNull();
      expect(result.accessToken).toBe(tokens.tokens.accessToken.accessToken);
      expect(result.identityToken).toBe(tokens.tokens.idToken.idToken);
      expect(result.identity).toBe(tokens.tokens.idToken.claims);
      expect(mock.tokenManager.get).not.toHaveBeenCalled();
      expect(mock.tokenManager.add).toHaveBeenCalledTimes(2);
      expect(mock.session.exists).not.toHaveBeenCalled();
      expect(mock.session.get).not.toHaveBeenCalled();
      expect(mock.token.parseFromUrl).toHaveBeenCalledTimes(1);
    });

    it('ensureAuthed gets tokens from query string throws when parsing', async () => {
      window.location.href = 'https://test-login?code=ajdduudfah2'
      const idToken = { 
        idToken: 'test identity token',
        claims: {
          iss: 'test'
        }
      } as IDToken
      const session = {
        status: 'ACTIVE',
        id: 1232
      }
      const tokens = {
        tokens:{
          accessToken:{
            accessToken: 'test session access token'
          },
          idToken:{
            idToken: 'test session identity token',
            claims: {
              iss:'sesssion iis'
            }
          }
        }
      }
      jest.spyOn(utils, 'setRetry').mockImplementation();
      jest.spyOn(utils, 'getRetry').mockReturnValue("1");
      const mock = new oauth();
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(undefined);
      (<jest.Mock>mock.tokenManager.get).mockResolvedValueOnce(idToken);
      (<jest.Mock>mock.session.exists).mockResolvedValueOnce(true);
      (<jest.Mock>mock.session.get).mockResolvedValueOnce(session);
      (<jest.Mock><unknown>mock.token.parseFromUrl).mockRejectedValueOnce(tokens);
      await expect(authClient.ensureAuthed())
      .rejects.toThrowError('failed to parse token from url');
    });

    it('onRenewed idToken event calls callback funciton', async () => {
      const idToken = 'testToken';
      const mock = new oauth;

      authClient.getAccessToken = jest.fn().mockResolvedValue('testAccessToken');
      const testCallBack = jest.fn();

      authClient.onRenewed(testCallBack);

      let fn = (<jest.Mock>mock.tokenManager.on).mock.calls[1][1];
      await fn('idToken', {idToken});

      expect(testCallBack).toHaveBeenCalledWith('testAccessToken', idToken);
    });

    it('onRenewed accessToken event calls callback funciton', async () => {
      const accessToken = 'testToken';
      const mock = new oauth;

      authClient.getIdentityToken = jest.fn().mockResolvedValue('testIdToken');
      const testCallBack = jest.fn();

      authClient.onRenewed(testCallBack);

      let fn = (<jest.Mock>mock.tokenManager.on).mock.calls[1][1];
      await fn('accessToken', {accessToken});

      expect(testCallBack).toHaveBeenCalledWith(accessToken, 'testIdToken');
    });
  });
});