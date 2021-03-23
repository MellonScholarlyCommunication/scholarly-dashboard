import React, { useEffect, useState } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import CommentsSidebar from './CommentsSidebar'
import AccessController from './AccessController'
import ResourceMissingComponent from '../ResourceMissingComponent'
import { getPublicationIds, getDocumentMetadata, getPublicationData, retrieveLDESEvents } from '../../util/MellonUtils/documents'
import { IconButton } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom'
import { routeViewWithParams, availableViews } from '../../util/Util'

const DocumentInfoViewer = (props) => {
  const userwebId = props.webId
  const ownerWebId = props.selectedWebId || props.webId
  const publicationId = props.documentId
  const history = useHistory();

  const [publicationData, setPublicationData] = useState(null)
  const [publicationEvents, setPublicationEvents] = useState(null)

  // Todo:: streaming retrieval of resources
  useEffect(() => {
    if(!publicationId) return
    let mounted = true
    getPublicationData(publicationId).then(data => {
      if (mounted) setPublicationData(data)  
    })
  }, [publicationId])

  useEffect(() => {
    if (!publicationData || !publicationData.lifecycleEvents || !publicationData.lifecycleEvents[0]) return;
    let mounted = true
    retrieveLDESEvents(publicationData.lifecycleEvents[0]).then(events => {
      if (mounted) setPublicationEvents(events)  
    })
  }, [publicationData])


  const toPublications = () => {
    const params = props.selectedWebId ? {selectedWebId: props.selectedWebId} : {}
    const route = routeViewWithParams(availableViews.documents, params)
    history.push(route);
  }

  // TODO:: replace dependency on metadata file to check if document file exists
  if(!userwebId || !publicationId) return (
    <div id="documentinfoviewer" className='container'>
      <Col md={2}><IconButton onClick={toPublications}><ArrowBackIcon /></IconButton></Col>
      <ResourceMissingComponent />
    </div>
  )
  
  const getRepresentation = (key, publicationInfo) => {
    if(!key) return null
    switch (key) {
      case 'date':
        return publicationInfo[key].toLocaleString();
      default:
        return (
          Array.isArray(publicationInfo[key]) 
            ? publicationInfo[key].join(', ') 
            : publicationInfo[key] 
        )
    }
  }
  
  const openFile = () => publicationData.file && window.open(publicationData.file)

  return(
    <div id="documentinfoviewer" className='container'>
      <Row>
        <Col md={2}><IconButton onClick={toPublications}><ArrowBackIcon /></IconButton></Col>
        <Col md={2}><Button onClick={openFile}>Open File</Button></Col>

      </Row> 
      <Row>
        <Col md={6} sm={12}>
          {publicationData && ['title', 'date', 'authors', 'keywords', 'abstract'].map(key => 
            <Row className='' key={key} style={{height: 'auto'}}>
              <Col md={3}><label className='leftaligntext'>{key}</label></Col>
              <Col md={9}><label className='leftaligntext'>{getRepresentation(key, publicationData)}</label></Col>
            </Row>
          )}
          <br />
          <br />
          <AccessController webId={userwebId} documentId={publicationData} />
        </Col>
        <Col md={6} sm={12}>
          <CommentsSidebar webId={userwebId} documentId={publicationData} />
        </Col>
      </Row>
    </div>
  )
}

export default DocumentInfoViewer