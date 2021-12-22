import React, { useEffect, useState } from 'react';
import { GetUsers } from '../api/user';
import { UserComponent }  from './user';
import { User } from '../../dtos/user.dtos';
import { AddUserComponent } from './add-user';
import { DeleteUser } from '../api/user';
import './user.scss'

export const UserListComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState([] as User[])

  useEffect(() => {
    setIsLoading(true);
    getUsers();
    setIsLoading(false);
  },[]);

  const getUsers = async () => {
    const userList = await GetUsers();
    setUserList(userList);
  }

  const deleteUser = async (userId: number) => {
    await DeleteUser(userId)
    getUsers();
  }

  const renderUsers = (): JSX.Element[] | JSX.Element => {
    if(isLoading){
        return <div>Loading</div>;
    }

    if(!userList || userList.length === 0 ){
      return <div>No users found</div>
    }
    return userList.map(user => {
      return(
        <UserComponent deleteUser={deleteUser} user={user} key={user.id} />
      )
    });
  }

  return( 
    <div className="user-wrapper">
      <div>
      <AddUserComponent reloadUser={getUsers}/>
        <div className="user-header">
          <h3>Hey welcome. Here are the users</h3>
        </div>
      </div>
      <div className="user-list-container">
        {renderUsers()}
      </div>
    </div>
  )
}