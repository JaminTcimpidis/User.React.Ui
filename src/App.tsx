import React from 'react';
import logo from './logo.svg';
import { UserListComponent } from './user/user-list';
import { AddUserComponent } from './user/add-user';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <UserListComponent />
      </header>
    </div>
  );
}

export default App;
