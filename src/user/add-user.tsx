import React from 'react';
import { AddUser } from '../api/user';
import useCreateUserForm from '../hooks/create-user-hook';
import { User } from '../../dtos/user.dtos';

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
        {/* <div>
          <label>Password</label>
          <input type="password" name="password1" onChange={handleInputChange} value={inputs.password1}/>
        </div>
        <div>
          <label>Re-enter Password</label>
          <input type="password" name="password2" onChange={handleInputChange} value={inputs.password2}/>
        </div> */}
        <button className="rounded" type="submit">Sign Up</button>
      </form>
    )
}