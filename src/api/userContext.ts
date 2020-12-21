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