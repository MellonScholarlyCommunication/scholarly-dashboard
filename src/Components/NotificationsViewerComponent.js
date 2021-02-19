import React, { useState } from 'react'
import useNotifications from '../hooks/useNotifications'
import CloseIcon from '@material-ui/icons/Close';

// import { Col, Row, Grid } from 'react-flexbox-grid'
import { Button, Row, Col } from 'react-bootstrap'
import { Value } from '@solid/react';

import ns from "../util/NameSpaces"

import { availableViews, getContractData, routeViewWithParams } from '../util/Util'
import { deleteFile } from '../util/FileUtil';
import { IconButton } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { checkAndThrowErrors } from '../util/MellonUtils/documents';

const NotificationsViewerComponent = (props) => {

  const NotificationCard = (props) => {
    const history = useHistory();
    const notification = props.notification
    const notificationObject = props.notification.jsonld[0]
    
    let notificationProperties = []
    for (const property in notificationObject) {
      notificationProperties.push(property)
    }
  
    
    // const viewPublication = (notification) => viewDocument(notification.object.object.id);
    // const viewComment = (notification) => viewDocument(notification.object.target.id);
    // const viewDocument = (documentId) => history.push(routeViewWithParams(availableViews.documents, {documentId}))
  
    // const deleteNotification = async (notificationId) => deleteFile(notificationId).then(deleted => checkAndThrowErrors(deleted, notificationId, null))
  
    // console.log('NOTIFICATION', notification)
    // // TODO;; this will fail if you have no view access to the contract
    // function getButton() {
    //   switch (notification.type) {
    //     case ns.as('Announce'):
    //       if (notification.object && notification.object.type === ns.as('Create')) {
    //         if (notification.object.object && notification.object.object.id && notification.object.object.type === ns.ex('Publication')) {
    //           return (<Button className={'centeraligntext'} onClick={() => viewPublication(notification)}>View Publication</Button>)
    //         }
    //         if (notification.object.object && notification.object.object.id && notification.object.object.type === ns.sioc('Post')) {
    //           return (<Button className={'centeraligntext'} onClick={() => viewComment(notification)}>View Comment</Button>)
    //         }
    //       }
    //       return (<div />)
    //     default:
    //       return (<div />)
    //   }
    // }
  
    return (
      <div className={`NotificationCard`}>
        <Row className='propertyview' key={notification.id}>
          {notificationProperties.map(prop => 
            <Row>
              <Col md={4}><label className='leftaligntext'>{prop}</label></Col>
              <Col md={7}><label>{JSON.stringify(notificationObject[prop])}</label></Col>
            </Row>
          )}
          {/* <Col md={1}><label className='leftaligntext'>{notification.type && notification.type.split('#')[1]}</label></Col> */}
          {/* <Col md={2}><label className='leftaligntext'><a href={notification.actor.id}><Value src={`[${notification.actor.id}].name`}/></a></label></Col> */}
          {/* <Col md={2}><label className='leftaligntext'>{notification.metadata.modified && notification.metadata.modified.toLocaleString()}</label></Col> */}
          {/* <Col md={4}><label className='leftaligntext'>{notification.summary}</label></Col> */}
          {/* <Col md={2}>{getButton()}</Col> */}
          {/* <Col md={1}><IconButton className={`centeraligntext`} onClick={() => props.deleteNotification(notification.metadata.id)}><CloseIcon style={{color: 'red'}}/></IconButton></Col>  */}
        </Row>
      </div>
    )
  }
  
  const notifications = useNotifications(props.webId)
  // Sort on notification modified (= created normally) in reverse order to get newest first

  console.log('NOTIFICATIONS', notifications)
  const sortednotifications = notifications.sort( (a, b) => new Date(b.date) - new Date(a.date))

  // async function deleteNotification(notificationId) {
  //   deleteFile(notificationId);
  //   setDeleted(deleted.concat(notificationId))
  // }


  return (
    <div id="notificationsviewercomponent" className='container'>
      <h4> Notifications </h4>
      <br />
      <Row className='propertyview pageheader' key={'header'}>
        <Col md={1}><label className="leftaligntext"><b>Type</b></label></Col>
        <Col md={2}><label className="leftaligntext">Sender</label></Col>
        <Col md={2}><label className="leftaligntext">Time received</label></Col>
        <Col md={4}><label className="leftaligntext">Summary</label></Col>
        <Col md={2}><label className="centeraligntext">Action</label></Col>
      </Row>
      {sortednotifications.map((notification, index) => {
        return ( <NotificationCard notification={notification} {...props} key={index} /> )
      })}
      
    </div>
  )
}
export default NotificationsViewerComponent

// const NotificationCard = (props) => {
//   const history = useHistory();
//   const notification = props.notification

  
//   const viewPublication = (notification) => viewDocument(notification.object.object.id);
//   const viewComment = (notification) => viewDocument(notification.object.target.id);
//   const viewDocument = (documentId) => history.push(routeViewWithParams(availableViews.documents, {documentId}))

//   const deleteNotification = async (notificationId) => deleteFile(notificationId).then(deleted => checkAndThrowErrors(deleted, notificationId, null))

//   console.log('NOTIFICATION', notification)
//   // TODO;; this will fail if you have no view access to the contract
//   function getButton() {
//     switch (notification.type) {
//       case ns.as('Announce'):
//         if (notification.object && notification.object.type === ns.as('Create')) {
//           if (notification.object.object && notification.object.object.id && notification.object.object.type === ns.ex('Publication')) {
//             return (<Button className={'centeraligntext'} onClick={() => viewPublication(notification)}>View Publication</Button>)
//           }
//           if (notification.object.object && notification.object.object.id && notification.object.object.type === ns.sioc('Post')) {
//             return (<Button className={'centeraligntext'} onClick={() => viewComment(notification)}>View Comment</Button>)
//           }
//         }
//         return (<div />)
//       default:
//         return (<div />)
//     }
//   }

//   return (
//     <div className={`NotificationCard`}>
//       <Row className='propertyview' key={notification.metadata.id}>
//         <Col md={1}><label className='leftaligntext'>{notification.type && notification.type.split('#')[1]}</label></Col>
//         <Col md={2}><label className='leftaligntext'><a href={notification.actor.id}><Value src={`[${notification.actor.id}].name`}/></a></label></Col>
//         <Col md={2}><label className='leftaligntext'>{notification.metadata.modified && notification.metadata.modified.toLocaleString()}</label></Col>
//         <Col md={4}><label className='leftaligntext'>{notification.summary}</label></Col>
//         <Col md={2}>{getButton()}</Col>
//         <Col md={1}><IconButton className={`centeraligntext`} onClick={() => props.deleteNotification(notification.metadata.id)}><CloseIcon style={{color: 'red'}}/></IconButton></Col>
//       </Row>
//     </div>
//   )
// }