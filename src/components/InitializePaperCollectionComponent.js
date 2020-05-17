import React, { useState } from 'react';
import "./MainContent.css"
import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';
import DocumentsView from './DocumentsView';



export default class InitializePaperCollectionComponent extends React.Component {
  
  constructor(props){
    super(props)
    this.cm = props.cm || new CommunicationManager(solid)
  }

  async initializeCollection() {
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;

    await this.cm.initializeResearchPaperStorage(
      webId
    );
    this.props.initializedCollection()
  }


  render () {
    return (
      <button onClick={this.initializeCollection}>Initialize collection to store research papers</button>
    )
  }
}





    // let collection = await this.commsManager.getResearchPaperCollectionFromFile(
    //   userWebId
    // );

    // if (!collection) {
    //   console.error(
    //     "The user has not yet initialized a collection to store research papers."
    //   );
    //   return;
    // }
