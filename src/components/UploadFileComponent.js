import * as React from "react";
import "./UploadFileComponent.css"
import solid from 'solid-auth-client'
import ContactSelector from "./ContactSelector"
import CommunicationManager from '../util/CommunicationManager';
import NotificationHandler from "../util/NotificationHandler";
import MetadataFileGenerator from "../util/MetadataFileGenerator"
import { MODES, createPermission } from '../util/PermissionManager'

export class UploadFileComponent extends React.Component
{
  constructor(props) {
    super(props);

    this.cm = props.cm || new CommunicationManager(solid)
    this.nh = props.nh || new NotificationHandler(this.cm, solid)

    this.handleChange = this.handleChange.bind(this);
    this.uploadFile = this.uploadFile.bind(this)
    this.uploadFile = this.uploadFile.bind(this)
    this.submit = this.submit.bind(this)
    this.getContacts = this.getContacts.bind(this);
    this.getNewState = this.getNewState.bind(this);
    this.getStorageLocationForFile = this.getStorageLocationForFile.bind(this)

    this.state = {file: null, contacts: [], uploading: false, storageLocation: ""}
  }

  componentDidMount(){
    this.getContacts();
  }

  async getContacts(){
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;
    let contacts = await this.cm.getContacts(webId)
    this.setState({contacts: contacts, storageLocation: this.cm.getBaseIRI(webId) + "papers/"})
  }

  // This only gets called after a paper was submitted. contacts and storagelocation should not be reset.
  getNewState(){
    return {file: null, contacts: this.state.contacts || [], uploading: false, storageLocation: this.state.storageLocation || ""}
  }

  handleChange(selectedFiles) {
    this.setState({file: selectedFiles[0]})
  }

  handleStorageLocation(location) {
    this.setState({storageLocation: location})
  }

  async uploadFile(){
    this.setState({uploading: true})
  }


  getStorageLocationForFile(file) {
    let storageLocation = this.state.storageLocation;
    if (!storageLocation) return;
    if (!storageLocation.endsWith("/")) storageLocation = storageLocation + "/";
    return storageLocation + file.name;
  }

  async submit(contacts) {
    console.log("Submitting", this.state.file, contacts)
    const file = this.state.file;
    const session = await solid.currentSession()
    const webId = session.webId
    const fileId = this.getStorageLocationForFile(this.state.file);
    console.log("fileId", fileId)
    if(!webId || !file || !fileId || !this.cm || !this.nh) {
      console.error("fileupload component not initialized correctly")
      console.log(!webId, !file, !fileId, !this.cm, !this.nh)
      return;
    }

    // Todo: allow to choose a title
    const paperMetadata = {
      id: fileId,
      title: file.name.split(".")[0],
      metadatalocation: "",
      publisher: webId
    };

    const response = await this.cm.addPaper(file, paperMetadata);
    console.log("added paper", response.url, file.name);
    const paperURI = response.url;
    paperMetadata["id"] = paperURI;
    console.log(paperURI, "added succesfully");

    let inboxes = [];
    for (let contact of contacts) {
      if (contact && validURL(contact)) {
        try {
          inboxes.push(
            (await this.nh.discoverInboxUri(contact)) || contact
          );
        } catch (e) {
          console.log(e);
        }
      }
    }

    for (let inbox of inboxes) {
      const notification = MetadataFileGenerator.createPaperPublishedNotification(
        webId,
        paperURI,
        paperMetadata.title
      );
      const result = await this.nh.send(inbox, notification);
      console.log("inbox", inbox, "notified with result", result);
    }

    // Notified people can read the paper
    console.log("Setting READ for all selected contacts");
    this.cm.pm.createACL(paperURI,
      [createPermission([MODES.READ], contacts)]
    );

    // create notification
    // this.props.paperAdded && this.props.paperAdded(paperMetadata);
    // reset component
    this.setState(this.getNewState());
    // Notify that a file has been uploaded
    this.props.fileUploaded(paperURI);
  }

  render () {
    if (this.state.uploading) {
      return (
        <div>
          <ContactSelector contacts={this.state.contacts} submit={this.submit}/>
        </div>
      )
    }
    return (
      <div>
        <input type="file" onChange={ (e) => this.handleChange(e.target.files) } />
        <p>storage location</p>
        <input value={this.state.storageLocation} onChange={ (e) => this.handleStorageLocation(e.target.value) } />
        <button onClick={() => {this.uploadFile()}}>Upload</button>
      </div>
    )
  }
}

//https://www.webmasterworld.com/devshed/javascript-development-115/regexp-to-match-url-pattern-493764.html
export function validURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}