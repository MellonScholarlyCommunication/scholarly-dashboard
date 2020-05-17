import React from 'react';
import solid from 'solid-auth-client'
import CommunicationManager, { Comment } from '../util/CommunicationManager';
import "./CommentsSidebar.css"

import AsyncListItemComment from "./AsyncListItemComment"
import List from '@material-ui/core/List';


export default class CommentsSidebar extends React.Component {

  constructor(props) {
    super(props)
    this.cm = props.cm || new CommunicationManager(solid);

    this.state = {
      comments: [],
    };
    this.update = this.update.bind(this)
  }

  getNewState(){
    return ({ comments: [] })
  }
  
  componentDidMount(){
    console.log("COMPDIDMOUNT")
    this.update()
  }

  componentDidUpdate(prevprops, prevstate){
    if(Object.keys(this.props.selection)[0] !== Object.keys(prevprops.selection)[0]){
      this.setState(this.getNewState())
      this.update()
    }
  }
  // componentDidUpdate(prevprops, prevstate){
  //   console.log("COMPONENTDIDUPDATE", this.state, prevstate, this.props, prevprops)
  //   if (this.props.selection !== prevprops.selection) {
  //     this.update()
  //     return;
  //   }
  //   const currentCommentIds = this.state.comments.map(comment => comment.id).sort()
  //   const prevCommentIds = prevstate.comments.map(comment => comment.id).sort()
  //   for (let i = 0; i < currentCommentIds.length; i++) {
  //     if(currentCommentIds[i] !== prevCommentIds[i]){
  //       this.update();
  //       return;
  //     }
  //   }
  // }
  // async update(){
  //   console.log("update sidebar", this.props)
  //   let commentIds = []
  //   for (let documentId of Object.keys(this.props.selection)) {
  //     console.log("doc", documentId, this.props.selection[documentId])
  //     commentIds = commentIds.concat(await this.cm.getPaperCommentIds(this.props.selection[documentId]))
  //   }

  //   let comments = [];
  //   for (let commentId of commentIds) {
  //     comments.push(await this.cm.getCommentData(commentId));
  //   }
  //   this.setState({comments: comments})
  // }

  // generateListView(comments) {
  //   let items = comments.map(comment => { 
  //     let commentString = JSON.stringify(comment, null, 2)
  //     return <div key={comment.id}>
  //       {commentString}
  //     </div>
  //   })
  //   console.log("ITEMS")
  //   return items
  // }


  async update(){
    const session = await solid.currentSession()
    const webId = session.webId
    console.log("update notifications", webId)

    const documentId = Object.keys(this.props.selection)[0]
    let comments = await this.cm.getPaperCommentIds(this.props.selection[documentId])
    if(comments)
      this.setState({comments: comments});
  }

  render(){
    let notificationList = this.state.comments.map(commentId => {return(
      <AsyncListItemComment id={commentId} cm={this.cm}/>
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


