import { DCTERMS } from "@inrupt/lit-generated-vocab-common";
import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  getUrlAll,
  getThingAll,
  asUrl,
  getUrl
} from "@inrupt/solid-client";

import { AS, RDF } from "@inrupt/vocab-common-rdf";
import { getContainedResourceURLs } from "../../utils/FileUtils";

const FOLLOWLINKS = [DCTERMS.publisher, DCTERMS.creator]

export async function getEventIds(fetchFunction, uri) {
  // Check Headers
  // TODO:: discoverLinkHeaders(fetchFunction, uri)

  // Check resource body if none discovered through header?
  let eventLogs = await discoverBodyOutboxLinks(fetchFunction, uri)

  // recursive call met links
  for (let webId of await discoverBodyAuthorLinks(fetchFunction, uri)) {
    eventLogs = eventLogs.concat(await discoverBodyOutboxLinks(fetchFunction, webId))
  }

  let eventIds = []
  for (let eventLogId of eventLogs) {
    eventIds = eventIds.concat(await getContainedResourceURLs(fetchFunction, eventLogId))
  }

  return eventIds
}

async function discoverBodyOutboxLinks(fetchFunction, uri) {
  const dataset = await getSolidDataset(uri, {fetch: fetchFunction})
  const thing = getThing(dataset, uri)
  return getUrlAll(thing, AS.NAMESPACE+"outbox")
}

async function discoverBodyAuthorLinks(fetchFunction, uri) {
  const dataset = await getSolidDataset(uri, {fetch: fetchFunction})
  const thing = getThing(dataset, uri)

  let results = []
  for (let predicate of FOLLOWLINKS) {
    results = results.concat(getUrlAll(thing, predicate))
  }
  return [ ...new Set(results)]
}


async function discoverLinkHeaders(fetchFunction, uri) {
  throw new Error("Link headers not yet implemented")
}

export async function getEventData(fetchFunction, uri) {
  const dataset = await getSolidDataset(uri, {fetch: fetchFunction})
  let things = getThingAll(dataset, uri)
  let thing = things && things[0]
  return {
    id: asUrl(thing),
    type: getUrlAll(thing, RDF.type),
    inReplyTo: getUrlAll(thing, AS.inReplyTo),
    actor: getUrlAll(thing, AS.actor),
    object: getUrlAll(thing, AS.object),
    subject: getUrlAll(thing, AS.subject),
  }
}
