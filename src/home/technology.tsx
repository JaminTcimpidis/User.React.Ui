import React from 'react'
import './technology.scss';
import mongo_db from '../assets/mongodb_logo.png';
import dotnet_core from '../assets/dotnet_core_logo.png';
import oauth_2_logo from '../assets/oauth_2_logo.png';
import react_logo from '../assets/react_logo.png';
import redux_logo from '../assets/redux_logo.png';
import sql from '../assets/sql_logo.png';

export const TechnologyComponent = () => {
  return (
    <section className="technology">
      <div>
        <h3 className="technology-header">Technologies</h3>
        <strong>I am well versed in the following, plus many more.</strong>
      </div>
      <div className="image-container">
        <img className="image"
        src={oauth_2_logo}
        alt="oauth"
        height={215}
        width={215}>
        </img>
        <img className="image"
        src={react_logo}
        alt="react"
        height={215}
        width={215}>
        </img>
        <img className="image"
        src={dotnet_core}
        alt="dotnet"
        height={215}
        width={215}>
        </img>
        <img className="image"
        src={redux_logo}
        alt="redux"
        height={215}
        width={215}>
        </img>
        <img className="image"
        height={215}
        width={215}
        src={mongo_db}
        alt="mongo">
        </img>
        <img className="image"
        height={215}
        width={215}
        src={sql}
        alt="sql">
        </img>
      </div>
    </section>
  )
}