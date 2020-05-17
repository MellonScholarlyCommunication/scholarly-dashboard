import React, { useState } from 'react';
import "./MainContent.css"
import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';
import DocumentsView from './DocumentsView';
import InitializePaperCollectionComponent from "./InitializePaperCollectionComponent"



export default class CommentAddComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        selection: [],
        collection: false
    };
    this.initializedCollection = this.initializedCollection.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.cm = props.cm || new CommunicationManager(solid);
    this.update = this.update.bind(this);
  }

  componentDidMount(){
    this.update()
  }

  async update(){
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;

    let collection = await this.cm.getResearchPaperCollectionFromFile(webId);
    this.setState({collection: !!collection})
  }

  handleSelection(selection) {
    this.props.handleSelection(selection)
  }

  initializedCollection() {
    this.update()
  }


  render () {
    const view = this.state.collection ? <DocumentsView handleSelection={this.handleSelection} cm={this.cm} /> : <InitializePaperCollectionComponent cm={this.cm} />
    return (
      <div className="maincontent disable-scrollbars">
        {view}
      </div>  
    )
  }
}
