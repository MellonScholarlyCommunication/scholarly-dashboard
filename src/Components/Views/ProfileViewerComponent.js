import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading';
import '../../css/VCardComponent.css'


import { Button, Row, Col } from 'react-bootstrap'


import useProfile from '../../hooks/useProfile'
import { availableViews, formatDate } from '../../util/Util';
import ns from '../../util/NameSpaces';
import withProfile from '../../HOC/withProfile';

import { useLiveUpdate } from '@solid/react';
const { default: data } = require('@solid/query-ldflex');

const UNKNOWNVALUE = 'Value not set'

const ProfileViewerComponent = (props) => {
  const webId = props.selectedWebId || props.webId
  const profile = useProfile(webId)
  console.log('profile', profile)

  if (! profile){
    return (
      <div id="profileviewercomponent" className='container'>
        <h4> Profile </h4>
        <br />
        <ReactLoading type={"cubes"}/>
      </div>
    )
  } 

  return (
    <div id="profileviewercomponent" className='container'>
      <h4> Profile </h4>
      <br />
      {Object.keys(profileProps).map(property => {
        const value = profile[property] && (property === 'bdate' ? formatDate(profile[property]) : profile[property])
        return (
          <Row className='propertyview ' key={property}>
            <Col md={3}><label className="leftaligntext"><b>{profileProps[property]}</b></label></Col>
            <Col md={9}><label className="leftaligntext">{value || UNKNOWNVALUE}</label></Col>
          </Row>  
        )
      })}
      <br />
      <br />
      <Row>
        <Col md={2}><Button onClick={() => {navigator.clipboard.writeText(webId)}}>copy webId</Button></Col>
        <Col md={3}></Col>
        { webId && webId === props.webId && <Col md={2}><Button onClick={() => props.setview(availableViews.profileeditor)}>Edit</Button></Col> }
      </Row>
      
      
    </div>
  )
}

const profileProps = {
  name: "Name",
  bdate: "BirthDate",
  location: "Country",
  // cstatus: "Civil Status",
}

export default ProfileViewerComponent