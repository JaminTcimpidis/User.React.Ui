import React from 'react';
import AuthProvider, { AuthProviderProps } from './authProvider';
import * as auth from './auth';
import { act, screen, render } from '@testing-library/react';
import { AuthClient } from './authClient';

describe('AuthProvider tests', () => {
  it('renders and calls authenticate',async () => {
    const props = {
      config: {},
      children: (<div>I'm a child</div>)
    } as AuthProviderProps;

    const mockAuthenticate = jest.spyOn(auth, 'authenticate').mockImplementation(() => {
      return Promise.resolve({
        authenticated: true,
        error: null,
        authClient: {} as AuthClient,
      });
    });

    await act(async () =>{
      render(<AuthProvider {...props} />)
    })

    const child = screen.queryByText('I\'m a child');
    expect(child).toBeInTheDocument();
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
  });
});