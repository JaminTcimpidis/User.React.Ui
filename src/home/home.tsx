import React from 'react';
import { Redirect } from 'react-router-dom';
import { getRedirectUrl } from '../auth/utils';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';

export const HomeComponent = () => {
  const { isAuthed } = useAuth();
  const { config } = useConfig();
  
  const renderHomeScreen = () => {
    let render = (
      <div>
        <h4>Looks like you're not signed in. You should only be able to see this screen so you probably want to sign in</h4>
      </div>
    )
    if (isAuthed()) {
      const redirectUrl = getRedirectUrl();
      let redirectHash;
      if (redirectUrl != config.websiteUrl && redirectUrl != `${config.websiteUrl}login`){
        const redirectUrlArray: string[] = redirectUrl.split('#', 2);
        if(redirectUrlArray.length === 2){
          redirectHash = redirectUrlArray[1];
        }
      }
      if(redirectHash){
        render = <Redirect to={redirectHash} />
      }
      else {
        render = (
          <div>
            <span>You're signed in</span>
          </div>
        )
      }
    }
    return render;
  }

  return (
    <div>
      <h1>Jamin's home screen. This so far is a test. I am not sure what I should create as of yet</h1>
      {renderHomeScreen()}
    </div>
  )
} 