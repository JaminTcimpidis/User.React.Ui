import createClient, { AuthClient } from './authClient';
import { localStorageAuthKey } from '../constants';
import { clearStoredJwt, decodeExpirationTime, isAuthed, isStoredTokenValidForOkta, storeJwt } from './utils';

export type AppAuthenticate = Promise<{
  authenticated: boolean;
  error: {
    message: string | null;
  } | null,
  authClient: AuthClient,
}>;

const AppAuthenticate = Promise;

export const authenticate = async (appConfig: AppConfig): AppAuthenticate => {
  const scopes = ['openid', 'profile', 'email', 'groups'] 
  const hasAccessTokenInParams = window.location.href.includes('?code=');

  if(hasAccessTokenInParams){
    clearStoredJwt();
  }

  const authData = localStorage.getItem(localStorageAuthKey);
  let auth = null;
  try {
    auth = authData ? JSON.parse(authData) : null;
  } catch {
    // swallow
  }

  let accessToken;
  let idToken;

  if (isStoredTokenValidForOkta(auth, appConfig.oAuthDomain)) {
    accessToken = {
      accessToken: auth.accessToken,
      expiresAt: decodeExpirationTime(auth.accessToken) as number,
      scopes
    }
    idToken = {
      idToken: auth.identityToken,
      expiresAt: decodeExpirationTime(auth.identityToken) as number,
      scopes
    }
  }
  else {
    clearStoredJwt();
  }

  const authClient = await createClient(appConfig, accessToken, idToken)

  authClient.onRenewed((accessToken?: string, identityToken?: string) => {
    storeJwt(accessToken, identityToken);
  });

  if(hasAccessTokenInParams || isAuthed()){
    try {
      const auth = await authClient.ensureAuthed();
      storeJwt(auth.accessToken, auth.identityToken);
      return {
        authenticated: true,
        error: null,
        authClient,
      }
    }
    catch (err: any){
      const message = err?.message ? err?.message : err?.toString();
      return {
        authenticated: false,
        error: {
          message
        },
        authClient,
      }
    }
  }

  return {
    authenticated: false,
    error: null,
    authClient,
  }
}
