import React from 'react';
import { setRedirectUrl } from '../auth/utils';
import { useAuth } from '../hooks/useAuth';
import './header'

const Header = () => {
  const { isAuthed, logoutOfOkta, login } = useAuth();

  const loginWithOkta = () => {
    setRedirectUrl();
    login();
  }
  const renderLoginOrOutButton = ():JSX.Element => {
    let button = (
      <button onClick={loginWithOkta}>Sign in</button>
    )
    if (isAuthed()) {
      button = <button onClick={logoutOfOkta}>Log out</button>
    }
    return button;
  }
  return (
    <header className="header">
      {renderLoginOrOutButton()}
    </header>
  )
}

export default Header;