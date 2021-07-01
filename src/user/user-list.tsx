import React, { useEffect, useState } from 'react';
import { GetUsers } from '../api/user';
import { UserComponent }  from './user';
import { User } from '../../dtos/user.dtos';
import { AddUserComponent } from './add-user';
import './user.scss'
import { DeleteUser } from '../api/user';

export const UserListComponent = () => {
    const [isloading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState([] as User[])
  

    useEffect(() => {
      setIsLoading(true);
      getUsers();
      setIsLoading(false);
    },[userList]);

    const getUsers = () => {
      GetUsers()
      .then(res => {
        setUserList(res)
      });
    }

    const deleteUser = async (userId: number) => {
      await DeleteUser(userId)
    }

    const renderUsers = (): JSX.Element[] => {
      return userList.map(user => {
        return(
          <UserComponent deleteUser={deleteUser} user={user} key={user.id} />
        )
    }
      );
    }

    return( 
      <div>
        <div className="header">
          <AddUserComponent reloadUser={getUsers}/>
          <span>Hey welcome. Here are the users</span>
        </div>
        <div className="container">
          {renderUsers()}
        </div>
      </div>
    )
}