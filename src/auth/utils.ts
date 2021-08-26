import { v4 as uuid } from 'uuid';
import { decode } from 'jsonwebtoken';
import { localStorageAuthKey, localStorageAuthRedirectUrl } from '../constants';
import { AuthData } from './authClient';

export const getRetry = (key: string) => {
  return window.localStorage.getItem(key);
}

export const setRetry = (key: string, count: number) => {
  window.localStorage.setItem(key, count.toString());
}

export const setStateSession = (path: string) => {
  const sessionKey = uuid();
  window.sessionStorage.setItem(sessionKey, path);

  return sessionKey;
}

export const setRedirectUrl = () => {
  const path = window.location.href.replace(new RegExp(document.baseURI, 'gi'), '') || document.baseURI;
  window.localStorage.setItem(localStorageAuthRedirectUrl, path);
}

export const getRedirectUrl = () :string  => {
  let url = document.baseURI;
  const storedUrl = window.localStorage.getItem(localStorageAuthRedirectUrl)
  if(storedUrl){
    url = storedUrl
  }
  return url;
}

export const removeRetry = (key: string) => {
  window.localStorage.removeItem(key);
}

export const storeJwt = (accessToken?: string, identityToken?: string) => {
  localStorage.setItem(localStorageAuthKey, JSON.stringify({accessToken, identityToken}))
}

export const clearStoredJwt = () => localStorage.removeItem(localStorageAuthKey);

export const isAuthed = () => {
  const rawAuthData = localStorage.getItem(localStorageAuthKey);

  if(rawAuthData && isValidToken(JSON.parse(rawAuthData))){
    return true;
  }

  return false;
}

export const isStoredTokenValidForOkta = (
  auth: AuthData,
  oktaIssure?: string, 
): boolean => {
  let isValidToken = false;

  if(!!auth && !!auth.accessToken && !!auth.identityToken) {
    const token = decode(auth.accessToken, { json: true}) as { exp?: number; iss?: string; scp?: string[] } | null;
    
    if(token) {
      const isOktaIssuer = !!token.iss && !!oktaIssure && token.iss.includes(oktaIssure);
      const isNotExpired = !!token.exp && !isExpired(token.exp); 
      const scopeHasGroups = !!token.scp && token.scp.includes('profile');
      isValidToken = isOktaIssuer && isNotExpired && scopeHasGroups;
    }
  }
  return isValidToken;
}

export const isExpired = (exp: number) => {
  const date = new Date(0);
  date.setUTCSeconds(exp);

  return date < new Date();
}

export const decodeExpirationTime = (token: string) => {
  const decodedToken = decode(token, {json: true});
  return decodedToken ? decodedToken.exp : null;
}

export const isValidToken = (cachedToken: AuthData): boolean => {
  try {
    const decoded = decode(cachedToken?.accessToken as string, {json: true}) as {exp: number};

    return !!decoded.exp && !isExpired(decoded.exp);
  }
  catch (err){
    return false
  }
}
