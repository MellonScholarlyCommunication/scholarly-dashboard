import React, {useEffect} from 'react'
import ReactLoading from 'react-loading';
import '../css/VCardComponent.css'

import { useForm, Controller } from 'react-hook-form'
import { patchFile } from '../util/FileUtil'
import { createDeleteInsertProfileDataQuery } from '../util/QueryUtil'
import { Select, MenuItem } from '@material-ui/core'
import { Button, Row, Col } from 'react-bootstrap'

import useProfile from '../hooks/useProfile'
import { availableViews } from '../util/Util';


const ProfileEditorComponent = (props) => {

  const profile = useProfile(props.webId)

  const { register, handleSubmit, control, reset } = useForm({ defaultValues: {} })

  const onSubmit = async newprofile => {
    patchFile(props.webId, await createDeleteInsertProfileDataQuery(props.webId, profile, newprofile))
    props.setview(availableViews.profile)
  }

  useEffect(() => {
    reset(profile)
  }, [profile])

  if (! profile){
    return (
      <div id="ProfileEditorComponent" className='container'>
        <h4> Profile </h4>
        <br />
        <ReactLoading type={"cubes"}/>
      </div>
    )
  } 

  const properties = [
    {label: 'Name',       name: 'name',       type: 'text',}, 
    {label: 'BirthDate',  name: 'bdate',      type: 'date',},
    {label: 'Country',    name: 'location',   type: 'text',},
  ]

  return (
    <div id="ProfileEditorComponent" className='container'>
      <h4> Profile </h4>
      <br />
      <form onSubmit={handleSubmit(onSubmit)}>
        {properties.map(prop => {
          return(
            <Row className='propertyview ' key={prop.name}>
              <Col md={3}><label className="leftaligntext"><b>{prop.label}</b></label></Col>
              {prop.controller
              ? <Col md={1}>{prop.controller}</Col>
              : <Col md={9}><input type={prop.type || 'text'} className='leftaligntext inputfield' name={prop.name} ref={register({ required: true })} /></Col> 
              }
            </Row>  
          )
        })}
        <br/>
        <br/>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  )
}

export default ProfileEditorComponent

// <h2>All friends</h2>
// <List src="[https://ruben.verborgh.org/profile/#me].friends.firstName"/>

// @prefix dbo: <http://dbpedia.org/ontology/>. dbo:birthDate, dbo:birthPlace