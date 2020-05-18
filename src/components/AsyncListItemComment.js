import React from 'react';
import solid from 'solid-auth-client'

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import CommunicationManager from 'util/CommunicationManager';

import "./AsyncListItem.css"



export default class AsyncListItemComment extends React.Component {
  
  constructor(props){
    super(props)
    this.running = true;
    this.metadata = props.metadata;
    this.cm = props.cm || new CommunicationManager(solid);
    this.initComponent = this.initComponent.bind(this)
    this.state = this.getNewState(props.id);
  }

  getNewState(id){
    return ({
      comment: {
        id: id,
        replyOf: "",
        createdAt: null,
        creator: "",
        content: "",
        note: "",
      },
      creatorName: ""
    })
  }

  componentDidMount() {
    this.initComponent()
  }
  

  componentDidUpdate(prevprops, prevstate){
    if(this.props.id !== prevprops.id) {
      this.setState(this.getNewState())
      this.initComponent()
    }
  }

  async initComponent(){
    const comment = await this.cm.getCommentData(this.state.comment.id);
    if(!this.running || !comment) return
    this.props.updateDate({id: this.state.comment.id, date: comment.createdAt})
    this.setState({comment: comment})
    this.getCreatorName(comment.creator)
  }

  async getCreatorName(creatorId){
    const name = await this.cm.getFullNameFromProfile(creatorId)
    if(!this.running) return
    if(name) this.setState({creatorName: name})
  }

  componentWillUnmount() {
    this.running = false;
  }

  render () {
    const timeString = this.state.comment.createdAt ? this.state.comment.createdAt.toLocaleString() : "";
    const paperMetadata = Object.values(this.props.selection)[0]
    const header = <div>{timeString} In reply to: <a href={this.state.comment.replyOf}>{paperMetadata.title}</a></div>
    return (
      <div key={this.props.id}>
    
        <ListItem className="flex-start listitem" >
          <ListItemAvatar>
            <Avatar alt={this.state.creatorName} src={require("../assets/comment.svg")}  />
          </ListItemAvatar>
            <ListItemText
              primary={header} 
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                  {this.state.creatorName}
                  </Typography>
                  {" — "}{this.state.comment.content}
                </React.Fragment>
              }
            />
        </ListItem>
        <Divider variant="inset" component="li" />
      </div>
    )
  }

}