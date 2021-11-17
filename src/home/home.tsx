import React from 'react';
import { Redirect } from 'react-router-dom';
import { getRedirectUrl } from '../auth/utils';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { IntroductionComponent } from './introduction';
import { TechnologyComponent } from './technology';
import { ProfileComponent } from './profile';

export const HomeComponent = () => {
  const { isAuthed } = useAuth();
  const { config } = useConfig();
  
  const renderHomeScreen = () => {
    let render = (
      <div>
        <IntroductionComponent />
        <TechnologyComponent />
        <ProfileComponent />
      </div>
    );
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
        render =(
          <div>
            <IntroductionComponent />
            <TechnologyComponent />
            <ProfileComponent />
          </div>
        );
      }
    }
    return render;
  }

  return (
    <div>
      {renderHomeScreen()}
    </div>
  )
} 