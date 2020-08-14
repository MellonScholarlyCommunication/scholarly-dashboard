import React, { useState } from 'react';
import "./MainContent.css"
import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';
import DocumentsView from './DocumentsView';



export default class MainContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        selection: []
    };
    this.handleSelection = this.handleSelection.bind(this);
    this.cm = props.cm || new CommunicationManager(solid);
  }

  handleSelection(selection) {
    this.props.handleSelection(selection)
  }


  render () {
    const view = <DocumentsView handleSelection={this.handleSelection} cm={this.cm} selectFile={this.props.selectFile} />
    return (
      <div className="maincontent">
        {view}
      </div>
    )
  }
}
