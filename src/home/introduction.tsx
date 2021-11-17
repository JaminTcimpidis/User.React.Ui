import React from 'react';
import profile_1 from '../assets/profile_1.png'
import './introduction.scss'

export const IntroductionComponent = () => {
  const profileImage = (
    <div className="introduction-picture">
      <img src={profile_1} height={591} width={370}></img>
    </div>
  )
  const text = (
    <div className="introduction-bio">
      <div className="introduction-slogan">
        <strong>
          <span className="slogan-emphasis">Communicate </span>first,
          <span className="slogan-emphasis"> develop</span> second. Asking the right 
          <span className="slogan-emphasis"> questions</span> for the right 
          <span className="slogan-emphasis"> solutions</span>.
        </strong> 
      </div>
      <div className="introduction-pitch">
        Hire an developer who is passionate about keeping an open line of communication throughout the entire development process. The more we can know, the easier it is to build a solution that works for you. 
      </div>
    </div>
  )

  return (
    <section className="introduction">
      <div className="shape-bottom"data-negative="false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path className="shape" d="M0,6V0h1000v100L0,6z"></path>
        </svg>
      </div>
      <div className="introduction-container">
        {profileImage}
        {text}
      </div>
    </section>
  )
}