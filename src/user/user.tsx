import React from 'react';
import { User } from '../../dtos/user.dtos';
import './user.scss'

export interface UserComponentProps {
  user: User;
  deleteUser: (userId: number) => void;
}

export const UserComponent = (props : UserComponentProps) => {
  return( 
    <div className="card">
      <div className="cloud">
        <div className="user-container">
          <div className="user">
            <div className="first-name">
              {props.user.firstName}
            </div>
            <div className="last-name">
              {props.user.lastName}
            </div>
          </div>
          <div className="user">
            <div className="email">
              {props.user.email}
            </div>
          </div>
        </div>
        <button className="user-delete-btn" onClick={() => props.deleteUser(props.user.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}