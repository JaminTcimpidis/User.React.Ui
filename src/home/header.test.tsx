import React from 'react';
import Header from './header';
import { screen, render, fireEvent } from '@testing-library/react';

const mockLogin = jest.fn();
const mockIsAuthed = jest.fn();
const mockLogout = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => {
    return {
      login: mockLogin,
      logoutOfOkta: mockLogout,
      isAuthed: mockIsAuthed,
    }
  }
}));

describe('header tests', () => {
  it('if isAuthed is true button says log out', () => {
    mockIsAuthed.mockImplementation(() => { return true });

    render(<Header />)
    const logoutButton = screen.queryByText('Log out')
    fireEvent.click(logoutButton);
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockIsAuthed).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('if isAuthed is false button says sign in', () => {
    mockIsAuthed.mockImplementation(() => { return false });

    render(<Header />)
    const signinButton = screen.queryByText('Sign in')
    fireEvent.click(signinButton);
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockIsAuthed).toHaveBeenCalledTimes(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });
});