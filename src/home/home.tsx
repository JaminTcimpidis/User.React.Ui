import React from 'react';
import { Redirect } from 'react-router-dom';
import { getRedirectUrl } from '../auth/utils';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import profile_1 from '../assets/profile_1.png'
import './home.scss';

export const HomeComponent = () => {
  const { isAuthed } = useAuth();
  const { config } = useConfig();
  
  const renderHomeScreen = () => {
    const profileImage = (
      <div className="profile">
        <img src={profile_1} height={591} width={370}></img>
      </div>
    )

    const text = (
      <div className="text">
          <div className="slogan">
            <strong>
              <span className="emphasis">Communicate </span>first,
              <span className="emphasis"> develop</span> second. Asking the right 
              <span className="emphasis"> questions</span> for the right 
              <span className="emphasis"> solutions</span>.
            </strong> 
          </div>
          <div className="pitch">
            Hire an developer who is passionate about keeping an open line of communication throughout the entire development process. The more we can know, the easier it is to build a solution that works for you. 
          </div>
        </div>
    )
    let render = (
      <div className="home">
        {profileImage}
        {text}
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
          <div className="home">
            {profileImage}
            {text}
          </div>
        )
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