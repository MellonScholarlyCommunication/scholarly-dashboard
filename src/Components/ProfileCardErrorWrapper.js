import React, { useState, useEffect } from 'react'

import Input from '@material-ui/core/Input';
import AddIcon from '@material-ui/icons/Add';

import useProfile from '../hooks/useProfile'
import ProfileCardComponent from './ProfileCardComponent';
import { Row, Col } from 'react-bootstrap';
import ClearIcon from '@material-ui/icons/Clear';
import { IconButton, Tooltip } from '@material-ui/core';
import { followProfile, fetchProfile } from '../util/MellonUtils/profile';

const ProfileCardErrorWrapper = (props) => {

  const [profile, setprofile] = useState(null)

  useEffect(() => {
    let mounted = true;
    const fetchAndSetProfile = async () => {
      if (mounted) {
        const fetched = await fetchProfile(props.webIdInput)
        console.log('fetched', fetched)
        if (mounted && fetched && fetched.name) setprofile(fetched)
      }
    }
    let timer = setTimeout(() => fetchAndSetProfile(), 800)
    return () => { clearTimeout(timer); mounted = false; }
  }, [props.webIdInput])

  function getWarnings(profile) {
    if(!profile || !profile.name) return props.webIdInput ? "Please enter a valid webId" : undefined
  }
  const warnings = getWarnings(profile)
  if(!profile) return (
    <div id="ProfileCardErrorWrapper">
      {warnings && <b style={{color: 'red'}}>{warnings}</b>}
    </div>
  )
  return (
    <div id="ProfileCardErrorWrapper">
      {warnings && <b style={{color: 'red'}}>{warnings}</b>}
      <Row className='propertyview ' key={"profileview"}>
        <Col md={2}></Col>
        <Col md={8}><ProfileCardComponent webId={props.webId} profileWebId={props.webIdInput} key={props.webIdInput} showButtons={false}></ProfileCardComponent></Col>
      </Row>
    </div>
  )
}

export default ProfileCardErrorWrapper
