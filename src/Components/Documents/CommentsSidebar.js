import React, { useState, useEffect } from 'react';
import { getDocumentMetadata } from '../../util/MellonUtils/documents'
import AsyncListItemComment from './AsyncListItemComment';
import CommentAddComponent from './CommentAddComponent';
import { List } from '@material-ui/core';
import styles from '../../css/components/documentinfo.module.css'

const CommentsSidebar = (props) => {

  const [state, setstate] = useState({
    commentIds: [],
    commentDates: [],
  })
  console.log('commentsdinges', props.documentId)


  const updateDate = (updateObj) => {
    console.log("updating date", updateObj)
    let newCommentDates = this.state.commentDates.slice();
    for (let i = 0; i < newCommentDates.length; i++){
      if(newCommentDates[i].id === updateObj.id) {
        //the date as already been set once
        return;
      }
    }
    newCommentDates.push(updateObj)
    setstate({commentIds: state.commentIds, commentDates: newCommentDates})
  }


  const getDateForId = (id) => {
    let commentDates = this.state.commentDates
    for (let e of commentDates){
      if(e.id === id) {
        return e
      }
    }
    return {id: id, date: null};
  }

  let idsWithDates = state.commentIds.map(commentId => getDateForId(commentId))
  console.log("idsWithDates", JSON.stringify(idsWithDates, null, 2))
  idsWithDates.sort(function(a, b) {console.log("comparing", JSON.stringify(a), JSON.stringify(b)); if(!b.date) return a; if(!a.date) return b; return b.date.getTime() - a.date.getTime()})
  console.log("sortedComments", JSON.stringify(idsWithDates, null, 2))
  let commentsList = idsWithDates.map(commentId => {return(
    <AsyncListItemComment key={commentId.id} id={commentId.id} selection={props.selection} updateDate={updateDate}/>
  )})
  

  return (
    <div className={` ${styles.sidebarheight} sidebarcomponentcontainer`}>
      <div className="uppercontainer">
        <p>Comments</p>
        <List className={` ${styles.commentslist} disable-scrollbars`}>
          {commentsList}
        </List>
      </div>
      <div className={`${styles.addcommentfield} lowercontainer disable-scrollbars`}>
        <CommentAddComponent className="commentAdd" selection={props.selection} {...props} />
      </div>
    </div>
  );
}

export default CommentsSidebar


