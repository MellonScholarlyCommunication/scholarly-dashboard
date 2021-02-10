import React, { useState } from 'react';
import { getValArray } from '../../singletons/QueryEngine';
import useProfile from '../../hooks/useProfile';
import Grid from '@material-ui/core/Grid';
import ProfileCardComponent from '../ProfileCardComponent';
import ProfileCardSelectorComponent from '../ProfileCardSelectorComponent';
import ProfileMissing from '../FallBacks/ProfileMissing';

const ContactsComponent = (props) => {
  const webId = props.selectedWebId || props.webId
  const profile = useProfile(webId)
  const contacts = profile ? profile.contacts : []
  // const contacts = getValArray(webId, )
  console.log('CONTACTS', profile)

  if (!profile) return (<ProfileMissing webId={webId} />)
  return (
    <div id="contactscomponent" className='container'>
      <h4> Following </h4>
      <br />
      <ProfileCardSelectorComponent webId={webId}/>
      <br />
      <Grid container spacing={3}>
        {contacts && contacts.length 
          ? contacts.map(contact => 
          <Grid item xs={12} md={6} key={contact}>
            <ProfileCardComponent webId={props.webId} profileWebId={contact} showButtons={true} />
          </Grid>)
          : <p>{`There are currently no contacts for ${webId}.`}</p>
        }
      </Grid>
      
    </div>
  )
}


export default ContactsComponent