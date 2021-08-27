import React from 'react';
import { act, screen, render } from '@testing-library/react';
import AuthedRoute from './authedRoute';
import { HashRouter, Route, Switch } from 'react-router-dom';

const mockIsAuthed = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => {
    return {
      isAuthed: mockIsAuthed,
    }
  }
}));

describe('authedRoute tests', () => {
  it('redirects when isAuthed is false', () => {
    mockIsAuthed.mockImplementation(() => { return false; });
    render(
      <HashRouter>
      <AuthedRoute path="/" component={() => { return <div>Authed Route</div>}}/>
        <Switch>
        <Route path="/login">
          <div>Login</div>
        </Route>
      </Switch>
    </HashRouter>
    );

    const loginText = screen.queryByText('Login');
    expect(loginText).toBeInTheDocument();
    expect(mockIsAuthed).toHaveBeenCalledTimes(1);
  });

  it('loads child when isAuthed is true', () => {
    mockIsAuthed.mockImplementation(() => { return true; });
    render(
      <HashRouter>
        <AuthedRoute path="/" component={() => { return <div>Authed Route</div>}}/>
      </HashRouter>
    );

    const loginText = screen.queryByText('Authed Route');
    expect(loginText).toBeInTheDocument();
    expect(mockIsAuthed).toHaveBeenCalledTimes(1);
  });
});