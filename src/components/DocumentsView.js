// Import React as usual
import React from 'react';

// Import Chonky
import 'chonky/style/main.css';
import {FileBrowser, FileView} from 'chonky';

import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';

import "./DocumentsView.css"


export default class DocumentsView extends React.Component {
    constructor(props) {
        super(props);

        this.cm = props.cm || new CommunicationManager(solid);
        const files = [];
        this.state = {
            files: files,
            fileData: new Map()
        };
        this.chonkyRef = React.createRef();
        this.handleSelectionChange = this.handleSelectionChange.bind(this)
    }
    componentDidMount(){
      this.asyncUpdate();
    }
  
    async asyncUpdate(){
      const session = await solid.currentSession()
      const webId = session.webId
      console.log("webId", webId)
      const fileData = new Map();
      if(webId && await solid.currentSession()) {
        let documents = await this.cm.getResearchPapers(webId);
        for (let document of documents) {
          fileData.set(document.id, document)
          document.name = document.title || document.id.split["/"].slice(document.id.split["/"].length-1).split(".")[0]
          document.ext = document.id.split(".")[document.id.split(".").length-1]
        }
        console.log(documents)
        this.setState({files: documents, fileData: fileData})
      } 
    }

    handleSelectionChange = (selection) => {
      // Workaround because the component allows for more that 1 file to be selected at a time
      if(Object.keys(selection).length > 1) {
        let keys = Object.keys(selection)
        for (let key of keys.slice(1)){
          delete selection[key]
        }
        this.chonkyRef.current.setSelection(selection)
        return
      }
      const documentSelection = {}
      for (let documentId of Object.keys(selection)){
        documentSelection[documentId] = this.state.fileData.get(documentId)
      }
      this.props.handleSelection(documentSelection)
    };

    render() {
      const {files} = this.state;

      return (
        <div className="documentsviewcontainer disable-scrollbars">
          <FileBrowser ref={this.chonkyRef}
            files={files} view={FileView.SmallThumbs}
            onSelectionChange={this.handleSelectionChange}/>
          <div className="refreshDivButton" onClick={() => {this.asyncUpdate()}}>Refresh</div>
        </div>
      )
    }
}