import { render, screen } from '@testing-library/react';
import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import * as utils from '../auth/utils';
import {HomeComponent} from './home';

const testUrl = "https://testurl.com/#/";
const mockIsAuthed = jest.fn();
const mockConfig = {
  websiteUrl: testUrl,
};

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => {
    return {
      isAuthed: mockIsAuthed,
    };
   }
}));

jest.mock('../hooks/useConfig', () => ({
  useConfig: () => {
    return {
      config: mockConfig,
    };
  }
}));

describe('home tests', () => {
  it('renders not signed in text when isAuthed is false', () =>{
    mockIsAuthed.mockImplementation(()=> { return false });
    const getRedirectUrlMock = jest.spyOn(utils, 'getRedirectUrl').mockImplementation(()=> { return testUrl});
    render(<HomeComponent />)

    const notSignedInText = screen.queryByText('Looks like you\'re not signed in', { exact: false});
    expect(getRedirectUrlMock).not.toHaveBeenCalled();
    expect(notSignedInText).toBeInTheDocument();
  });

  it('renders signed in text when isAuthed is true and redirect is same as websiteUrl', () =>{
    mockIsAuthed.mockImplementation(()=> { return true });
    const getRedirectUrlMock = jest.spyOn(utils, 'getRedirectUrl').mockImplementation(()=> { return testUrl});
    render(<HomeComponent />)

    const signedInText = screen.queryByText('You\'re signed in');
    expect(getRedirectUrlMock).toHaveBeenCalledTimes(1);
    expect(signedInText).toBeInTheDocument();
  });

  it('renders signed in text when isAuthed is true and redirect is same as websiteUrl/login', () =>{
    mockIsAuthed.mockImplementation(()=> { return true });
    const getRedirectUrlMock = jest.spyOn(utils, 'getRedirectUrl').mockImplementation(()=> { return `${testUrl}login`});
    render(<HomeComponent />)

    const signedInText = screen.queryByText('You\'re signed in');
    expect(getRedirectUrlMock).toHaveBeenCalledTimes(1);
    expect(signedInText).toBeInTheDocument();
  });

  it('renders redirect in when isAuthed is true and redirect is not same as websiteUrl', () =>{
    mockIsAuthed.mockImplementation(()=> { return true });
    const getRedirectUrlMock = jest.spyOn(utils, 'getRedirectUrl').mockImplementation(()=> { return "https://website.com/#/different-route"});
    render(<HashRouter>
      <HomeComponent/>
        <Switch>
        <Route path="/different-route">
          <div>Redirect to</div>
        </Route>
      </Switch>
    </HashRouter>)

    const RedirectText = screen.queryByText('Redirect to', { exact: false });
    expect(getRedirectUrlMock).toHaveBeenCalledTimes(1);
    expect(RedirectText).toBeInTheDocument();
  });
});