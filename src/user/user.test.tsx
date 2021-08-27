import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { UserComponent, UserComponentProps } from './user';

describe('UserComponent tests', () => {
  const props: UserComponentProps = {
    user: {
      id: 2,
      firstName: 'test',
      lastName: 'testerson',
      email: 'email@test.com'
    },
    deleteUser: jest.fn(),
  };
  it('component renders', () => {
    render(<UserComponent {...props} />)
    const id = screen.getByText(`#${props.user.id}`);
    const name = screen.getByText(`Name: ${props.user.firstName} ${props.user.lastName}`);
    const email = screen.getByText(`Email: ${props.user.email}`);
    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    expect(id).toBeInTheDocument();
    expect(name).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(props.deleteUser).toHaveBeenCalledTimes(1);
  })

})