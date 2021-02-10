import React, { useState, useEffect } from 'react';
import useDocumentMetadata from '../hooks/useProfile';

const withDocumentMetadata = (WrappedComponent) => 
  (props) => {
    const metadata = props.metadataId && useDocumentMetadata(props.webId);
    return <WrappedComponent metadata={metadata} {...props}/>
  }

export default withDocumentMetadata