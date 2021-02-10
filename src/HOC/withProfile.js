import React, { useState, useEffect } from 'react';
import useProfile from '../hooks/useProfile';

const withProfile = (WrappedComponent) => 
  (props) => {
    const profile = useProfile(props.webId);
    return <WrappedComponent profile={profile} {...props}/>
  }

export default withProfile