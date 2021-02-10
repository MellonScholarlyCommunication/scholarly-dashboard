import React, { useState, useEffect } from 'react';
// Import Chonky
import 'chonky/style/main.css';
import {FileBrowser, FileView, FileToolbar, FileSearch, FileList} from 'chonky';
import "../../css/DocumentsView.css"
import { getDocumentAndMetadataIds, getDocumentsCollection } from '../../util/MellonUtils/documents';
import { availableViews, routeViewWithParams } from '../../util/Util';
import { useHistory } from "react-router-dom";

const DocumentsViewerComponent = (props) => {
  const webId = props.selectedWebId || props.webId
  const history = useHistory();
  const [documentsMetadata, setdocumentsMetadata] = useState([])

  console.log('documentsMetadata', documentsMetadata)
  useEffect(() => {
    if(!webId) return;
    let mounted = true;
    getDocumentAndMetadataIds(webId).then(documentsData => {
      // TODO:: replace this by title from .meta file 
      documentsData = documentsData.map(obj => { obj.name = obj.id.split('/')[obj.id.split('/').length - 1]; return(obj) })
      if(mounted && documentsData && documentsData.length) setdocumentsMetadata(documentsData)
    })
    return () => {
      mounted = false;
    }
  }, [webId])
  
  //TODO:: fix in case of multiple selection, can only handle 1 at a time
  const handleAction = (action, data) => {
    console.log('data', data)
    if (data.actionId === "open_files") {
      if (webId && data && data.target && data.target.id) {
        const route = routeViewWithParams(availableViews.documentinfo, {documentId: data.target.id})
        history.push(route);
      } else {
        window.alert('Could not retrieve document location. Please try again.')
      }
    }
  }


  /**
   * TODO:: Fetch paper metadata file???
   */


  return (
    <div id="documentscomponent" className='container'>
      <h4> Documents </h4>
      <br />
      <p>Doube click file to see file information. Will probably subsitute this directory view to a list based view on the available publications</p>
      <FileBrowser files={documentsMetadata} onFileAction={handleAction}>
          <FileToolbar />
          <FileSearch />
          <FileList />
      </FileBrowser>
    </div>
  )
}


export default DocumentsViewerComponent



  // const folderChain = React.useMemo( () => [ { id: 'xXre', name: 'Publications' }, ], [] );
  // <FileBrowser files={files} folderChain={folderChain}>
