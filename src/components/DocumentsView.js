// Import React as usual
import React from 'react';

// Import Chonky
import 'chonky/style/main.css';
import {FileBrowser, FileView} from 'chonky';

import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';
import InitializePaperCollectionComponent from "./InitializePaperCollectionComponent"

import "./DocumentsView.css"


export default class DocumentsView extends React.Component {
    constructor(props) {
        super(props);

        this.cm = props.cm || new CommunicationManager(solid);
        this.fileData = new Map()
        this.webId = ""
        this.state = {
            searchId: "",
            files: [],
            collection: false
        };

        this.chonkyRef = React.createRef();
        this.handleSelectionChange = this.handleSelectionChange.bind(this)
        this.changeSearchId = this.changeSearchId.bind(this)
        this.updateSearchId = this.updateSearchId.bind(this)
        this.initializedCollection = this.initializedCollection.bind(this)

    }

    componentDidMount(){
      this.asyncInit();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.selectFile !== this.props.selectFile) {
        // Update files first because this probably get's called when new file uploaded
        this.updateSearchId(() => this.selectFile(this.props.selectFile));
      }
    }

    async asyncInit() {
      const session = await solid.currentSession()
      if(!session) return
      this.webId = session.webId
      if(! this.webId) return;
      let collection = await this.cm.getResearchPaperCollectionFromFile(this.webId);
      this.setState({searchId: this.webId, collection: !!collection})
      this.asyncUpdate(this.state.searchId);
    }

    async asyncUpdate(searchId, afterUpdateCallback = () => {}){
      console.log("getting", this.state, this.webId)
      if(!this.state.collection) return;
      const webId = searchId || this.webId
      const fileData = new Map();
      let documents = await this.cm.getResearchPapers(webId);
      if(!documents || documents.length === 0) {
        this.setState({files: []})
        return;
      }
      for (let document of documents) {
        fileData.set(document.id, document)
        document.name = document.id.split("/").slice(document.id.split("/").length-1)[0]
        document.ext = document.id.split(".")[document.id.split(".").length-1]
      }
      console.log(documents)
      this.fileData = fileData;
      this.setState({files: documents}, afterUpdateCallback);
    }

    selectFile(fileURI) {
      let selection = {};
      for (let file of this.state.files) {
        if (file.id === fileURI) {
          selection[fileURI] = true;
          this.chonkyRef.current.setSelection(selection);
          return;
        }
      }
    }

    handleSelectionChange = (selection) => {
      // Workaround because the component allows for more that 1 file to be` selected at a time
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
        documentSelection[documentId] = this.fileData.get(documentId)
      }
      this.props.handleSelection(documentSelection)
    };

    changeSearchId(e){
      console.log("updating search id", e.target.value)
      this.setState({searchId: e.target.value})
    }

    updateSearchId(afterUpdateCallback = () => {}){
      this.asyncUpdate(this.state.searchId, afterUpdateCallback)
    }

    initializedCollection() {
      this.asyncInit()
    }

    render() {
      const {files} = this.state;

      console.log("RENDERING FILES", files)

      if(!this.state.collection) {
        return( <InitializePaperCollectionComponent cm={this.cm} initializedCollection={this.initializedCollection}/> )
      }

      return (
        <div className="documentsviewcontainer disable-scrollbars">
          <FileBrowser ref={this.chonkyRef}
            files={files} view={FileView.SmallThumbs}initializedCollection
            onSelectionChange={this.handleSelectionChange}/>
          <div className="refreshDivButton" onClick={() => {this.updateSearchId()}}> Go </div>
          <input className="searchLocation" value={this.state.searchId} onChange={this.changeSearchId} />
        </div>
      )
    }
}