import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AuthProvider  from './auth/authProvider'
import { getConfiguration } from './utilities/getConfiguration'

export const bootstrap = (async () => {
  const config = await getConfiguration<AppConfig>();

  return Promise.resolve(render(
    <AuthProvider config={config}>
      <App/>
    </AuthProvider>,
  document.getElementById('root')
  ))
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
