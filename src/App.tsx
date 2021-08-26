import React from 'react';
import { UserListComponent } from './user/user-list';
import { HomeComponent } from './home/home' 
import { Switch, Route, HashRouter } from 'react-router-dom';
import AuthedRoute from './auth/authedRoute'
import Header from './home/header';
import Login from './home/login';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <HashRouter>
        <Header />
        <div className="container">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/" exact component={HomeComponent} />
            <AuthedRoute path="/user-list" component={UserListComponent} />
          </Switch>
        </div>
      </HashRouter>
    </div>
  );
}

export default App;
