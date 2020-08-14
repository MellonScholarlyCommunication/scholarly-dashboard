import * as React from "react";
import "./UploadFileComponent.css"
import "./ContactSelector.css"

export default class ContactSelector extends React.Component{
  constructor(props){
    super(props)
    const contacts = props.contacts || [];
    this.addContact = this.addContact.bind(this)
    this.updateConctact = this.updateConctact.bind(this)
    this.removeContact = this.removeContact.bind(this)
    this.submit = this.submit.bind(this)

    this.state = {contacts: contacts}
  }

  addContact(){
    const newContact = ""
    this.setState(state => {
      const list = [...state.contacts, newContact];
      return {
        contacts: list
      };
    });
  }

  removeContact(index) {
    let newContacts = [...this.state.contacts]
    newContacts.splice(index, 1)
    this.setState({contacts: newContacts})
  }

  updateConctact(index, event) {
    const newContact = event.target.value
    let newContacts = [...this.state.contacts]
    newContacts[index] = newContact
    this.setState({contacts: newContacts})
  }

  submit() {
    this.props.submit(this.state.contacts)
    this.setState({contacts: []})

  }

  render() {
    const contacts = this.state.contacts.map((contact, index) => {return(
      <div className="contactcontainer" key={index} ><input className="contactinput" key={index} value={contact} onChange={(e) => {this.updateConctact(index, e)}}/><div className="divButton" onClick={() => {this.removeContact(index)}}>X</div></div>
    )})
    return (
      <div className="contactsselector">
        <p>Select contacts to notify</p>
        <p style={{fontSize: "small"}}>People below will be able to read your paper</p>
        <button onClick={() => this.addContact()}>addContact</button>

        <form>
          {contacts}
        </form>
        <button onClick={() => {this.submit()}}>Submit</button>
      </div>
    );
  }
}