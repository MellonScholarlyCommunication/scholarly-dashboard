import React, { useState } from 'react'
import ReactLoading from 'react-loading';
import { LiveUpdate } from '@solid/react';
import { withWebId } from '@inrupt/solid-react-components'

const withContent = (initview) =>   
  withWebId((props) => {
    const [view, setview] = useState(initview)
    const selectedWebId = new URLSearchParams(props.location.search+props.location.hash).get("selectedWebId")
    const documentId = new URLSearchParams(props.location.search+props.location.hash).get("documentId")
    const newProps = {...props, setview, selectedWebId, documentId}
    const component = view.generation(newProps)
    
    return (
      <div id="mainscreencontainer" className='container'>
        <LiveUpdate>
          {component}
        </LiveUpdate>
      </div>
    )
})

export default withContent
