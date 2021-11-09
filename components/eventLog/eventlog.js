/* eslint-disable no-await-in-loop */
import { DCTERMS } from "@inrupt/lit-generated-vocab-common";
import {
  getSolidDataset,
  getThing,
  getUrlAll,
  getThingAll,
  asUrl,
  getUrl,
} from "@inrupt/solid-client";

import { AS, RDF } from "@inrupt/vocab-common-rdf";
import { getContainedResourceURLs } from "../../utils/FileUtils";

const FOLLOWLINKS = [DCTERMS.publisher, DCTERMS.creator];

async function discoverBodyOutboxLinks(fetchFunction, uri) {
  const dataset = await getSolidDataset(uri, { fetch: fetchFunction });
  const thing = getThing(dataset, uri);
  return getUrlAll(thing, `${AS.NAMESPACE}outbox`);
}

async function discoverBodyAuthorLinks(fetchFunction, uri) {
  const dataset = await getSolidDataset(uri, { fetch: fetchFunction });
  const thing = getThing(dataset, uri);

  let results = [];
  for (const predicate of FOLLOWLINKS) {
    results = results.concat(getUrlAll(thing, predicate));
  }
  return [...new Set(results)];
}

async function checkEventMatchesArtefact(eventId, artefactId, fetchFunction) {
  const dataset = await getSolidDataset(eventId, { fetch: fetchFunction });
  if (!dataset) return false;
  const things = getThingAll(dataset);
  if (!things) return false;
  for (const thing of things) {
    const url = getUrl(thing, AS.object);
    if (url && url === artefactId) {
      return true;
    }
  }
  return false;
}

export async function getEventIds(fetchFunction, uri, artefactId) {
  if (!uri) return [];
  // Check Headers
  // TODO:: discoverLinkHeaders(fetchFunction, uri)

  // Check resource body if none discovered through header?
  let eventLogs = await discoverBodyOutboxLinks(fetchFunction, uri);

  // recursive call met links
  for (const webId of await discoverBodyAuthorLinks(fetchFunction, uri)) {
    eventLogs = eventLogs.concat(
      (await discoverBodyOutboxLinks(fetchFunction, webId)) || []
    );
  }

  let eventIds = [];
  for (const eventLogId of eventLogs) {
    eventIds = eventIds.concat(
      await getContainedResourceURLs(fetchFunction, eventLogId)
    );
  }

  if (artefactId) {
    const matchingIds = [];
    for (const eventId of eventIds) {
      if (await checkEventMatchesArtefact(eventId, artefactId, fetchFunction))
        matchingIds.push(eventId);
    }
    return matchingIds;
  }

  return eventIds;
}

const EVENTTYPES = [
  AS.Announce,
  AS.Offer,
  AS.Accept,
  AS.Reject,
  AS.Undo,
  AS.Create,
  AS.Update,
  AS.Delete,
].map((e) => e.toString());
export async function getEventThings(fetchFunction, eventId) {
  const dataset = await getSolidDataset(eventId, { fetch: fetchFunction });
  if (!dataset) return null;
  const things = getThingAll(dataset);
  if (!things) return null;
  const eventThings = [];
  for (const thing of things) {
    const typeUrls = getUrlAll(thing, RDF.type);
    for (const type of typeUrls) {
      if (EVENTTYPES.indexOf(type) !== -1) {
        eventThings.push(thing);
        // eslint-disable-next-line no-continue
        continue;
      }
    }
  }
  return eventThings;
}

export async function getEventData(fetchFunction, uri) {
  const dataset = await getSolidDataset(uri, { fetch: fetchFunction });
  const things = getThingAll(dataset, uri);
  const thing = things && things[0];
  return {
    id: asUrl(thing),
    type: getUrlAll(thing, RDF.type),
    inReplyTo: getUrlAll(thing, AS.inReplyTo),
    actor: getUrlAll(thing, AS.actor),
    object: getUrlAll(thing, AS.object),
    subject: getUrlAll(thing, AS.subject),
  };
}
