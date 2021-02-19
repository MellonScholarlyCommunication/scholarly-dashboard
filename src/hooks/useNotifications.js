import { useState, useEffect } from 'react';
import { getInboxAgent } from 'singletons/InboxAgent';

const useNotifications = function(webId, showSystemNotification = false) {
  const [notifications, setNotifications] = useState([]);
  var agent = null;
  useEffect(() => {
    agent = getInboxAgent(webId);
    agent.on('notifications', (notifications) => setNotifications(notifications)) 
    return () => {
      agent = null
    }
  }, [webId])  
  return notifications;
}


export default useNotifications
