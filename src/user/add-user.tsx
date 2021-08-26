import React from 'react';
import { useCreateUserForm } from '../hooks/create-user-hook';

export interface AddUserProps {
  reloadUser: () => void
}

export const AddUserComponent = (props: AddUserProps) => {
  const {inputs, handleInputChange, handleSubmit} = useCreateUserForm(props.reloadUser);
  
  return( 
    <form onSubmit={handleSubmit} className="add-user-card">
      <div className="text">
        <label>First Name</label>
        <input className="rounded" type="text" name="firstName" onChange={handleInputChange} value={inputs.firstName} required />
      </div >
      <div className="text">
      <label>Last Name</label>
        <input className="rounded" type="text" name="lastName" onChange={handleInputChange} value={inputs.lastName} required />
      </div>
      <div className="text">
        <label>Email Address</label>
        <input className="rounded" type="email" name="email" onChange={handleInputChange} value={inputs.email} required />
      </div>
      <button className="rounded" type="submit">Sign Up</button>
    </form>
  );
}