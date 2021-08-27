import { useContext } from "react";
import { isAuthed as ensureAuth , isValidToken, getRedirectUrl, storeJwt } from '../auth/utils'
import { AuthContext } from "../auth/authContext";
import { localStorageAuthKey } from "../constants";
import { AuthClient, QueryParams, RenewTokenResult } from "../auth/authClient";

export const useAuth = () => {
  const authClient = useContext(AuthContext) as AuthClient;

  const isAuthed = (): boolean => {
    if (ensureAuth()){
      return true;
    }

    const localStorageToken = localStorage.getItem(localStorageAuthKey);
    const token = localStorageToken ? JSON.parse(localStorageToken) : undefined;

    if (!token || !isValidToken({accessToken: token.accessToken, identityToken: token.identityToken })){
      return false;
    }

    localStorage.removeItem(localStorageAuthKey);

    storeJwt(token.accessToken, token.identityToken)

    return true;
  }

  const sendToOktaLogin = async (): Promise<void> => {
    const authResponse = await authClient.ensureAuthed() as RenewTokenResult;
    if (authResponse?.identityToken){
      storeJwt(authResponse.accessToken, authResponse.identityToken);
      window.location.replace(getRedirectUrl());
    }
  }
  
  const login = async (): Promise<void> => {
    await authClient.login();
    window.location.replace(getRedirectUrl());
  }

  const logoutOfOkta = async (): Promise<void> => {
    const redirectUrl = getRedirectUrl();
    let redirectUri = window.location.href.split("#")[0];
    if(redirectUrl){
      redirectUri = redirectUrl
    }
    const queryParams : QueryParams = {
      post_logout_redirect_uri: redirectUri,
    }
    await authClient.logout(queryParams);
  }

  return { isAuthed, sendToOktaLogin, logoutOfOkta, login };
}
