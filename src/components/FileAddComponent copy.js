import React, { useState } from 'react';
import "./MainContent.css"
import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';
import DocumentsView from './DocumentsView';
import InitializePaperCollectionComponent from "./InitializePaperCollectionComponent"
import { FilePicker } from 'react-file-picker-preview';
import NotificationHandler from 'util/NotificationHandler';



export default class CommentAddComponent extends React.Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.cm = props.cm || new CommunicationManager(solid);
    this.notificationHandler = new NotificationHandler();
    this.state = {
      file: {},
      reset: {},
    }
   
  }

  componentDidMount(){
    this.update()
  }

  async update(){
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;
  }

  initializedCollection() {
    this.update()
  }


  getPaperTitle() {
    return this.paperMetadata
      ? this.paperMetadata.title || this.paperMetadata.id
      : "";
  }

  async submit() {
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;
    const paperId = this.paperId;
    const paperMetadata = this.paperMetadata;
    console.log(
      "PAPERMETADATA",
      paperMetadata && paperMetadata.metadatalocation
    );
    const commsManager = this.commsManager;
    if (
      !this.notificationHandler ||
      !webId ||
      !paperId ||
      !commsManager ||
      !paperMetadata
    ) {
      console.error("Comment add component not initialized correctly");
      return;
    }
    const commentMetadata = {
      text: this.comment,
      publisherId: webId,
      documentId: paperId,
      commentLocation: this.commentDir || ""
    };

    const publisherInbox = await this.notificationHandler.discoverInboxUri(
      paperMetadata.publisher
    );

    let inboxes = paperMetadata.publisher ? [paperMetadata.publisher] : [];

    let notification = await commsManager.addComment(
      commentMetadata,
      paperMetadata,
      inboxes
    );
    console.log("Notification", notification);

    for (let inbox of inboxes) {
      console.log("inbox", inbox);
      this.notificationHandler
        .discoverInboxUri(inbox)
        .then((foundinbox) => {
          foundinbox = foundinbox || inbox;
          this.notificationHandler &&
            this.notificationHandler.send(foundinbox, notification);
        });
    }
    this.clean();
  }

  clean() {
    this.comment = "";
    this.paperId = null;
    this.paperMetadata = null;
  }


  render () {
    const { file } = this.state;
    return (
      <div className="commentaddcontainer">
        <div>
          <div onClick={() => {
            this.setState({ reset: Object.assign({}) })
          }}>Clear the picker</div>
          <FilePicker
            className="button"
            maxSize={2}
            buttonText="Upload a file!"
            extensions={[]}
            onChange={(file) => this.setState({ file })}
            onError={error => { alert("that's an error: " + error) }}
            onClear={() => this.setState({ file: {} })}
            triggerReset={this.state.reset}
          >
            <div className="input-button" type="button">
              The file picker
            </div>
          </FilePicker>
      </div>
    </div>  
    )
  }
}

// <div className="file-details">
// <h3>The file</h3>
// <h4>Name: {file.name}</h4>
// </div>
// <h4>Size: {file.size}{file.size ? ' bytes' : null}</h4>
// <h4>Type: {file.type}</h4>
// <h4>Modified: {file.lastModified}</h4>
