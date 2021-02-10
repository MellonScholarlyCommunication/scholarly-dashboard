import React, { useState, useEffect } from 'react';
import "./CommentAddComponent.css"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { createAndPostComment } from '../../util/MellonUtils/documents'
import { useForm } from 'react-hook-form';
import { getBaseIRI, routeViewWithParams, availableViews } from '../../util/Util';
import { Button } from 'react-bootstrap';
import ns from '../../util/NameSpaces';

const DEFAULTCOMMENTSFOLDER = 'public/'


const CommentAddComponent = (props) => {
  const defaultlocation = props.webId ? getBaseIRI(props.webId) + DEFAULTCOMMENTSFOLDER : null

  const { register, handleSubmit, control, reset, watch } = useForm({ defaultValues: {
    comment: '',
    location: defaultlocation
  } })

  const onSubmit = async (data) => {
    console.log('handle submit', data)
    const commentData = {
      type: ns.sioc('Post'),
      content: data.comment,
      reply_of: props.documentId,
      created_at: new Date().toISOString(),
      has_creator: props.webId,
      note: 'This post was created using the Mellon web application.',
      location: data.location,
      documentId: props.documentId
    }

    if (!props.metadataId) {
      window.alert('Could not retrieve document metadata file.')
      return
    }
    const submitted = await createAndPostComment(props.webId, commentData, props.metadataId)

    if (! submitted) {
      window.alert('Something went wrong while trying to upload your comment.')
    }

    reset({
      comment: '',
      location: defaultlocation
    });
  }

  useEffect(() => {
    const defaultlocation = props.webId ? getBaseIRI(props.webId) + DEFAULTCOMMENTSFOLDER : null
    reset({
      comment: '',
      location: defaultlocation
    });
  }, [props.webId]);

  return (
    <div className="commentaddcontainer">

      <form onSubmit={handleSubmit(onSubmit)}>

        <Row className='' key={'comment'}>
          <Col md={12}><label className="leftaligntext"><b>Comment</b></label></Col>
        </Row>
        <Row>
          <Col md={12}><textarea className='leftaligntext inputfield' name='comment' ref={register({ required: true })} style={{'minHeight': '70px'}} /></Col> 
        </Row>
        <br />
        <Row className='' key={'storagefolder'}>
          <Col sm={12} md={3}><label className="leftaligntext"><b>Storage location</b></label></Col>
          <Col sm={12} md={9}> <input className='leftaligntext inputfield' name='location' type="text" ref={register({ required: true })} /></Col> 
        </Row>
        <br/>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}

export default CommentAddComponent