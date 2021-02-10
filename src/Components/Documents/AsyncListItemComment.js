import React, { useState } from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import "./AsyncListItem.css"


const AsyncListItemComment = (props) => {  

  const [state, setstate] = useState({
    comment: {
      id: props.id,
      replyOf: "",
      createdAt: null,
      creator: "",
      content: "",
      note: "",
    },
    creatorName: ""
  })

  // async initComponent(){
  //   const comment = await this.cm.getCommentData(this.state.comment.id);
  //   if(!this.running || !comment) return
  //   this.props.updateDate({id: this.state.comment.id, date: comment.createdAt})
  //   this.setState({comment: comment})
  //   this.getCreatorName(comment.creator)
  // }

  // async getCreatorName(creatorId){
  //   const name = await this.cm.getFullNameFromProfile(creatorId)
  //   if(!this.running) return
  //   if(name) this.setState({creatorName: name})
  // }

  // componentWillUnmount() {
  //   this.running = false;
  // }


  // <ListItemAvatar>
  //   <Avatar alt={this.state.creatorName} src={require("../assets/comment.svg")}  />
  // </ListItemAvatar>
  
  const timeString = state.comment.createdAt ? state.comment.createdAt.toLocaleString() : "";
  const paperMetadata = Object.values(props.selection)[0]
  const header = <div>{timeString} In reply to: <a href={state.comment.replyOf}>{paperMetadata.title}</a></div>
  return (
    <div key={props.id}>
      <ListItem className="flex-start listitem" >
          <ListItemText
            primary={header} 
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="textPrimary"
                >
                {state.creatorName}
                </Typography>
                {" — "}{state.comment.content}
              </React.Fragment>
            }
          />
      </ListItem>
      <Divider variant="inset" component="li" />
    </div>
  )
}

export default AsyncListItemComment