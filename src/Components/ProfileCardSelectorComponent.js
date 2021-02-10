import React, { useState, useEffect } from 'react'

import Input from '@material-ui/core/Input';
import AddIcon from '@material-ui/icons/Add';

import useProfile from '../hooks/useProfile'
import ProfileCardComponent from './ProfileCardComponent';
import { Row, Col } from 'react-bootstrap';
import ClearIcon from '@material-ui/icons/Clear';
import { IconButton, Tooltip } from '@material-ui/core';
import { followProfile } from '../util/MellonUtils/profile';

const ProfileCardSelectorComponent = (props) => {
  const [webIdInput, setWebIdInput] = useState('')

  const profile = useProfile(webIdInput)
  console.log('profile', webIdInput, profile)

  const webIdChangeHandler = (event) => {
    setWebIdInput(event.target.value)
  }

  const isProfile = (profile) => profile.name

  const warningStyle = {
    color: 'red',
  };

  function getWarnings(profile) {
    if(!profile || !isProfile(profile)) return webIdInput ? "Please enter a valid webId" : undefined
  }

  const warnings = getWarnings(profile)

  const follow = async () => {
    if (isProfile(profile)){
      try { 
        const result = await followProfile(props.webId, profile.id) 
        setWebIdInput('')
      }
      catch (e) { window.alert(e.message)}
    }
  }

  return (
    <div id="ProfileCardSelectorComponent">
      <Row className='propertyview ' key={"profileselect"}>
        <Col md={2}><label className="leftaligntext"><b>{'Follow'}</b></label></Col>
        <Col md={8}><Input className="leftaligntext" value={webIdInput || ''} placeholder="webId" name="location" onChange={webIdChangeHandler}/></Col>
        <Col md={2}><Tooltip title={'Follow webId'}><IconButton color="inherit" onClick={follow}><AddIcon /></IconButton></Tooltip></Col>
      </Row>
      {warnings && <b style={warningStyle}>{warnings}</b>}
      <Row className='propertyview ' key={"profileview"}>
        <Col md={2}></Col>
        <Col md={8}><ProfileCardComponent webId={props.webId} profileWebId={webIdInput} key={webIdInput}></ProfileCardComponent></Col>
      </Row>
    </div>
  )
}

export default ProfileCardSelectorComponent
