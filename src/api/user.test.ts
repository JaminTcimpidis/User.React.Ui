import { CreateUserRequest } from '../../dtos/user.dtos'
import * as configuration  from '../utilities/getConfiguration';
import { AddUser, DeleteUser, GetUsers } from './user';

describe('user api tests', () => {
  const config = {
    userApiUrl: "testUrl"
  } as AppConfig
  const userToAdd = {
    firstName: 'test',
    lastName: 'testing',
    email: 'test@email.com'
  } as CreateUserRequest


  beforeEach(() => {
    jest.clearAllMocks();
  })

  it('AddUser returns 200', async () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userToAdd })
    };
    const expectedResult = {
      data:'1'
    }
    const mockResponse = new Response(JSON.stringify(expectedResult))
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce(Promise.resolve(mockResponse))
    jest.spyOn(configuration, 'getConfiguration').mockReturnValue(Promise.resolve(config));

    const actualResult = await AddUser(userToAdd);
    expect(fetchSpy).toHaveBeenCalledWith(`${config.userApiUrl}/user/post`, requestOptions);
    expect(actualResult).toStrictEqual(expectedResult);
  });

  it('AddUser throws error', async() => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userToAdd })
    };
    const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValueOnce(Promise.reject)
    jest.spyOn(configuration, 'getConfiguration').mockReturnValue(Promise.resolve(config));
    const fetchError = jest.spyOn(console, 'error').mockReturnValueOnce();

    const actualResult = await AddUser(userToAdd);
    expect(fetchSpy).toHaveBeenCalledWith(`${config.userApiUrl}/user/post`, requestOptions);
    expect(fetchError).toBeCalledTimes(1);
    expect(actualResult).toStrictEqual(0);
  });

  it('GetUsers returns 200', async () => {
    const expectedResult = {
      data: userToAdd
    }
    const mockResponse = new Response(JSON.stringify(expectedResult))
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce(Promise.resolve(mockResponse))
    jest.spyOn(configuration, 'getConfiguration').mockReturnValue(Promise.resolve(config));

    const actualResult = await GetUsers();
    expect(fetchSpy).toHaveBeenCalledWith(`${config.userApiUrl}/user/get`);
    expect(actualResult).toStrictEqual(expectedResult);
  });

  it('GetUsers throws error', async() => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValueOnce(Promise.reject)
    jest.spyOn(configuration, 'getConfiguration').mockReturnValue(Promise.resolve(config));
    const fetchError = jest.spyOn(console, 'error').mockReturnValueOnce();

    const actualResult = await GetUsers();
    expect(fetchSpy).toHaveBeenCalledWith(`${config.userApiUrl}/user/get`);
    expect(fetchError).toBeCalledTimes(1);
    expect(actualResult).toStrictEqual([]);
  });

  it('DeleteUser returns 200', async () => {
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    };
    const userId = 213;
    const mockResponse = new Response()
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce(Promise.resolve(mockResponse))
    jest.spyOn(configuration, 'getConfiguration').mockReturnValue(Promise.resolve(config));

    await DeleteUser(userId);
    expect(fetchSpy).toHaveBeenCalledWith(`${config.userApiUrl}/delete?userId=${userId}`, requestOptions);
  });

  it('DeleteUser throws error', async() => {
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    };
    const userId = 213;
    const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValueOnce(Promise.reject)
    jest.spyOn(configuration, 'getConfiguration').mockReturnValue(Promise.resolve(config));
    const fetchError = jest.spyOn(console, 'error').mockReturnValueOnce();

    await DeleteUser(userId);
    expect(fetchSpy).toHaveBeenCalledWith(`${config.userApiUrl}/delete?userId=${userId}`, requestOptions);
    expect(fetchError).toBeCalledTimes(1);
  });
})