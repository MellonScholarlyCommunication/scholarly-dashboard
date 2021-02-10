import ns from "./NameSpaces";
import { clearCache } from "../singletons/QueryEngine";

export default class NotificationProcesser {
  constructor(webId) {
    this.webId = webId;
  }

  process(notification) {
    fireUpdateEvents(this.webId, notification)
  }
}



/**
 * This function is responsible to update the contracts status of the current user based on the incoming notifications.
 * This should be placed somewhere else in the future
 */
async function fireUpdateEvents(webId, notification){
  clearActivity(notification);
}

function clearActivity(activity){
  if (!activity || !activity.id) return;
  clearCache(activity.id)
  if (activity.actor) clearActivity(activity.actor)
  if (activity.object) clearActivity(activity.object)
  if (activity.target) clearActivity(activity.target)

}