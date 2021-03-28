/**
 * Create the follow event notification
 * @param {string} webId 
 * @param {{topic: string, value: string}[]} objects 
 */
export const createFollowEventNotification = (webId, objects) => {
  if (!objects || objects === null) {
    throw new Error('Creating subscription notification without subscription targets.')
  }
  const notif = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "summary": "Subscription event",
    "@type": "Follow",
    "object": [ ],
    "actor": {
      "@id": webId,
      "@type": "Person",
    },
  }

  for (let object of objects) {
    if (!object.topic || !object.value) {
      throw new Error('Incorrect subscription format.')
    }
    notif['object'].push({
      "https://www.example.org/ontology#property": object.topic,
      "https://www.example.org/ontology#propertyValue": object.value
    })
  }

  return JSON.stringify(notif, null, 2)
}
