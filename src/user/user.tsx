import React from 'react';
import { User } from '../../dtos/user.dtos';
import './user.scss'

export interface UserComponentProps {
  user: User;
}

export const UserComponent = (props : UserComponentProps) => {
    return( 
      <div className="card item">
        <div className="text">
          <strong>#{props.user.id}</strong>
          <hr></hr>
        </div>
        <div className= "text">
          <div>Name: {props.user.firstName} {props.user.lastName}</div>
          <div>Email: {props.user.email}</div>
        </div>
      </div>
    )
}