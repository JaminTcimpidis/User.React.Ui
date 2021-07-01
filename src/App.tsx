import React from 'react';
import { UserListComponent } from './user/user-list';
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
