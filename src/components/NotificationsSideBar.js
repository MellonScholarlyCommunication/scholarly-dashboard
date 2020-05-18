import React from 'react';
import solid from 'solid-auth-client'
import CommunicationManager from '../util/CommunicationManager';
import NotificationHandler from 'util/NotificationHandler';
import AsyncListItemNotification from "./AsyncListItemNotification"

import List from '@material-ui/core/List';
import "./Sidebar.css"
import { UploadFileComponent } from './UploadFileComponent';
const REFRESHRATE = 10000

export default class NotificationsSideBar extends React.Component {

  constructor(props) {
    super(props)
    this.cm = props.cm || new CommunicationManager(solid);
    this.nh = new NotificationHandler(this.cm, solid);
    this.update = this.update.bind(this)
    this.state = {notifications: []}
    this.running = false
    this.timeout = null;
  }
  
  componentDidMount() {
    this.running = true
    this.update();
    this.timeout = setInterval(this.update, REFRESHRATE); 
  }
  componentWillUnmount() {
    this.running = false
    clearInterval(this.timeout);
  }

  shouldComponentUpdate(nextprops, nextstate) {
    let oldnotifs = nextstate.notifications.map(notif => notif.id).sort()
    let newnotifs = this.state.notifications.map(notif => notif.id).sort()
    if(oldnotifs.length !== newnotifs.length) return true;
    for (let i = 0; i < oldnotifs.length; i++) {
      if (oldnotifs[i] !== newnotifs[i]) {
        return true;
      }
    } 
    return false;
  }

  async update(){
    console.log("updating notifications")
    const session = await solid.currentSession()
    const webId = session.webId
    if(!webId) return;
    
    const inbox = await this.nh.discoverInboxUri(webId);
    if (!inbox) throw new Error("InboxViewContainer not correctly initialized");
    console.log("INBOX", inbox);
    const notifications = await this.nh.getNotificationsForURI(
      webId
    );
    console.log("NOTIFICATIONS", notifications)
    this.setState({notifications: notifications})

  }

  render(){
    let notificationList = this.state.notifications.map(notification => {return(
      <AsyncListItemNotification key={notification.id} metadata={notification} cm={this.cm}/>
    )})
    return (
      <div className="sidebarcomponentcontainer">
        <div className="uppercontainer">
        <p>Notifications</p>
          <div className="sidebarList disable-scrollbars">
            <List>
              {notificationList}
            </List>
          </div>
        </div>
        <div className="lowercontainer">
          <UploadFileComponent className="fileAdd"/>
        </div>
      </div>
    );
  }
}


