import React, { useState } from 'react';
import { CreateUserRequest } from '../../dtos/user.dtos';
import { AddUser } from '../api/user';

const useCreateUserForm = (callback: any) => {
  const newUser = {
    firstName: "",
    lastName: "",
    email: ""
  } as CreateUserRequest

  const [inputs, setInputs] = useState({
    ...newUser
  } as CreateUserRequest);

  const handleSubmit = async (event: any) => {
    if (event) {
      event.preventDefault();
    }
    const user : CreateUserRequest = {
      firstName :inputs.firstName,
      lastName : inputs.lastName,
      email: inputs.email,
    };

    await AddUser(user);
    callback();
    setInputs({...newUser})
  }
  const handleInputChange = (event: any) => {
    event.persist();
    setInputs(inputs => ({...inputs, [event.target.name]: event.target.value}));
  }

  return {
    handleSubmit,
    handleInputChange,
    inputs
  };
}

export default useCreateUserForm;