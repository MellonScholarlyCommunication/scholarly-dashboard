import { getValArray, getVal, clearCache } from './QueryEngine';
import ns from "../util/NameSpaces"
import NotificationProcesser from '../util/NotificationProcesser';

const { default: data } = require('@solid/query-ldflex');

const EventEmitter = require('events');
const { deleteFile, postFile } = require('../util/FileUtil');

const POLLINGRATE = 10000;

var InboxManager = (function () {
  var inboxManagers = new Map()
  return {
      getInstance: function (webId) {
        if (!webId) {
          return null;
        } 
        if (!inboxManagers.get(webId)) {
          const manager = new NotificationHandler(webId)
          inboxManagers.set(webId, manager)
        } 
        return inboxManagers.get(webId)
      }
  };
})(); 

// Todo:: add error handling in case of requests that produce error codes
class NotificationHandler extends EventEmitter {
  constructor(webId) {
    super()
    this.webId = webId;
    this.inbox = null;
    this.pollNotifications();
    this.notificationProcesser = new NotificationProcesser(webId);
    // this.socket = new WebSocket('wss://alice.localhost:8443', ['solid/0.1.0-alpha']);

    // console.log('socket', this.socket);
  }
  notifications = [];
  deletedNotifications = []

  // Get the current notifications from the handler
  getNotifications() {
    return this.notifications.filter(n => !n.metadata.notLoaded);
  }

  async pollNotifications(){
    this.checkNewNotifications()
    setInterval(() => {
      this.checkNewNotifications()
    }, POLLINGRATE);
  }

  setNotifications = (newNotifications) => {
    if (!newNotifications || newNotifications.length === 0) return;
    this.notifications = newNotifications;
    this.emit('notifications', this.getNotifications());
  }

  checkNewNotificationIds = (oldNotificationIds, newNotificationsIds) => {
    const oldIdsSorted = oldNotificationIds.sort();
    const newIdsSorted = newNotificationsIds.sort();
    return ! (oldIdsSorted.length === newIdsSorted.length && oldIdsSorted.every((id, index)  => id === newIdsSorted[index]))
  }

  async checkNewNotifications() {
    const inbox = this.webId ? await getInbox(this.webId) : null;
    if(!inbox) return;
    clearCache(inbox);
    
    let inboxNotificationsMetadata = await getInboxNotificationsMetadata(inbox);
    // remove already deleted notifications in case the delete has not yet been done on the server side
    const deleted = this.deletedNotifications.slice();
    inboxNotificationsMetadata = inboxNotificationsMetadata.filter(m => deleted.indexOf(m.id) === -1)
    // compare to current notifications, and load new data if there are new notifications available.
    if (this.checkNewNotificationIds(this.notifications.map(n => n.metadata.id), inboxNotificationsMetadata.map(m => m.id))) {
      const newNotificationsMetadata = inboxNotificationsMetadata.filter(m => this.notifications.map(n => n.metadata.id).indexOf(m.id) === -1)
      const newNotifications = await this.fetchNotifications(newNotificationsMetadata);
      for (let notification of newNotifications) {
        this.notificationProcesser.process(notification)
      }
      this.setNotifications(this.notifications.concat(newNotifications))
    }
  }
  
  async fetchNotifications(notificationsMetadata){ 
    if(!notificationsMetadata) return []
    const notifications = await Promise.all(notificationsMetadata.map(
      async function(metadata){
        async function getNotificationData(notificationId){
          try { return await getActivity(notificationId) }
          catch { return null }
        }
        let notification = await getNotificationData(metadata.id);
        if (!notification) {
          metadata.notLoaded = true;
          return ({ metadata })
        }
        try { 
          metadata.modified = metadata.modified && new Date(metadata.modified)
          notification.metadata = metadata;
          return notification
        } catch (e) { 
          metadata.notLoaded = true;
          return ({ metadata })
        }
    }))
    return notifications
  }


  async deleteNotifications(notificationIds) {
    let deletedNotifications = this.deletedNotifications.concat(notificationIds);
    const filteredNotifications = this.notifications.filter(n => deletedNotifications.indexOf(n.metadata.id) === -1);
    if (this.notifications.length !== filteredNotifications.length) {
      this.setNotifications(filteredNotifications);
    }
    const deletions = []
    for (let id of notificationIds) {
      deletions.push(deleteFile(id));
    }
    return await Promise.all(deletions);
  }

  // async openWebSocket(){ 
  //   var socket = new WebSocket('wss://example.org/', ['solid/0.1.0-alpha']);
  //   socket.onopen = function() {
  //     this.send('sub https://example.org/data/test');
  //   };
  //   socket.onmessage = function(msg) {
  //     if (msg.data && msg.data.slice(0, 3) === 'pub') {
  //           // resource updated, refetch resource
  //     }
  //   };
  // }
}

async function fetchInboxId(subject){
  const inbox = await getVal(subject, ns.ldp('inbox'))
  if(!inbox) console.error(subject + ' does not profide an inbox.')
  return inbox
}


async function getInboxNotificationsMetadata(inbox) {
  if(!inbox) return []
  let notificationIds = await getValArray(inbox, ns.ldp('contains'))
  let notificationsModified = await getValArray(inbox, ns.ldp('contains'), ns.dct('modified'))
  return notificationIds.map((id, index) => { return({id: id, modified: notificationsModified[index]})})
}

async function getActivity(...args){
  const id = await getVal(...args);
  if (!id) return null
  return {
    id: id,
    type: await getVal(...args, 'type'),
    actor: await getActivity(...args, 'actor'),
    object: await getActivity(...args, 'object'),
    target: await getActivity(...args, 'target'),
    summary: await getVal(...args, 'summary'),
  }
}


/**
 * 
 * @param {*} webId 
 * @returns NotificationHandler | null;
 */
export function getNotificationManager(webId) {
  return InboxManager.getInstance(webId);
}



export default async function notify(notificationBody, subjects) {
  const distinct = (value, index, self) => self.indexOf(value) === index;
  for (let subject of subjects.filter(distinct)) {
    const inbox = await getInbox(subject);
    if (inbox) postFile(inbox, notificationBody)
  }
}

async function getInbox(subject){
  const inbox = await data[subject][ns.ldp('inbox')]
  if(!inbox) console.error(subject + ' does not profide an inbox.')
  return inbox && inbox.value
}