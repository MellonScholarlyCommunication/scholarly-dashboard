import React, { useState, useEffect } from 'react';
import "../../css/DocumentsView.css"
import { getPublicationIds, getDocumentsCollection, getPublicationData } from '../../util/MellonUtils/documents';
import { useHistory } from "react-router-dom";
import ArtefactCard from 'Components/Documents/ArtefactCard';

const DocumentsViewerComponent = (props) => {
  const ownerWebId = props.selectedWebId || props.webId
  const [foundPublications, setFoundPublications] = useState([])

  useEffect(() => {
    if(!ownerWebId) return;
    let mounted = true;
    const f = async () => {
      const publications = []
      const publicationIds = await getPublicationIds(ownerWebId)
      for (let publicationId of publicationIds) {
        publications.push(new Promise((resolve, reject) => {
          getPublicationData(publicationId).then(publicationData => {
            publicationData.name = publicationData.title
            console.log('resolving', publicationData)
            resolve(publicationData)
          })
        }))
      }
      return await Promise.all(publications)
    }
    f().then(publications => {
      if (mounted) setFoundPublications(publications)
    })
    return () => mounted = false;
  }, [ownerWebId])

  console.log("foundPublications", foundPublications)



  return (
    <div id="documentscomponent" className='container'>
      <h4> Publications </h4>
      <br />
      {foundPublications.map(publicationData => {return (
        <ArtefactCard publicationData={publicationData} fields={['title', 'authors', 'abstract', 'keywords']} />
      )})}
    </div>
  )
}





export default DocumentsViewerComponent
