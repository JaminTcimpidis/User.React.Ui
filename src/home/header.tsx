import React from 'react';
import { setRedirectUrl } from '../auth/utils';
import { useAuth } from '../hooks/useAuth';
import './header.scss'
import tci_logo from '../assets/tci_logo.png';


const Header = () => {
  const { isAuthed, logoutOfOkta, login } = useAuth();

  const loginWithOkta = () => {
    setRedirectUrl();
    login();
  }
  const renderLoginOrOutButton = ():JSX.Element => {
    let button = (
      <button className="header-btn" onClick={loginWithOkta}>Sign-in</button>
    )
    if (isAuthed()) {
      button = <button className="header-btn" onClick={logoutOfOkta}>Sign-out</button>
    }
    return button;
  }

  const redirectToServices = () => {

  }

  const redirectToExperience = () => {

  }

  const redirectToProfile = () => {

  }
  return (
    <header className="header">
      <div className="header-logo">
        <img src={tci_logo} width={311} height={65}></img>
      </div>
      <div>
        <button className="header-btn" onClick={redirectToServices}>Services</button>
      </div>
      <div>
        <button className="header-btn" onClick={redirectToExperience}>Experience</button>
      </div>
      <div>
        <button className="header-btn" onClick={redirectToProfile}>About me</button>
      </div>
      <div>
        {renderLoginOrOutButton()}
      </div>
    </header>
  )
}

export default Header;