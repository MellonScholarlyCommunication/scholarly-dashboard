import { useState, useEffect } from 'react';
import { getNotificationManager } from '../singletons/Notifications';


const useNotifications = function(webId) {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    let manager = getNotificationManager(webId); 
    if(!manager) return
    manager.on('notifications', setNotifications)
    const notifications = manager.getNotifications();
    if (notifications && notifications.length) setNotifications(notifications);
    return () => {
      manager = null;
    }
  }, [webId])  
  return notifications;
}

export default useNotifications
