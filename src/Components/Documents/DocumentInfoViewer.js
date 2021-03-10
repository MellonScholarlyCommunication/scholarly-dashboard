import React, { useEffect, useState } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import CommentsSidebar from './CommentsSidebar'
import AccessController from './AccessController'
import ResourceMissingComponent from '../ResourceMissingComponent'
import { getDocumentAndMetadataIds, getDocumentMetadata } from '../../util/MellonUtils/documents'
import { getVal } from '../../singletons/QueryEngine'
import { IconButton } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom'
import { routeViewWithParams, availableViews } from '../../util/Util'
import { getFile, parse_link_header } from '../../util/FileUtil'

const DocumentInfoViewer = (props) => {
  const webId = props.selectedWebId || props.webId
  const documentId = props.documentId
  const history = useHistory();
  console.log('PROFPS', props)

  const [metadataId, setMetadataId] = useState(null)
  const [metadata, setMetadata] = useState(null)

  useEffect(() => {
    let mounted = true;
    if (!webId || !documentId) return;
    getDocumentAndMetadataIds(webId).then(data => {
      const entry = data.filter(d => d.id === documentId)
      if (entry.length === 1) {
        if (mounted) setMetadataId(entry[0].metadataId)
      }
    })
    return () => mounted = false
  }, [webId, documentId])


  useEffect(() => {
    if (!metadataId) return;
    let mounted = true;
    if (!webId || !documentId) return;
    getDocumentMetadata(documentId, metadataId).then(metadata => {
     if (mounted && metadata) {console.log('setting metadata', metadata);  setMetadata(metadata)}
    })
    return () => mounted = false
  }, [metadataId, documentId, webId])

  console.log('metadata', metadataId, metadata)

  const toPublications = () => {
    const params = props.selectedWebId ? {selectedWebId: props.selectedWebId} : {}
    const route = routeViewWithParams(availableViews.documents, params)
    history.push(route);
  }

  // TODO:: replace dependency on metadata file to check if document file exists
  if(!webId || !documentId || !metadataId) return (
    <div id="documentinfoviewer" className='container'>
      <Col md={2}><IconButton onClick={toPublications}><ArrowBackIcon /></IconButton></Col>
      <ResourceMissingComponent />
    </div>
  )
  
  const getRepresentation = (key, metadata) => {
    if(!key) return null
    switch (key) {
      case 'date':
        return metadata[key].toLocaleString();
      default:
        return (
          Array.isArray(metadata[key]) 
            ? metadata[key].join(', ') 
            : metadata[key] 
        )
    }
  }
  
  const openFile = () => {
    if(!documentId) return;
    getFile(documentId).then(result => {
      console.log('result', result)
      console.log('parsed', parse_link_header(result))
    })
  
  }

  // const openFile = () => documentId && window.open(documentId)

  return(
    <div id="documentinfoviewer" className='container'>
      <Row>
        <Col md={2}><IconButton onClick={toPublications}><ArrowBackIcon /></IconButton></Col>
        <Col md={2}><Button onClick={openFile}>Open File</Button></Col>

      </Row> 
      <Row>
        <Col md={6} sm={12}>
          {metadata && ['title', 'date', 'authors', 'keywords', 'abstract'].map(key => 
            <Row className='' key={key} style={{height: 'auto'}}>
              <Col md={3}><label className='leftaligntext'>{key}</label></Col>
              <Col md={9}><label className='leftaligntext'>{getRepresentation(key, metadata)}</label></Col>
            </Row>
          )}
          <br />
          <br />
          <AccessController webId={webId} documentId={documentId} metadataId={metadataId} />
        </Col>
        <Col md={6} sm={12}>
          <CommentsSidebar webId={webId} documentId={documentId} metadataId={metadataId} />
        </Col>
      </Row>
    </div>
  )
}

export default DocumentInfoViewer