import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

//simple header using react router

const Header = () => (
  <div className="centerIt">
      <nav>
        <Link to='/home'>Home</Link>
      </nav>

      <h1>Working with www.weather.gov APIs</h1>
  </div>
)

export default Header;
