import React, { useState } from 'react';
import "./MainContent.css"
import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';
import NotificationHandler from 'util/NotificationHandler';

import "./CommentAddComponent.css"
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {DataFactory} from "n3"


export default class CommentAddComponent extends React.Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.cm = props.cm || new CommunicationManager(solid);
    this.notificationHandler = new NotificationHandler(this.cm, solid);
    this.comment = ""
    this.state = {commentDir: "", text: ""}
   
    this.commentUpdate = this.commentUpdate.bind(this);
    this.getCommentsDir = this.getCommentsDir.bind(this);
    this.commentSent = this.commentSent.bind(this);
  }

  componentDidMount(){
    this.update()
  }

  async update(){
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;

    this.setState({commentDir: this.state.commentDir || this.getCommentsDir(webId)})
  }

  getCommentsDir(webId) {
    return this.cm.getBaseIRI(webId) + "comments/"
  }

  initializedCollection() {
    this.update()
  }

  async submit() {
    console.log("SUBMITTING", this.state.commentDir, this.comment, this.props)
    
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;
    const paperMetadata = Object.values(this.props.selection)[0]
    // Use json stringify to escape string. Remove first and last double quote as they are added later.
    let text = JSON.stringify(this.comment);
    text = text.substring(1, text.length-1);
    console.log("replaced", text)
    const commentMetadata = {
      text: text,
      publisherId: webId,
      documentId: paperMetadata.id,
      commentLocation: this.state.commentDir || this.getCommentsDir(webId)
    };

    let inboxes = paperMetadata.publisher ? [paperMetadata.publisher] : [];

    let notification = await this.cm.addComment(
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
    this.commentSent();
  }

  commentSent() {
    this.comment = "";
    this.setState({text: ""})
    this.update();
  }

  commentUpdate(e){
    this.comment = e.target.value
    this.setState({text: e.target.value})
  }

  render () {
    return (
      <div className="commentaddcontainer">
        <Container>
          <Col>
          <Row>
            <textarea
              rows="3"
              value={this.state.text} 
              onChange={this.commentUpdate} 
              placeholder="Write comment ..."
            />
          </Row>
          <Row>
            <button className="col-m-" onClick={() => this.submit() }>Submit</button>
          </Row>
          <Row>
              <p>storage location</p>
              <input
                id="commentDir"
                defaultValue={this.state.commentDir}
                placeholder="path to store comments"
              />
            </Row>
          </Col>
        </Container>
      </div>  
    );
  }
}

// <div className="file-details">
// <h3>The file</h3>
// <h4>Name: {file.name}</h4>
// </div>
// <h4>Size: {file.size}{file.size ? ' bytes' : null}</h4>
// <h4>Type: {file.type}</h4>
// <h4>Modified: {file.lastModified}</h4>
