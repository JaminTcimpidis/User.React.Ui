import React from 'react'
import { act, render, screen } from '@testing-library/react';
import { User } from '../../dtos/user.dtos';
import { UserListComponent } from './user-list';
import * as UserApi from '../api/user';

describe('UserListComponent test', () => {
  const users: User[] = [
    {
      id: 1,
      firstName: 'test1',
      lastName: 'testerson1',
      email: 'test1@email.com'
    },
    {
      id: 2,
      firstName: 'test2',
      lastName: 'testerson2',
      email: 'test2@email.com'
    }
  ]

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('renders with user components', async () => {
    jest.spyOn(UserApi, 'GetUsers').mockImplementation(() => {
     return Promise.resolve(users)
    });
    await act(async () => {
      render(<UserListComponent />);
    });
    
    const userComponents = screen.queryAllByText('#', {exact: false});
    expect(userComponents).not.toBeNull();
    expect(userComponents).toHaveLength(2);
  })

  it('renders with no users returned', async () => {
    jest.spyOn(UserApi, 'GetUsers').mockImplementation(() => {
     return Promise.resolve(null)
    });
    await act(async () => {
      render(<UserListComponent />);
    });
    
    const userComponent = screen.queryByText('#', {exact: false});
    const noUserText = screen.queryByText("No users found")
    expect(userComponent).toBeNull();
    expect(noUserText).not.toBeNull();
  })
})