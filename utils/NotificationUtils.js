import { buildThing, createSolidDataset, getSolidDataset, setThing, getThing, createThing, getUrl, saveSolidDatasetInContainer } from "@inrupt/solid-client";
import { AS, LDP, RDF } from "@inrupt/vocab-common-rdf";
import { postDatasetAtURLWithDefaultThing } from "./FileUtils"
import { ORCHESTRATORPREDICATE } from "./util";


/**
 * Create notification body dataset
 * @param {type: string, actor: string, target: string, object: string} data 
 */
export async function createNotification(fetchFunc, data) {
  console.log('creating notification', data)
  const actorThing = data.actor ? getThing(await getSolidDataset(data.actor, {fetch: fetchFunc}), data.actor) : null
  const objectThing = data.object ? getThing(await getSolidDataset(data.object, {fetch: fetchFunc}), data.object) : null
  const targetThing = data.target ? getThing(await getSolidDataset(data.target, {fetch: fetchFunc}), data.target) : null
  const originThing = buildThing(createThing({url: "https://mellon.com/dashboard"}))
    .addUrl(RDF.type, AS.Application)
    .addStringNoLocale(AS.name, "Mellon dashboard application")
    .build();

  // Create a new SolidDataset for Writing 101
  let notificationDataset = createSolidDataset();
  let notificationThing = buildThing(createThing({name: 'notification'}))
    .addUrl(RDF.type, data.type)
  
  if (actorThing) notificationThing = notificationThing.setIri(AS.actor, actorThing)
  if (objectThing) notificationThing = notificationThing.setIri(AS.object, objectThing)
  if (targetThing) notificationThing = notificationThing.setIri(AS.target, targetThing)

  notificationThing = notificationThing.addUrl(AS.origin, originThing)
    .addDatetime(AS.published, new Date())
    .build();

  notificationDataset = setThing(notificationDataset, notificationThing)
  if (actorThing) notificationDataset = setThing(notificationDataset, actorThing)
  if (objectThing) notificationDataset = setThing(notificationDataset, objectThing)
  if (targetThing) notificationDataset = setThing(notificationDataset, targetThing)
  notificationDataset = setThing(notificationDataset, originThing)

  return notificationDataset
}

export async function sendNotification(fetchFunction, webId, dataset) {
  const target = null;
  try {
    target = getUrl(getThing(await getSolidDataset(webId), webId), ORCHESTRATORPREDICATE)
  } catch (e) {
    alert("Could not find orchestrator to route message. Please initialize the orchestrator field on your profile.")
    return;
  }
  if (!target) {
    alert("Could not find orchestrator to route message. Please initialize the orchestrator field on your profile.")
    return;
  }
  const inboxUrl = getUrl(getThing(await getSolidDataset(target), target), LDP.inbox)
  if (!inboxUrl) { alert("Could not discover inbox for: " + target); return; }
  let response = await postDatasetAtURLWithDefaultThing(fetchFunction, dataset, inboxUrl, 'notification', 'text/turtle')
  if (response) {
    alert("Notification sent to: " + inboxUrl)
  } else {
    alert("Could not send notification to: " + inboxUrl || target)
  }
  return response
}