import { buildThing, createSolidDataset, getSolidDataset, setThing, getThing, createThing, getUrl, saveSolidDatasetInContainer } from "@inrupt/solid-client";
import { AS, LDP, RDF } from "@inrupt/vocab-common-rdf";

/**
 * Create notification body dataset
 * @param {type: string, actor: string, target: string, object: string} data 
 */
export async function createNotification(data) {
  console.log('creating notification', data)
  const actorThing = getThing(await getSolidDataset(data.actor), data.actor)
  const objectThing = getThing(await getSolidDataset(data.object), data.object)
  const targetThing = getThing(await getSolidDataset(data.target), data.target)
  const originThing = buildThing(createThing({url: "https://mellon.com/dashboard"}))
    .addUrl(RDF.type, AS.Application)
    .addStringNoLocale(AS.name, "Mellon dashboard application")
    .build();

  // Create a new SolidDataset for Writing 101
  let notificationDataset = createSolidDataset();
  let notificationThing = buildThing(createThing({name: ''}))
    .addUrl(RDF.type, data.type)
    .setIri(AS.actor, actorThing)
    .addUrl(AS.object, objectThing)
    .addUrl(AS.target, targetThing)
    .addUrl(AS.origin, originThing)
    .addDatetime(AS.published, new Date())
    .build();

  notificationDataset = setThing(notificationDataset, notificationThing)
  notificationDataset = setThing(notificationDataset, actorThing)
  notificationDataset = setThing(notificationDataset, objectThing)
  notificationDataset = setThing(notificationDataset, targetThing)
  notificationDataset = setThing(notificationDataset, originThing)
  console.log('notificationThing', notificationThing)
  console.log('notificationDataset', notificationDataset)
  return notificationDataset
}

export async function sendNotification(fetchFunction, dataset, target) {
  const inboxUrl = getUrl(getThing(await getSolidDataset(target), target), LDP.inbox)
  if (!inboxUrl) { alert("Could not discover inbox for: " + target); return; }
  let sentNotificationDataset = await saveSolidDatasetInContainer(inboxUrl, dataset, {fetch: fetchFunction})
  if (sentNotificationDataset) {
    alert("Notification sent to: " + inboxUrl)
  } else {
    alert("Could not send notification to: " + inboxUrl || target)
  }
  return sentNotificationDataset
}