import React from 'react';
import Login from './login';
import { act, render } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';

const mockSendToOktaLogin = jest.fn();
const mockIsAuthed = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => {
    return {
      sendToOktaLogin: mockSendToOktaLogin,
      isAuthed: mockIsAuthed,
    }
  }
}));

describe('login tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sendToOktaLogin is called when isAuthed is false',async () => {
    mockIsAuthed.mockImplementation(() => {return false}) 
    await act(async () => {
      render(
        <HashRouter>
          <Login />
        </HashRouter>
      );
    })

    expect(mockSendToOktaLogin).toHaveBeenCalledTimes(1);
    expect(mockIsAuthed).toHaveBeenCalledTimes(1);
  });

  it('sendToOktaLogin is not called when isAuthed is true',async () => {
    mockIsAuthed.mockImplementation(() => {return true}) 
    await act(async () => {
      render(
        <HashRouter>
          <Login />
        </HashRouter>
      );
    })

    const mockedLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype,'removeItem');

    expect(mockSendToOktaLogin).not.toHaveBeenCalled();
    expect(mockIsAuthed).toHaveBeenCalledTimes(1);
  });

  it('redirect retrived and removed when it exits and authed is true',async () => {
    mockIsAuthed.mockImplementation(() => {return true});
    const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => {
      return "https://testurl.com/#/testpage"
    });
    const mockedLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype,'removeItem');
    await act(async () => {
      render(
        <HashRouter>
          <Login />
        </HashRouter>
      );
    })
    expect(mockSendToOktaLogin).not.toHaveBeenCalled();
    expect(mockIsAuthed).toHaveBeenCalledTimes(1);
    expect(mockedLocalStorageGetItem).toHaveBeenCalledTimes(1);
    expect(mockedLocalStorageRemoveItem).toHaveBeenCalledTimes(1);
  });

  it('redirect remove item not called when redirect url does not exits and authed is true',async () => {
    mockIsAuthed.mockImplementation(() => {return true});
    const mockedLocalStorageGetItem = jest.spyOn(global.Storage.prototype,'getItem').mockImplementation(() => {
      return undefined
    });
    const mockedLocalStorageRemoveItem = jest.spyOn(global.Storage.prototype,'removeItem');
    await act(async () => {
      render(
        <HashRouter>
          <Login />
        </HashRouter>
      );
    })
    expect(mockSendToOktaLogin).not.toHaveBeenCalled();
    expect(mockIsAuthed).toHaveBeenCalledTimes(1);
    expect(mockedLocalStorageGetItem).toHaveBeenCalledTimes(1);
    expect(mockedLocalStorageRemoveItem).not.toHaveBeenCalled();
  });
});