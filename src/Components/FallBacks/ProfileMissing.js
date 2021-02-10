import React from 'react'

const ProfileMissing = (props) => {
  return (
    <div id="profilemissingcomponent" className='container'>
      <h4> Contacts </h4>
      <br />
      <p>{`It seems that something went wrong while loading the profile for ${props.webId}.`}</p>
      <p>{`Please make sure that the correct permissions have been set for this profile.`}</p>
    </div>
  )
}

export default ProfileMissing