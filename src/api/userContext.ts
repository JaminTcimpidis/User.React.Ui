import { useReducer } from 'react';
import { User } from '../../dtos/user.dtos'

export const GetUsers = async (): Promise<User[]> => {
    const apiUrl = "https://localhost:41120/user/get"
    let response: User[] = [];
    await fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
            response = data;
        })
        .catch((error) => {
          console.error('Error:', error)
        });

    return response;
}

export const AddUser = async (user: User): Promise<number> => {
  const CreateUserRequest = {
    FirstName: user.firstName,
    LastName: user.lastName,
    email: user.email,
  }
  const apiUrl = "https://localhost:41120/user/post";
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...CreateUserRequest })
};
  let response = 0;
  await fetch(apiUrl, requestOptions)
      .then((res) => res.json())
      .then((data) => {
          response = data;
      })
      .catch((error) => {
        console.error('Error:', error)
      });

  return response;
}