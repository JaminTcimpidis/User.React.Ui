import React from 'react';
import logo from './logo.svg';
import './App.css';
import { UserComponent } from './user-component';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <UserComponent />
      </header>
    </div>
  );
}

export default App;
