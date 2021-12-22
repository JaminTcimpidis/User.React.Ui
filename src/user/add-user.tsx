import React from 'react';
import { useCreateUserForm } from '../hooks/create-user-hook';
import './add-user.scss'

export interface AddUserProps {
  reloadUser: () => void
}

export const AddUserComponent = (props: AddUserProps) => {
  const {inputs, handleInputChange, handleSubmit} = useCreateUserForm(props.reloadUser);
  
  return( 
    <form onSubmit={handleSubmit} className="user-form">
      <div className="add-user-card">
      </div>
      <div className="add-user-backdrop">
        <h3 className="add-user-text">Add a user!</h3>
        <div className="text">
          <label>First Name:</label>
          <input className="rounded" type="text" name="firstName" onChange={handleInputChange} value={inputs.firstName} required />
        </div >
        <div className="text">
        <label>Last Name:</label>
          <input className="rounded" type="text" name="lastName" onChange={handleInputChange} value={inputs.lastName} required />
        </div>
        <div className="text">
          <label>Email Address:</label>
          <input className="rounded" type="email" name="email" onChange={handleInputChange} value={inputs.email} required />
        </div>
        <button className="rounded" type="submit">Sign Up</button>
      </div>
    </form>
  );
}