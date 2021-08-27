import * as React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { setRedirectUrl } from './utils';

const AuthedRoute: React.FC<{
} & RouteProps & React.HTMLAttributes<HTMLDivElement>> = ({ 
  ...routeProps 
}) => { 
  const { isAuthed } = useAuth();

  if (!isAuthed()) {
    setRedirectUrl();
    return <Redirect to="/login" />;
  }

  return (
    <Route
      { ...routeProps }
    />
  );
};

export default AuthedRoute;