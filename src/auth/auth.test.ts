import { AuthClient, RenewTokenResult } from './authClient';
import * as util from './utils';
import { authenticate } from './auth';

const mockEnsureAuthed = jest.fn();

jest.mock('./authClient', () => () => ({
  ensureAuthed: mockEnsureAuthed,
  login: jest.fn(),
  logout: jest.fn(),
  getIdentity: jest.fn(),
  getAccessToken: jest.fn(),
  getIdentityToken: jest.fn(),
  onRenewed: jest.fn()
}as AuthClient))

describe('authenticate tests', () => {
  const config = { 
    oAuthDomain: "http://testdomain.com",
  } as AppConfig

  delete window.location;
  window.location = {
    href: 'https://test.com/#/auth?code=!Jd93921gdcsa_adaer.daored'
  };

  const renewTokenResultMock = {
    accessToken: 'access token',
    identityToken: 'identity token',
  } as RenewTokenResult



  it('authenticate clears token from local storage when it exists in url. No token exists in storage', async () => {
    mockEnsureAuthed.mockImplementation(() => { return renewTokenResultMock; });
    const clearStoredJwtMock = jest.spyOn(util, 'clearStoredJwt').mockImplementation();
    const storeJwtMock = jest.spyOn(util, 'storeJwt').mockImplementation();
    const isAuthedMock = jest.spyOn(util, 'isAuthed').mockImplementation(() => { return true });
    const decodeExpirationTimeMock = jest.spyOn(util, 'decodeExpirationTime').mockImplementation();
    const isStoredTokenValidForOktaMock = jest.spyOn(util, 'isStoredTokenValidForOkta').mockImplementation(() => { return false; });
    const localStorageGetItemMock = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation();

    const { authenticated, error, authClient } =  await authenticate(config);
    expect(authenticated).toBe(true);
    expect(error).toBe(null);
    expect(authClient).not.toBeNull();
    expect(clearStoredJwtMock).toHaveBeenCalledTimes(2);
    expect(storeJwtMock).toHaveBeenCalledTimes(1);
    expect(localStorageGetItemMock).toHaveBeenCalledTimes(1);
    expect(decodeExpirationTimeMock).not.toHaveBeenCalled();
    expect(isStoredTokenValidForOktaMock).toHaveBeenCalledTimes(1);
    expect(isAuthedMock).not.toHaveBeenCalled();
    expect(mockEnsureAuthed).toHaveBeenCalledTimes(1);
  });

  it('authenticate clears token from local storage when it after ensureAuthed is called No token exists in storage', async () => {
    const storedJwt = {
      accessToken : 'accesstoken',
      identityToken: 'identityToken'
    }
    mockEnsureAuthed.mockImplementation(() => { return renewTokenResultMock; });
    const clearStoredJwtMock = jest.spyOn(util, 'clearStoredJwt').mockImplementation();
    const storeJwtMock = jest.spyOn(util, 'storeJwt').mockImplementation();
    const isAuthedMock = jest.spyOn(util, 'isAuthed').mockImplementation(() => { return true });
    const decodeExpirationTimeMock = jest.spyOn(util, 'decodeExpirationTime').mockImplementation(() => {return 1232 });
    const isStoredTokenValidForOktaMock = jest.spyOn(util, 'isStoredTokenValidForOkta').mockImplementation(() => { return true; });
    const localStorageGetItemMock = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => { return JSON.stringify(storedJwt)});

    const { authenticated, error, authClient } =  await authenticate(config);
    expect(authenticated).toBe(true);
    expect(error).toBe(null);
    expect(authClient).not.toBeNull();
    expect(clearStoredJwtMock).toHaveBeenCalledTimes(1);
    expect(storeJwtMock).toHaveBeenCalledTimes(1);
    expect(localStorageGetItemMock).toHaveBeenCalledTimes(1);
    expect(decodeExpirationTimeMock).toHaveBeenCalledTimes(2);
    expect(isStoredTokenValidForOktaMock).toHaveBeenCalledTimes(1);
    expect(isAuthedMock).not.toHaveBeenCalled();
    expect(mockEnsureAuthed).toHaveBeenCalledTimes(1);
  });

  it('authenticate clears local storage and returns authenticated false when isAuthed is false and token is not in url', async () => {
    window.location.href = '/';
    mockEnsureAuthed.mockImplementation(() => { return renewTokenResultMock; });
    const clearStoredJwtMock = jest.spyOn(util, 'clearStoredJwt').mockImplementation();
    const storeJwtMock = jest.spyOn(util, 'storeJwt').mockImplementation();
    const decodeExpirationTimeMock = jest.spyOn(util, 'decodeExpirationTime').mockImplementation();
    const isAuthedMock = jest.spyOn(util, 'isAuthed').mockImplementation(() => { return false });
    const isStoredTokenValidForOktaMock = jest.spyOn(util, 'isStoredTokenValidForOkta').mockImplementation(() => { return false; });
    const localStorageGetItemMock = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation();

    const { authenticated, error, authClient } =  await authenticate(config);
    expect(authenticated).toBe(false);
    expect(error).toBe(null);
    expect(authClient).not.toBeNull();
    expect(clearStoredJwtMock).toHaveBeenCalledTimes(1);
    expect(storeJwtMock).not.toHaveBeenCalled();
    expect(localStorageGetItemMock).toHaveBeenCalledTimes(1);
    expect(decodeExpirationTimeMock).not.toHaveBeenCalled();
    expect(isStoredTokenValidForOktaMock).toHaveBeenCalledTimes(1);
    expect(isAuthedMock).toHaveBeenCalledTimes(1);
    expect(mockEnsureAuthed).not.toHaveBeenCalled();
  });

  it('authenticate clears local storage and returns authenticated true when isAuthed is true and token is not in url', async () => {
    window.location.href = '/';
    mockEnsureAuthed.mockImplementation(() => { return renewTokenResultMock; });
    const clearStoredJwtMock = jest.spyOn(util, 'clearStoredJwt').mockImplementation();
    const storeJwtMock = jest.spyOn(util, 'storeJwt').mockImplementation();
    const decodeExpirationTimeMock = jest.spyOn(util, 'decodeExpirationTime').mockImplementation();
    const isAuthedMock = jest.spyOn(util, 'isAuthed').mockImplementation(() => { return true });
    const isStoredTokenValidForOktaMock = jest.spyOn(util, 'isStoredTokenValidForOkta').mockImplementation(() => { return false; });
    const localStorageGetItemMock = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation();

    const { authenticated, error, authClient } =  await authenticate(config);
    expect(authenticated).toBe(true);
    expect(error).toBe(null);
    expect(authClient).not.toBeNull();
    expect(clearStoredJwtMock).toHaveBeenCalledTimes(1);
    expect(storeJwtMock).toHaveBeenCalledTimes(1);
    expect(localStorageGetItemMock).toHaveBeenCalledTimes(1);
    expect(decodeExpirationTimeMock).not.toHaveBeenCalled();
    expect(isStoredTokenValidForOktaMock).toHaveBeenCalledTimes(1);
    expect(isAuthedMock).toHaveBeenCalledTimes(1);
    expect(mockEnsureAuthed).toHaveBeenCalledTimes(1);
  });

  it('authenticate clears local storage and returns authenticated false with error when ensureAuthed throws', async () => {
    window.location.href = '/';
    mockEnsureAuthed.mockImplementation(() => { return null; });
    const clearStoredJwtMock = jest.spyOn(util, 'clearStoredJwt').mockImplementation();
    const storeJwtMock = jest.spyOn(util, 'storeJwt').mockImplementation();
    const decodeExpirationTimeMock = jest.spyOn(util, 'decodeExpirationTime').mockImplementation();
    const isAuthedMock = jest.spyOn(util, 'isAuthed').mockImplementation(() => { return true });
    const isStoredTokenValidForOktaMock = jest.spyOn(util, 'isStoredTokenValidForOkta').mockImplementation(() => { return false; });
    const localStorageGetItemMock = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation();

    const { authenticated, error, authClient } =  await authenticate(config);
    expect(authenticated).toBe(false);
    expect(error).not.toBe(null);
    expect(error.message).toBe('Cannot read property \'accessToken\' of null')
    expect(authClient).not.toBeNull();
    expect(clearStoredJwtMock).toHaveBeenCalledTimes(1);
    expect(storeJwtMock).not.toHaveBeenCalled();
    expect(localStorageGetItemMock).toHaveBeenCalledTimes(1);
    expect(decodeExpirationTimeMock).not.toHaveBeenCalled();
    expect(isStoredTokenValidForOktaMock).toHaveBeenCalledTimes(1);
    expect(isAuthedMock).toHaveBeenCalledTimes(1);
    expect(mockEnsureAuthed).toHaveBeenCalledTimes(1);
  });
})
