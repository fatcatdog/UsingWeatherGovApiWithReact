import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import Home from './Home';

//implimenting react router if i want to use it in the future to build new features
const Main = () => (
  <main>
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Home}/>
        <Route path='/home' component={Home}/>
      </Switch>
    </BrowserRouter>
  </main>
)

export default Main;
