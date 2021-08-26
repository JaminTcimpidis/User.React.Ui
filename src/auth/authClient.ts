import { OktaAuth, AccessToken, IDToken, UserClaims, Tokens } from "@okta/okta-auth-js";
import { setRetry, getRetry, setStateSession, removeRetry, clearStoredJwt } from "./utils";
import decode from 'jwt-decode';

const accessTokenKey = "accessToken";
const idTokenKey = "idToken";

export interface OAuthConfig { 
  oAuthClientId: string,
  oAuthDomain: string,
  redirectUri: string,
  scopes: string[],
}

export interface RenewTokenResult{
  accessToken: string,
  identityToken?: string,
  identity?: UserClaims,
}

export interface QueryParams {
  post_logout_redirect_uri: string,
}

export interface AuthClient {
  logout: (queryParams: QueryParams) => Promise<void>,
  login: () => Promise<void>
  getIdentity: () => Promise<string>
  getAccessToken: () => Promise<string>
  getIdentityToken: () => Promise<string>
  ensureAuthed: () => Promise<RenewTokenResult>,
  onRenewed: (callback: (accessToken?: string, identityToken?: string) => void) => void,
}

export interface Token {
  scopes: string[];
  expiresAt: number;
  accessToken?: string;
  idToken?: string;
}

export type AuthData = {accessToken?: string, identityToken?: string } | null;

const createClient = (config: OAuthConfig, accessToken?: Token, idToken?: Token): AuthClient => {
 
  if (!config) {
    throw new Error('missing configuration')
  }
  const authRetryKey = `${config.oAuthClientId}-auth-retry`;
  setRetry(authRetryKey, 0);

  const oidc = {
    clientId: config.oAuthClientId,
    issuer: config.oAuthDomain,
    redirectUri: config.redirectUri,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    disableHttpsCheck: false,
    tokenManager:{
      storage: 'memory',
      expiredEarlySeconds: 120,
      autoRenew: true,
    },
    responseType:['id_token', 'token']
  }

  const oktaAuthClient = new OktaAuth(oidc);

  if(accessToken || idToken) {
    try {
      oktaAuthClient.tokenManager.setTokens({accessToken: accessToken, idToken: idToken } as Tokens);
    } catch (err){
      throw new Error(err);
    }
    
  }

  oktaAuthClient.tokenManager.on('expired', async(key: string)=> {
    try {
      await oktaAuthClient.tokenManager.renew(key);
    }
    catch (err) {
      client.login();
      throw new Error(err)
    }
  })

  const client = {
    logout: async(queryParams: QueryParams) => {
      if (!queryParams.post_logout_redirect_uri){
        throw new Error('Please specify queryParams.post_logout_redirect_url so we can redirect')
      }
      await oktaAuthClient.signOut();
      clearStoredJwt();
      window.location.assign(queryParams.post_logout_redirect_uri);
    },
    login: async() => {
      const url = window.location.href.replace(new RegExp(document.baseURI, 'gi'), '') || document.baseURI;
      const state = setStateSession(url);

      await oktaAuthClient.token.getWithRedirect( {
        scopes: ['openid','email','profile'],
        state: state
      });
    },
    getIdentity: async(): Promise<string> => {
      let token = await oktaAuthClient.tokenManager.get(idTokenKey);
      return decode((token as IDToken).idToken);
    },
    getAccessToken: async(): Promise<string> => {
      let token = await oktaAuthClient.tokenManager.get(accessTokenKey);
      return (token as AccessToken).accessToken;
    },
    getIdentityToken: async() => {
      let token = await oktaAuthClient.tokenManager.get(idTokenKey);
      return (token as IDToken).idToken;
    },
    ensureAuthed: async(): Promise<RenewTokenResult> => {
      if(!window.location.href.includes('?code=')){
        setRetry(authRetryKey, Number(getRetry(authRetryKey)) + 1)
        try{
          const accessTokenObject = await oktaAuthClient.tokenManager.get(accessTokenKey);
          const identityTokenObject = await oktaAuthClient.tokenManager.get(idTokenKey);
          if (accessTokenObject && identityTokenObject) {
            return {
              accessToken: (accessTokenObject as AccessToken).accessToken,
              identityToken: (identityTokenObject as IDToken).idToken,
              identity: (identityTokenObject as IDToken).claims,
            };
          }
          else {
            const exists = await oktaAuthClient.session.exists();
            if(exists) {
              const session = await oktaAuthClient.session.get();
              if(session.status != "ACTIVE") {
                throw Error("no token in query and session is not active")
              }
              return await refreshTokensWithSession(oktaAuthClient, config, session)
            }
            throw Error('no token in query and session did not exist')
          }
        } 
        catch (err){
          if(getRetry(authRetryKey) === '3') {
            throw new Error(`exceed maximum retrys. ${err}`)
          }
          client.login();
          throw new Error(err)
        }
      }
      else{
        setRetry(authRetryKey, Number(getRetry(authRetryKey)) + 1 )
        try{
          return await parseFromUrl(oktaAuthClient, authRetryKey)
        }
        catch (err){
          throw new Error("failed to parse token from url")
        }
      }
    },
    onRenewed: (callback: (accessToken?: string, idToken?: string) =>  void) => {
      oktaAuthClient.tokenManager.on('renewed', async (key: string, token: Token) => {
        const accessToken = (key === accessTokenKey) ? token.accessToken : await client.getAccessToken();
        const identityToken = (key === idTokenKey) ? token.idToken : await client.getIdentityToken();

        callback(accessToken, identityToken);
      })
    }
  }
  return client;
}

const parseFromUrl = async (oktaAuthClient: OktaAuth, authRetryKey: string): Promise<RenewTokenResult> => {
  const tokens = await oktaAuthClient.token.parseFromUrl();
  const accessToken = tokens.tokens.accessToken as AccessToken;
  const idToken = tokens.tokens.idToken as IDToken;

  oktaAuthClient.tokenManager.add(accessTokenKey, accessToken);
  oktaAuthClient.tokenManager.add(idTokenKey, idToken);

  removeRetry(authRetryKey);
  return {
    accessToken: accessToken?.accessToken,
    identityToken: idToken?.idToken,
    identity: idToken?.claims,
  };
}

const refreshTokensWithSession = async (oktaAuthClient: OktaAuth, config: OAuthConfig, session: any): Promise<RenewTokenResult> => {
  const tokens = await oktaAuthClient.token.getWithoutPrompt({
    scopes: config.scopes,
    responseType: ['token', 'id_token'],
    sessionToken: session.id,
  })

  oktaAuthClient.tokenManager.add(accessTokenKey, tokens.tokens.accessToken as AccessToken);
  oktaAuthClient.tokenManager.add(idTokenKey, tokens.tokens.idToken as IDToken);

  return {
    accessToken: tokens?.tokens?.accessToken?.accessToken,
    identityToken: tokens?.tokens?.idToken?.idToken,
    identity: tokens?.tokens?.idToken?.claims,
  } as RenewTokenResult;
}

export default createClient;