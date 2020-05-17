import React from 'react';
import solid from 'solid-auth-client'

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import CommunicationManager from 'util/CommunicationManager';



export default class AsyncListItemNotification extends React.Component {
  
  constructor(props){
    super(props)
    this.running = true;
    this.metadata = props.metadata;
    this.cm = props.cm || new CommunicationManager(solid);
    this.initComponent = this.initComponent.bind(this)
    this.state = this.getNewState(this.metadata.id)
  }

  getNewState(id){
    return ({
      notification: {
        id: id,
        type: "",
        comment: "",
        actor: "",
        object: {
          id: "",
          type: "",
          replyOf: "",
          createdAt: "",
          hasCreator: ""
        }},
      creatorName: ""
    })
  }

  componentDidMount(){
    this.initComponent()
  }

  componentDidUpdate(prevprops, prevstate){
    console.log()
    if(this.props.metadata.id !== prevprops.metadata.id){
      this.setState(this.getNewState())
      this.initComponent()
    }
  }

  async initComponent(){
    const notification = await this.cm.getNotificationFromId(this.metadata.id)
    if(!this.running || !notification) return
    this.setState({notification: notification})
    this.getCreatorName(notification.actor)
  }

  async getCreatorName(creatorId){
    const name = await this.cm.getFullNameFromProfile(creatorId)
    if(!this.running || !name) return
    if(name) this.setState({creatorName: name})
  }

  componentWillUnmount() {
    this.running = false;
  }

  render () {
    return (
      <div key={this.state.notification.id}>
      
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt={this.state.creatorName} src={require("../assets/comment.svg")}  />
          </ListItemAvatar>
            <ListItemText
              primary={<a href={this.state.notification.object.id}>{this.state.notification.object.id}</a>}
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                  {this.state.creatorName}
                  </Typography>
                  {" — "}{this.state.notification.comment}
                </React.Fragment>
              }
            />
        </ListItem>
        <Divider variant="inset" component="li" />
      </div>
    )
  }

}