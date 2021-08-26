import { localStorageAuthKey } from '../constants';
import { clearStoredJwt, decodeExpirationTime, getRedirectUrl, getRetry, isAuthed, isExpired, isStoredTokenValidForOkta, isValidToken, removeRetry, setRedirectUrl, setRetry, setStateSession, storeJwt } from './utils';
import jwt from 'jsonwebtoken'
import { AuthData } from './authClient';

describe('utils tests', () => {
  it('getRetry gets retry token from local storage', () => {
    const retryToken = 'retry token'
    const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => {
      return retryToken;
    });

    const result = getRetry('key');

    expect(mockedLocalStorageGetItem).toHaveBeenCalledTimes(1);
    expect(result).toBe(retryToken);
  });

  it('setRetry sets retry token in local storage', () => {
    const retryToken = 'retry token'
    const mockedLocalStorageSetItem = jest.spyOn(global.Storage.prototype,'setItem').mockImplementation();

    setRetry(retryToken, 1);

    expect(mockedLocalStorageSetItem).toHaveBeenCalledWith(retryToken, "1");
  });

  it('setStateSession sets session key in local storage', () => {
    const path = 'testpath.com'
    const mockedLocalStorageSetItem = jest.spyOn(global.Storage.prototype,'setItem').mockImplementation();

    setStateSession(path);

    expect(mockedLocalStorageSetItem).toHaveBeenCalledTimes(1);
  });

  it('setRedirectUrl', () => {
    const baseUri = 'https://test.com/#/';
    delete window.location;
    window.location = {
      href:'https://test.com/#/some-route',
    };
    Object.defineProperty(global.window.document, 'baseURI', {
      writable: true,
      value: baseUri,
    });
    const mockedLocalStorageSetItem = jest.spyOn(global.Storage.prototype,'setItem').mockImplementation();

    setRedirectUrl();
    expect(mockedLocalStorageSetItem).toHaveBeenCalledTimes(1);
  });

  it('getRedirectUrl getItem returns nothing', () => {
    const baseUri = 'https://test.com/#/';
    Object.defineProperty(global.window.document, 'baseURI', {
      writable: true,
      value: baseUri,
    });
    const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation();

    const results = getRedirectUrl();
    expect(mockedLocalStorageGetItem).toHaveBeenCalledTimes(1);
    expect(results).toBe(baseUri);
  });

  it('getRedirectUrl getItem returns urk', () => {
    const baseUri = 'https://test.com/#/';
    const storedUrl = 'https://storedtest.com/#/'
    Object.defineProperty(global.window.document, 'baseURI', {
      writable: true,
      value: baseUri,
    });
    const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => {
      return storedUrl;
    });

    const results = getRedirectUrl();
    expect(mockedLocalStorageGetItem).toHaveBeenCalledTimes(1);
    expect(results).toBe(storedUrl);
  });

  it('removeRetry calls removeItem', () => {
    const mockedLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype,'removeItem').mockImplementation();
    removeRetry('key');
    expect(mockedLocalStorageRemoveItem).toHaveBeenCalledWith('key');
  })

  it('storeJwt saves jwt to local storage token', () => {
    const accessToken = 'mockAccessToken';
    const identityToken = 'mockIdentityToken';
    const mockLocalStorageSetItem = jest.spyOn(global.Storage.prototype, 'setItem').mockImplementation();
    storeJwt(accessToken, identityToken);
    expect(mockLocalStorageSetItem).toHaveBeenLastCalledWith(localStorageAuthKey, JSON.stringify({accessToken, identityToken}));
  })

  it('clearStoredJwt clears out local storage auth key', () => {
    const mockLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype, 'removeItem').mockImplementation();
    clearStoredJwt();
    expect(mockLocalStorageRemoveItem).toHaveBeenCalledWith(localStorageAuthKey);
  })

  it('isAuthed returns true when token exists and is valid', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const authData = {
      accessToken: 'valid token'
    } as AuthData
    const payload = {
      exp: date,
    } as jwt.JwtPayload
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => { return JSON.stringify(authData)});

    const result = isAuthed();

    expect(result).toBe(true);
    expect(decodeSpy).toHaveBeenCalledWith('valid token',{"json": true});
    expect(mockedLocalStorageGetItem).toHaveBeenCalledWith(localStorageAuthKey);
  });

  it('isAuthed returns false when token exists and is invalid', () => {
    const authData = {
      accessToken: 'valid token'
    } as AuthData
    const payload = {
      exp: 12232,
    } as jwt.JwtPayload
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => { return JSON.stringify(authData)});

    const result = isAuthed();

    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledWith('valid token',{"json": true});
    expect(mockedLocalStorageGetItem).toHaveBeenCalledWith(localStorageAuthKey);
  });

  it('isAuthed returns false when token is null', () => {
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation();
    const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => { return null;});

    const result = isAuthed();

    expect(result).toBe(false);
    expect(decodeSpy).not.toHaveBeenCalled();
    expect(mockedLocalStorageGetItem).toHaveBeenCalledWith(localStorageAuthKey);
  });

  it('isStoredTokenValidForOkta returns true with valid token', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      exp: date,
      iss: issuer,
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(true);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  });

  it('isStoredTokenValidForOkta returns false when no auth data is passed in', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {} as AuthData
    const payload = {
      exp: date,
      iss: issuer,
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).not.toHaveBeenCalled();
  });

  it('isStoredTokenValidForOkta returns false when access token is empty', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: '',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      exp: date,
      iss: issuer,
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).not.toHaveBeenCalled();
  });

  it('isStoredTokenValidForOkta returns false when identity token is empty', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: ''
    } as AuthData
    const payload = {
      exp: date,
      iss: issuer,
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).not.toHaveBeenCalled();
  });

  it('isStoredTokenValidForOkta returns false when there is no payload is decoded', () => {
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return undefined});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  });

  it('isStoredTokenValidForOkta returns false when there is no issuer on payload', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      exp: date,
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  }); 

  it('isStoredTokenValidForOkta returns false when no issuer is passed in', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      exp: date,
      iss: issuer,
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, undefined);
    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  }); 

  it('isStoredTokenValidForOkta returns false when no payload issuer doesn\'t match what is passed in', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      exp: date,
      iss: "differntIssuer",
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  }); 

  it('isStoredTokenValidForOkta returns false when no exp is on payload', () => {

    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      iss: "differntIssuer",
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  }); 

  it('isStoredTokenValidForOkta returns false when exp is expired', () => {
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      exp: 1223,
      iss: "differntIssuer",
      scp: 'profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  }); 

  it('isStoredTokenValidForOkta returns false when no scope is on payload', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      exp: date,
      iss: "differntIssuer",
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  }); 
  
  it('isStoredTokenValidForOkta returns false when scope doesn\'t have profile ', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const issuer = "http://issuer.com"
    const authData = {
      accessToken: 'access token',
      identityToken: 'identity token'
    } as AuthData
    const payload = {
      exp: date,
      iss: "differntIssuer",
      scp: 'not profile'
    } as jwt.JwtPayload

    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});
    const result = isStoredTokenValidForOkta(authData, issuer);
    expect(result).toBe(false);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  }); 

  it('isExpired returns false when date is after now', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const result = isExpired(date);
    expect(result).toBe(false);
  });

  it('isExpired returns true when date is before now', () => {
    const date = 12322;
    const result = isExpired(date);
    expect(result).toBe(true);
  });

  it('decodeExpirationTime returns token when token is decoded', () => {
    const testToken = 'test token';
    const payload = {
      exp: 12232,
    } as jwt.JwtPayload
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});

    const result = decodeExpirationTime(testToken);
    expect(decodeSpy).toHaveBeenCalledWith(testToken, {"json": true});
    expect(result).toBe(payload.exp)
  });

  it('decodeExpirationTime returns null when nothing is decoded', () => {
    const testToken = 'test token';
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return null});

    const result = decodeExpirationTime(testToken);
    expect(decodeSpy).toHaveBeenCalledWith(testToken, {"json": true});
    expect(result).toBe(null)
  });

  it('isValidToken returns true when decoded and not expired', () => {
    const date = new Date().setHours(new Date().getHours()+2);
    const authData = {
      accessToken: 'valid token'
    } as AuthData
    const payload = {
      exp: date,
    } as jwt.JwtPayload
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});

    const result = isValidToken(authData);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('isValidToken returns false when decoded and has expired', () => {
    const authData = {
      accessToken: 'valid token'
    } as AuthData
    const payload = {
      exp: 12322,
    } as jwt.JwtPayload
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return payload});

    const result = isValidToken(authData);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('isValidToken returns false when decoded returns null', () => {
    const authData = {
      accessToken: 'valid token'
    } as AuthData
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {return null});

    const result = isValidToken(authData);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('isValidToken returns false when decoded throws error', () => {
    const authData = {
      accessToken: 'valid token'
    } as AuthData
    const decodeSpy = jest.spyOn(jwt, 'decode').mockImplementation((token, options) => {throw new Error()});

    const result = isValidToken(authData);
    expect(decodeSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });
});