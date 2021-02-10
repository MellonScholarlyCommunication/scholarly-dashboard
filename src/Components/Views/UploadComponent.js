import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'
import { Select, MenuItem, Grid, IconButton } from '@material-ui/core'
import { Button, Row, Col } from 'react-bootstrap'
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import ProfileCardComponent from '../ProfileCardComponent';
import useProfile from '../../hooks/useProfile';
import ProfileCardSelectorComponent from '../ProfileCardSelectorComponent';
import ProfileCardErrorWrapper from '../ProfileCardErrorWrapper';
import { fetchProfile, createCollection } from '../../util/MellonUtils/profile';
import { uploadDocument, getDocumentsCollection } from '../../util/MellonUtils/documents'
import { getBaseIRI, availableViews, routeViewWithParams } from '../../util/Util';
import { useHistory } from "react-router-dom";

const UploadComponent = (props) => {
  const webId = props.selectedWebId || props.webId
  const history = useHistory();
  const defaultlocation = props.webId ? getBaseIRI(props.webId) + 'public/' : null

  const { register, handleSubmit, control, reset, watch } = useForm({ defaultValues: {
    file: null,
    title: null,
    date: new Date().toISOString().substr(0,10),
    abstract: null,
    location: defaultlocation
  } })

  useEffect(() => {
    const defaultlocation = props.webId ? getBaseIRI(props.webId) + 'public/' : null
    reset({
      file: null,
      title: null,
      date: new Date().toISOString().substr(0,10),
      abstract: null,
      location: defaultlocation
    });
  }, [props.webId]);

  const {
    fields: keywordsfields,
    append: keywordsappend,
    remove: keywordsremove
  } = useFieldArray({ control, name: "keywords" });
  const {
    fields: authorsfields,
    append: authorsappend,
    remove: authorsremove
  } = useFieldArray({ control, name: "authors" });

  // Set initial fields
  if (keywordsfields.length === 0) keywordsappend({val: ''});
  if (authorsfields.length === 0) authorsappend({webId: ''});

  const onSubmit = async (submission) => {
    // Clean up upload object
    console.log('trying to submit', submission)
    submission.authors = submission.authors.map(a => a.webId).filter(a => !!a)
    submission.keywords = submission.authors.map(k => k.val).filter(k => !!k)
    submission.file = submission.file[0]
    if (await validateSubmission(submission)) {
      if (!props.webId) window.alert('There seems to be an issue with retrieving your pod information. Please refresh the page and try again.')
      await checkAndInitializeCollection(props.webId)
      try { 
          const documentId = await uploadDocument(submission, props.webId);
          const route = routeViewWithParams(availableViews.documentinfo, {documentId: documentId})
          history.push(route);
      } catch (e) {
        window.alert(e)
      }
    }
  }
  
  const Profile = ({control, index}) => {
    const value = useWatch({
      control,
      name: `authors[${index}].webId`
    })
    return (<ProfileCardErrorWrapper webIdInput={value} />)
  }

  const checkAndInitializeCollection = async(webId) => {
    const collection = await getDocumentsCollection(webId)
    if (!collection) {
      await createCollection(webId)
    }
  }

  const validateSubmission = async (submission) => {
    if (!submission.file) {
      window.alert('Please select a file to upload.')
      return false;
    }
    if (!submission.title) {
      window.alert('Please enter a title for your publication.')
      return false;
    }
    if (!submission.date) {
      window.alert('Please enter a valid date for your publication.')
      return false;
    }
    if (!submission.authors || !submission.authors.length) {
      window.alert('Please enter one or more valid authors for your publication.')
      return false;
    }
    for (let author of submission.authors) {
      const profile = await fetchProfile(author)
      if (!profile || !profile.name) {
        window.alert(`${author} does not reference a valid profile.`)
        return false;
      }
    }
    if (!submission.abstract) {
      window.alert('Please enter the abstract of the publication.')
      return false;
    }
    if (!submission.location) {
      window.alert('Please enter a valid location to upload the publication to.')
      return false;
    }
    return true;
  }

  return (
    <div id="uploadcomponent" className='container'>
      <h4> Upload </h4>
      <br />
      <form onSubmit={handleSubmit(onSubmit)}>

      <Row className='propertyview ' key={'File'}>
        <Col md={3}><label className="leftaligntext"><b>File</b></label></Col>
        <Col md={8}> <input className='leftaligntext inputfield' name='file' type="file" ref={register({ required: true })} /></Col> 
      </Row> 

      <Row className='propertyview ' key={'Title'}>
        <Col md={3}><label className="leftaligntext"><b>Title</b></label></Col>
        <Col md={8}><input className='leftaligntext inputfield' name='title' ref={register({ required: true })} /></Col> 
      </Row> 


      {/* TODO:: jump on enters */}
      {keywordsfields.map(({ val }, index) => (
        index === 0 
        ? <Row className='propertyview ' key={'Keywords'+index} style={{'marginTop': 0, 'marginBottom': 0}}>
            <Col md={3}> <label className="leftaligntext"><b>Keywords</b></label> </Col>
            <Col md={8}> <input className='leftaligntext inputfield' key={'keyword'+index} name={`keywords[${index}].val`} ref={register()} /> </Col>
            <Col md={1}> <IconButton disabled type="button"><CloseIcon style={{color: 'white'}} /></IconButton> </Col> {/* fix margins */}
          </Row>
        : <Row className='propertyview ' key={'Keywords'+index} style={{'marginTop': 0, 'marginBottom': 0}}>
            <Col md={3} />
            <Col md={8}> <input className='leftaligntext inputfield' key={'keyword'+index} name={`keywords[${index}].val`} ref={register()} /> </Col>
            <Col md={1}> <IconButton type="button" onClick={() => keywordsremove(index)}><CloseIcon style={{color: 'red'}} /></IconButton> </Col>
          </Row>
      ))}
      <Row> <Col md={3} /> <Col md={1}> <IconButton type="button" onClick={() => keywordsappend({val: ''})}><AddIcon style={{color: 'lightgreen'}} /></IconButton> </Col> </Row>

      <Row className='propertyview ' key={'Date'}>
        <Col md={3}><label className="leftaligntext"><b>Date</b></label></Col>
        <Col md={8}><input className='leftaligntext inputfield' type='date' name='date' ref={register({ required: true })} /></Col> 
      </Row>  

      {/* TODO:: jump on enters */}
      {authorsfields.map(({ webId }, index) => (
        index === 0 
        ? <Row className='propertyview ' key={'Authors'+index} style={{'marginTop': 0, 'marginBottom': 0}}>
            <Col md={3}> <label className="leftaligntext"><b>Authors</b></label> </Col>
            <Col md={8}> <input className='leftaligntext inputfield' key={'author'+index} name={`authors[${index}].webId`} ref={register()} /> </Col>
            <Col md={1}> <IconButton disabled type="button"><CloseIcon style={{color: 'white'}} /></IconButton> </Col> {/* fix margins */}
            <Col md={3} />
            <Col md={8}><Profile control={control} index={index}/></Col>
          </Row>
        : <Row className='propertyview ' key={'Keywords'+index} style={{'marginTop': 0, 'marginBottom': 0}}>
            <Col md={3} />
            <Col md={8}> <input className='leftaligntext inputfield' key={'author'+index} name={`authors[${index}].webId`} ref={register()} /> </Col>
            <Col md={1}> <IconButton type="button" onClick={() => authorsremove(index)}><CloseIcon style={{color: 'red'}} /></IconButton> </Col>
            <Col md={3} />
            <Col md={8}><Profile control={control} index={index}/></Col>
          </Row>
      ))}
      <Row> <Col md={3} /> <Col md={1}> <IconButton type="button" onClick={() => authorsappend({webId:''})}><AddIcon style={{color: 'lightgreen'}} /></IconButton> </Col> </Row>

      <Row className='propertyview ' key={'Abstract'}>
        <Col md={3}><label className="leftaligntext"><b>Abstract</b></label></Col>
        <Col md={8}><textarea className='leftaligntext inputfield' name='abstract' ref={register({ required: true })} style={{'minHeight': '150px'}} /></Col> 
      </Row>  

      <Row className='propertyview ' key={'Upload location'}>
        <Col md={3}><label className="leftaligntext"><b>Upload location</b></label></Col>
        <Col md={8}><input className='leftaligntext inputfield' name='location' ref={register({ required: true })} /></Col> 
      </Row>  
      
      <br/>
      <Button type="submit">Submit</Button>
    </form>
    </div>
  )
}


export default UploadComponent