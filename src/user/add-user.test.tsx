import React from 'react';
import { AddUserComponent, AddUserProps } from './add-user';
import { fireEvent, render, screen } from '@testing-library/react';
import * as createUserHook  from '../hooks/create-user-hook';
import { CreateUserRequest } from '../../dtos/user.dtos';
import userEvent from '@testing-library/user-event';

const testInputs = {
  firstName: "test",
  lastName: "testerson",
  email: "email@test.com"
} as CreateUserRequest

const mockHandleInputChange = jest.fn();
const mockHandleSubmit = jest.fn();

jest.mock('../hooks/create-user-hook', () => ({
  useCreateUserForm: (callback) => { 
    return {
      inputs: testInputs,
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
    }
  }
}))

describe('AddUserComponent tests', () => {
  const props = {
    reloadUser: jest.fn()
  } as AddUserProps

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('component renders', () => {
    render(<AddUserComponent {...props} />);

    const firstNameLabel = screen.queryByText('First Name');
    const lastNameLabel = screen.queryByText('Last Name');
    const emailLabel = screen.queryByText('Email Address');
    const submitButton = screen.queryByRole('button');

    expect(firstNameLabel).toBeInTheDocument();
    expect(lastNameLabel).toBeInTheDocument();
    expect(emailLabel).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('input on change calls handleInputChange', () => {
    render(<AddUserComponent {...props} />);
    mockHandleInputChange.mockImplementation(event => {
      event.persist();
    });

    const inputFields = screen.queryAllByRole('textbox');

    expect(inputFields).toHaveLength(3);
    userEvent.type(inputFields[0], 'Test2');
    userEvent.type(inputFields[1], 'Testerson2');
    userEvent.type(inputFields[2], 'Test2@email.com');
    expect(mockHandleInputChange).toHaveBeenCalledTimes(30);
  })

  it('submit button calls handleSubmit', () => {
    render(<AddUserComponent {...props} />);
    mockHandleSubmit.mockImplementation(event => {
      event.preventDefault();
    });

    const submitButton = screen.queryByRole('button');

    fireEvent.click(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  })
})