import React, { useState } from 'react'
import { useEffect } from 'react';
import { getConfiguration } from '../utilities/getConfiguration'

export const useConfig = () => {
  const [config, setConfig] = useState({} as AppConfig);  

  useEffect(() => {
    const getConfig = async():Promise<void> => {
      const freshConfig = await getConfiguration();
      setConfig(freshConfig);
    };
    getConfig();
  },[config])
  
  return {
    config
  }
}