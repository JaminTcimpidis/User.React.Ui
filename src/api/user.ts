import { CreateUserRequest, User } from '../../dtos/user.dtos'
import { getConfiguration } from '../utilities/getConfiguration';

export const GetUsers = async (): Promise<User[]> => {
  const config = await getConfiguration<AppConfig>();
  const apiUrl = `${config.userApiUrl}/user/get`
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

export const AddUser = async (request: CreateUserRequest): Promise<number> => {
  const config = await getConfiguration<AppConfig>();
  const apiUrl = `${config.userApiUrl}/user/post`;
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request })
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

export const DeleteUser = async (userId: number): Promise<void> => {
  const config = await getConfiguration<AppConfig>();
  const apiUrl = `${config.userApiUrl}/delete?userId=${userId}`;
  const requestOptions = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  };

  await fetch(apiUrl, requestOptions)
      .then()
      .catch((error) => {
        console.error('Error:', error)
      });
}