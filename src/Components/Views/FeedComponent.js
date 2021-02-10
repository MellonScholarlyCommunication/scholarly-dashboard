import React from 'react';
const FeedComponent = (props) => {
  const webId = props.selectedWebId || props.webId

  return (
    <div id="feedcomponent" className='container'>
      <h4> Feed </h4>
      <br />
      This component shows the activities for which notifications have been received based on the ActivityPub protocol.
      The goal is for users to subscribe to services (follow certain topics such as linked data, Ugent papers, ...), 
      hosted by different organisations (Ugent, VUB, researchweb?, ...) and see the resulting feed
    </div>
  )
}


export default FeedComponent