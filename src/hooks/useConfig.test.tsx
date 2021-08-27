import React from 'react';
import { useConfig } from './useConfig';
import * as configuration from '../utilities/getConfiguration';
import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';

describe('useConfig', () => {
  it('gets configuration',async () => {
    const config = {
      userApiUrl: "testUserUrl",
      websiteUrl: "testWebsiteUrl"
    } as AppConfig

    const getConfigurationMock = jest.spyOn(configuration, 'getConfiguration').mockImplementation(() => {
      return config
    })
    let hook;
    await act(async () => {
      hook = renderHook(() => useConfig());
    })
    const result = hook.result.current.config;

    expect(getConfigurationMock).toHaveBeenCalledTimes(2);
    expect(result).toBe(config);
  })
})