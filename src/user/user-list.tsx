import React, { useEffect, useState } from 'react';
import { GetUsers } from '../api/userContext';
import { UserComponent }  from './user';
import { User } from '../../dtos/user.dtos';
import { AddUserComponent } from './add-user';
import './user.scss'

export const UserListComponent = () => {
    const [appState, setAppState] = useState({
      userList: [] as User[],
      loading: false,
    });

    useEffect(() => {
      setAppState({ loading: true, userList: [] })
      getUsers()
    },[setAppState]);

    const getUsers = () => {
      GetUsers()
      .then(res => {
        setAppState({
          userList: res,
          loading: false,
        })
      });
    }

    const renderUsers = (): JSX.Element[] => {
      return appState.userList.map(user => {
        return(
          <UserComponent user={user} key={user.id}/>
        )
    }
      );
    }
    return( 
      <div>
        <AddUserComponent reloadUser={getUsers}/>
        <div className="header">
          <span>Hey welcome. Here are the users</span>
        </div>
        <div className="container">
          {renderUsers()}
        </div>
      </div>
    )
}