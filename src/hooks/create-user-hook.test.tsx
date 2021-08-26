import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';
import * as UserApi from '../api/user';
import { useCreateUserForm } from './create-user-hook';

describe('CreateUserHook', () => {
  it('calls AddUser on handleSubmit', async () => {
    const callBackMock = jest.fn()
    const addUserMock = jest.spyOn(UserApi, "AddUser").mockImplementation();
    const hook = renderHook(() => useCreateUserForm(callBackMock));
    const event = {
      preventDefault: jest.fn()
    }

    await act(async () => {
      await hook.result.current.handleSubmit(event);
    });
    expect(addUserMock).toHaveBeenCalledTimes(1);
    expect(callBackMock).toHaveBeenCalledTimes(1);
  });

  it('calls handleInputChange updates input ', async () => {
    let newInputs
    const testFirstNameValue = 'newName'
    const callBackMock = jest.fn()
    const hook = renderHook(() => useCreateUserForm(callBackMock));
    const event = {
      persist: jest.fn(),
      target:{
        name: 'firstName',
        value: testFirstNameValue
      }
    }

    await act(async () => {
      await hook.result.current.handleInputChange(event);
      newInputs = await hook.result.current.inputs;
    });

    expect(newInputs.firstName).toBe(testFirstNameValue);
  });
})