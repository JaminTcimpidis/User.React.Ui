import * as React from 'react';
import { AuthClient } from './authClient';
import { authenticate } from './auth';
import { AuthContext } from './authContext';

export interface AuthProviderProps{
  config: AppConfig;
  children?: React.ReactNode;
}

export interface AuthProviderState {
  authClient: AuthClient;
  isAuthorized: boolean;
  isLoading: boolean;
  error: Error | null;
  post_logout_redirect_uri: string;
}


const AuthProvider = (props: AuthProviderProps) => { 
  const [authState, setAuthState] = React.useState({
    isAuthorized: false,
    isLoading: true,
    post_logout_redirect_uri: window.origin
  } as AuthProviderState)

  React.useEffect(() => {
    const getAuth = async () => {
      const { config } = props;
      let {isAuthorized, isLoading, post_logout_redirect_uri} = authState;
  
      isLoading = false;
  
      const {authenticated, error, authClient} = await authenticate(config);
  
      if(authenticated && !error){
        isAuthorized = true;
      }
  
      setAuthState({
        authClient,
        isLoading,
        error: error ? new Error(error.message as string) : null,
        isAuthorized,
        post_logout_redirect_uri
      })
    }
    
    getAuth();
  },[authState, props])

  return (
    <AuthContext.Provider value={authState.authClient}>
      {props.children}
    </AuthContext.Provider>
  )
};

export default AuthProvider;