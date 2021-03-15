import useProfile from 'hooks/useProfile';
import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { Row, Col, Button } from 'react-bootstrap'
import { getPublicationData } from 'util/MellonUtils/documents';
import { availableViews, routeViewWithParams } from '../../util/Util';
import styles from '../../css/components/profilecard.module.css'

const ArtefactCard = (props) => {
  const publicationData = props.publicationData

  // prepare history to route on document info view
  const history = useHistory();

  const getStrVal = (key, value) => {
    switch (key) {
      case 'date':
        return (new Date(value)).toLocaleString()
      case 'authors':
        return (<a href={value}><ProfileNameView webId={value}/></a>)
      default:
        return value
    }
  }

  const openFile = () => publicationData.file && window.open(publicationData.file)

  const getOverview = () => {
    const route = routeViewWithParams(availableViews.documentinfo, {documentId: publicationData.id})
    history.push(route);
  }

  const fields = props.fields || ['id', 'type', 'title', 'date', 'authors', 'keywords', 'abstract']
  return (
    <div id="artefactcard" className={styles.container} key={"artefactcard"+publicationData.id}>
      <Row>
        <Col md={2}>
          <Button style={{"width": "100%"}} onClick={getOverview}>Overview</Button>
        </Col>
        <Col md={2}>
          <Button style={{"width": "100%"}} onClick={openFile}>Open File</Button>
        </Col>
        
      </Row>
      {publicationData && fields.map(key => 
          (Array.isArray(publicationData[key]) ? publicationData[key] : [ publicationData[key] ]).map((value, index) =>
            <Row className={`propertyview ${styles.profilecardrow}`} key={key+value}>
              <Col md={2}><label className='leftaligntext'><b>{index === 0 ? key : ''}</b></label></Col>
              <Col md={10}><label className='leftaligntext'>{getStrVal(key, value)}</label></Col>
            </Row>
          )
        )}
    </div>
  )
}

const ProfileNameView = (props) => {
  const userProfile = useProfile(props.webId)
  return (<div>{userProfile ? userProfile.name || props.webId : props.webId}</div>)
}

export default ArtefactCard
