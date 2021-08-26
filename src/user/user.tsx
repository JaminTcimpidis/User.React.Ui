import React from 'react';
import { User } from '../../dtos/user.dtos';
import './user.scss'

export interface UserComponentProps {
  user: User;
  deleteUser: (userId: number) => void;
}

export const UserComponent = (props : UserComponentProps) => {
  return( 
    <div className="card item">
<<<<<<< HEAD
      <div className="user-header">
        <strong>#{props.user.id}</strong>
        <hr></hr>
      </div>
      <div className= "user-container">
=======
      <div className="text">
        <strong>#{props.user.id}</strong>
        <hr></hr>
      </div>
      <div className= "text">
>>>>>>> development
        <div>Name: {props.user.firstName} {props.user.lastName}</div>
        <div>Email: {props.user.email}</div>
      </div>
      <button onClick={() => props.deleteUser(props.user.id)}>
        Delete
      </button>
    </div>
  )
}