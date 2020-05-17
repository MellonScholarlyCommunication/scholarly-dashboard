import React from 'react';
import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';
import "./CommentsSidebar.css"
import NotificationHandler from 'util/NotificationHandler';
import AsyncListItemNotification from "./AsyncListItemNotification"

import List from '@material-ui/core/List';


export default class NotificationsSideBar extends React.Component {

  constructor(props) {
    super(props)
    this.cm = props.cm || new CommunicationManager(solid);
    this.nh = new NotificationHandler(this.cm, solid);
    this.update = this.update.bind(this)
    this.state = {notifications: []}
  }
  
  componentDidMount(){
    this.update()
  }

  async update(){
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;
    
    const inbox = await this.nh.discoverInboxUri(webId);
    if (!inbox) throw new Error("InboxViewContainer not correctly initialized");
    console.log("INBOX", inbox);
    const notifications = await this.nh.getNotificationsForURI(
      webId
    );
    this.setState({notifications: notifications})

  }


  render(){
    let notificationList = this.state.notifications.map(notification => {return(
      <AsyncListItemNotification metadata={notification} cm={this.cm}/>
    )})
    return (
      <div className="notificationsContainer">
        <button onClick={this.update}>SYNC</button>
        <List>
          {notificationList}
        </List>
      </div>
    );
  }
}


