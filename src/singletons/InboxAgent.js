const EventEmitter = require('events');
const f = require('@dexagod/rdf-retrieval')
const ldnAgent = require('@dexagod/ldn-agent').NotificationHandler
const auth = require('solid-auth-client')
var agent = new ldnAgent({auth, notify: true})

var inboxMap = {}


export function getInboxAgent(webId) {
  if (!inboxMap[webId]) {
    inboxMap[webId] = new InboxAgent(webId);
  } 
  return inboxMap[webId]
}

class InboxAgent extends EventEmitter  {
  constructor(webId) {
    super()
    this.webId = webId;
    this.initializeAgent(webId)
  }

  async initializeAgent(webId) {
    this.notifications = []
    agent.watchNotifications({webId}).then(iterator => {

      iterator.on('readable', async () => {
        let notification;
        while (notification = iterator.read()) {
          notification.jsonld = JSON.parse(await f.quadArrayToString(notification.quads, 'application/ld+json'))
          this.notifications = [notification].concat(this.notifications)
          this.emit('notifications', this.notifications)
        }
          
      });
    })
  }

  deleteNotification(idsToDelete) {
    agent.clearNotifications({webId: this.webId, notificationIds: idsToDelete})
    this.notifications = this.notifications.filter(notification => idsToDelete.indexOf(notification.id) === -1)
    this.emit('notifications', this.notifications)
  }

  async sendNotification(params) {
    agent.sendNotification(params)
  }
}

  