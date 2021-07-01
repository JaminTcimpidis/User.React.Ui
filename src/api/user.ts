import { CreateUserRequest, User } from '../../dtos/user.dtos'

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

export const AddUser = async (request: CreateUserRequest): Promise<number> => {
  const apiUrl = "https://localhost:41120/user/post";
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
  const apiUrl = `https://localhost:41120/user/delete?userId=${userId}`;
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