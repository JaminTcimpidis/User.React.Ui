import React, { useState } from 'react';
import { User } from '../../dtos/user.dtos';
import useHydrateUserState from './get-all-user-hook';

const useCreateUserForm = (callback: any) => {
  const newUser = {
    firstName: "",
    lastName: "",
    email: ""
  } as User
  const [inputs, setInputs] = useState({
    ...newUser
  } as User);

  const handleSubmit = (event: any) => {
    if (event) {
      event.preventDefault();
    }
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