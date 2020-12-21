import React, { useEffect, useState } from 'react';
import { GetUsers } from './api/userContext';
import { User } from '../dtos/user.dtos';

export const UserComponent = () => {
    const [appState, setAppState] = useState({
      loading: false,
      data: [] as User[], 
    });

    useEffect(() => {
      setAppState({ loading: true, data: [] })
      getUserData()
      .then(res => {
        setAppState({
          data: res,
          loading: false
        })
      });
    }, [setAppState]);

    const getUserData= async () => {
      return await GetUsers();
    }

    const renderUsers = (): JSX.Element[] => {
      return appState.data.map(user => {
        return(
        <div>
          <div>
            <span>User number {user.id}</span>
          </div>
          <div className= "row">
            <div>First Name: {user.firstName}</div>
            <div>Last Name: {user.lastName}</div>
            <div>Email: {user.email}</div>
          </div>
        </div>
        )
    }
      );
    }
    return( 
      <div>
        Hey welcome. Here are your users:
        {renderUsers()}
      </div>
    )
}