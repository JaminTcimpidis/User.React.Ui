import React from 'react'
import profile from '../assets/profile_1.png';
import './profile.scss'

export const ProfileComponent = () => {
  return (
    <section className="profile">
      <div className="profile-container">
        <div className="profile-bio">
          <strong className="name">I'm Jamin.</strong>
          <div>
            <span>I have seven years or technical experience in the logistical space with C.H.Robinson. I'm well versed in working within large, intricate data systems. </span>
          </div>
          <div>
          <ul><strong className="skill-header">Skills:</strong>
            <li className="skill-item">Event driven architecture</li>
            <li className="skill-item">Microsite architecture</li>
            <li className="skill-item">Agile methodolgy</li>
            <li className="skill-item">Mentoring</li>
          </ul>
          </div>
        </div>
        <div className="profile-image">
          <img
            src={profile}
            alt="profile">
          </img>
        </div>
      </div>
    </section>
  )
}