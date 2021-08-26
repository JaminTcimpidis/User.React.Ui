import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { AuthClient, RenewTokenResult } from '../auth/authClient';
import { AuthContext } from '../auth/authContext';
import * as authUtils from '../auth/utils';
import { useAuth } from './useAuth';

describe('useAuth hook tests', () =>{
  const mockAuthContext = { 
    ensureAuthed: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getIdentity: jest.fn(),
    getAccessToken: jest.fn(),
    getIdentityToken: jest.fn(),
    onRenewed: jest.fn() 
  } as AuthClient

  const wrapper = ({ children }) => {
    return (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );
  }

  let replaceMock = jest.fn();
  delete window.location;
  window.location = {replace: replaceMock};
  window.location.href = 'https://test.com/#/';

  describe('isAuthed tests', () => {
    it('Returnes true when utils isAuthed is true', () => {
      const mockedUtilsIsAuthed = jest.spyOn(authUtils, 'isAuthed').mockImplementation(() => {return true;});
      const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => {return null});
      const mockedUtilsIsValidToken = jest.spyOn(authUtils, 'isValidToken').mockImplementation(() => {return true});
      const mockedUtilsStoreJwt = jest.spyOn(authUtils, 'storeJwt').mockImplementation();
      const mockedLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype,'removeItem');
      const hook = renderHook(() => useAuth(), { wrapper });
      const result = hook.result.current.isAuthed();
  
      expect(result).toBe(true);
      expect(mockedUtilsIsAuthed).toHaveBeenCalledTimes(1);
      expect(mockedLocalStorageGetItem).not.toHaveBeenCalled();
      expect(mockedLocalStorageRemoveItem).not.toHaveBeenCalled();
      expect(mockedUtilsIsValidToken).not.toHaveBeenCalled();
      expect(mockedUtilsStoreJwt).not.toHaveBeenCalled();
    });
  
    it('Returnes false when utils isAuthed is false and no token exists', () => {
      const mockedUtilsIsAuthed = jest.spyOn(authUtils, 'isAuthed').mockImplementation(() => {return false;});
      const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => {return null});
      const mockedUtilsIsValidToken = jest.spyOn(authUtils, 'isValidToken').mockImplementation(() => {return true});
      const mockedUtilsStoreJwt = jest.spyOn(authUtils, 'storeJwt').mockImplementation();
      const mockedLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype,'removeItem');
      const hook = renderHook(() => useAuth(), { wrapper });
      const result = hook.result.current.isAuthed();
  
      expect(result).toBe(false);
      expect(mockedUtilsIsAuthed).toHaveBeenCalledTimes(1);
      expect(mockedLocalStorageGetItem).toHaveBeenCalledTimes(1);
      expect(mockedLocalStorageRemoveItem).not.toHaveBeenCalled();
      expect(mockedUtilsIsValidToken).not.toHaveBeenCalled();
      expect(mockedUtilsStoreJwt).not.toHaveBeenCalled();
    });
  
    it('Returnes false when utils isAuthed is false and token exists but is not valid', () => {
      const token = {
        accessToken: 'testAccessToken',
        identityToken: 'testToken',
      }
      const mockedUtilsIsAuthed = jest.spyOn(authUtils, 'isAuthed').mockImplementation(() => {return false;});
      const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => {return JSON.stringify(token)});
      const mockedLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype,'removeItem');
      const mockedUtilsIsValidToken = jest.spyOn(authUtils, 'isValidToken').mockImplementation(() => {return false});
      const mockedUtilsStoreJwt = jest.spyOn(authUtils, 'storeJwt').mockImplementation();
      const hook = renderHook(() => useAuth(), { wrapper });
      const result = hook.result.current.isAuthed();
  
      expect(result).toBe(false);
      expect(mockedUtilsIsAuthed).toHaveBeenCalledTimes(1);
      expect(mockedLocalStorageGetItem).toHaveBeenCalledTimes(1);
      expect(mockedLocalStorageRemoveItem).not.toHaveBeenCalled();
      expect(mockedUtilsIsValidToken).toHaveBeenCalledTimes(1);
      expect(mockedUtilsStoreJwt).not.toHaveBeenCalled();
    });
  
    it('Returnes true when utils isAuthed is false and token exists and is valid', () => {
      const token = {
        accessToken: 'testAccessToken',
        identityToken: 'testToken',
      }
      const mockedUtilsIsAuthed = jest.spyOn(authUtils, 'isAuthed').mockImplementation(() => {return false;});
      const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => {return JSON.stringify(token)});
      const mockedLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype,'removeItem');
      const mockedUtilsIsValidToken = jest.spyOn(authUtils, 'isValidToken').mockImplementation(() => {return true});
      const mockedUtilsStoreJwt = jest.spyOn(authUtils, 'storeJwt').mockImplementation();
      const hook = renderHook(() => useAuth(), { wrapper });
      const result = hook.result.current.isAuthed();
  
      expect(result).toBe(true);
      expect(mockedUtilsIsAuthed).toHaveBeenCalledTimes(1);
      expect(mockedLocalStorageGetItem).toHaveBeenCalledTimes(1);
      expect(mockedLocalStorageRemoveItem).toHaveBeenCalledTimes(1);
      expect(mockedUtilsIsValidToken).toHaveBeenCalledTimes(1);
      expect(mockedUtilsStoreJwt).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendToOktaLogin tests', () => {
    it('gets tokens and redirects', async () =>{
      mockAuthContext.ensureAuthed = jest.fn().mockImplementation(() => {
        return {
          accessToken: "accessToken",
          identityToken: "identityToken",
        } as RenewTokenResult
      });
      const mockedUtilsStoreJwt = jest.spyOn(authUtils, 'storeJwt').mockImplementation();
      const mockedUtilsGetRedirectUrl = jest.spyOn(authUtils, 'getRedirectUrl').mockImplementation(() => {return 'https://someurl.com'});
      const hook = renderHook(() => useAuth(), { wrapper });
      await hook.result.current.sendToOktaLogin();

      expect(mockAuthContext.ensureAuthed).toHaveBeenCalledTimes(1);
      expect(mockedUtilsStoreJwt).toHaveBeenCalledTimes(1);
      expect(mockedUtilsGetRedirectUrl).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledTimes(1);
    });
    
    it('ensureAuthed returns no identity token', async () =>{
      mockAuthContext.ensureAuthed = jest.fn().mockImplementation(() => {
        return {
          accessToken: "accessToken",
          identityToken: undefined,
        } as RenewTokenResult
      });
      const mockedUtilsStoreJwt = jest.spyOn(authUtils, 'storeJwt').mockImplementation();
      const mockedUtilsGetRedirectUrl = jest.spyOn(authUtils, 'getRedirectUrl').mockImplementation(() => {return 'https://someurl.com'});
      const hook = renderHook(() => useAuth(), { wrapper });
      await hook.result.current.sendToOktaLogin();

      expect(mockAuthContext.ensureAuthed).toHaveBeenCalledTimes(1);
      expect(mockedUtilsStoreJwt).not.toHaveBeenCalled();
      expect(mockedUtilsGetRedirectUrl).not.toHaveBeenCalled();
      expect(replaceMock).not.toHaveBeenCalled();
    });

    it('ensureAuthed returns undefined', async () =>{
      mockAuthContext.ensureAuthed = jest.fn().mockImplementation(() => {
        return undefined as RenewTokenResult
      });
      const mockedUtilsStoreJwt = jest.spyOn(authUtils, 'storeJwt').mockImplementation();
      const mockedUtilsGetRedirectUrl = jest.spyOn(authUtils, 'getRedirectUrl').mockImplementation(() => {return 'https://someurl.com'});
      const hook = renderHook(() => useAuth(), { wrapper });
      await hook.result.current.sendToOktaLogin();

      expect(mockAuthContext.ensureAuthed).toHaveBeenCalledTimes(1);
      expect(mockedUtilsStoreJwt).not.toHaveBeenCalled();
      expect(mockedUtilsGetRedirectUrl).not.toHaveBeenCalled();
      expect(replaceMock).not.toHaveBeenCalled();
    });
  })

  describe('login test', () => {
    it('calls login and redirects', async () =>{
      mockAuthContext.login = jest.fn().mockImplementation();
      const mockedUtilsGetRedirectUrl = jest.spyOn(authUtils, 'getRedirectUrl').mockImplementation(() => {return 'https://someurl.com'});
      const hook = renderHook(() => useAuth(), { wrapper });
      await hook.result.current.login();

      expect(mockAuthContext.login).toHaveBeenCalledTimes(1);
      expect(mockedUtilsGetRedirectUrl).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout test', () => {
    it('calls logout with stored redirect url', async () =>{
      const testUrl = 'https://someurl.com';
      mockAuthContext.logout = jest.fn().mockImplementation();
      const mockedUtilsGetRedirectUrl = jest.spyOn(authUtils, 'getRedirectUrl').mockImplementation(() => {return testUrl});
      const hook = renderHook(() => useAuth(), { wrapper });
      await hook.result.current.logoutOfOkta();

      expect(mockAuthContext.logout).toHaveBeenCalledWith({"post_logout_redirect_uri": testUrl});
      expect(mockedUtilsGetRedirectUrl).toHaveBeenCalledTimes(1);
    });

    it('calls logout with location href when no stored redirect url exists', async () =>{
      const testUrl = undefined;
      mockAuthContext.logout = jest.fn().mockImplementation();
      const mockedUtilsGetRedirectUrl = jest.spyOn(authUtils, 'getRedirectUrl').mockImplementation(() => {return testUrl});
      const hook = renderHook(() => useAuth(), { wrapper });
      await hook.result.current.logoutOfOkta();

      expect(mockAuthContext.logout).toHaveBeenCalledWith({"post_logout_redirect_uri": window.location.href.split("#")[0]});
      expect(mockedUtilsGetRedirectUrl).toHaveBeenCalledTimes(1);
    });
  })
})