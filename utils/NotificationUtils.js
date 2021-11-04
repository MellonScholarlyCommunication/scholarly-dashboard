import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import {
  buildThing,
  createSolidDataset,
  getSolidDataset,
  setThing,
  getThing,
  createThing,
  getUrl,
  asUrl,
  getStringNoLocale,
} from "@inrupt/solid-client";
import { AS, LDP, RDF } from "@inrupt/vocab-common-rdf";
// eslint-disable-next-line import/no-cycle
import { postDatasetAtURLWithDefaultThing } from "./FileUtils";
import { ORCHESTRATORPREDICATE } from "./util";

export const ORIGINURL = "https://rubendedecker.be/mellon/dashboard";
export const NOTIFICATIONCONTENTTYPE = "application/ld+json";

function buildPersonThing(thing) {
  const inbox = getUrl(thing, LDP.inbox) || "";
  const name =
    getStringNoLocale(thing, FOAF.name) ||
    getStringNoLocale(thing, VCARD.fn) ||
    "";
  const orgname = getStringNoLocale(thing, VCARD.organization_name);

  let newThing = buildThing(createThing({ url: asUrl(thing) })).addUrl(
    RDF.type,
    AS.Person
  );
  if (name) newThing = newThing.addStringNoLocale(AS.name, name);
  if (inbox) newThing = newThing.addUrl(LDP.inbox, inbox);
  if (orgname)
    newThing = newThing.addStringNoLocale(VCARD.organization_name, orgname);
  return newThing.build();
}
function buildServiceThing(thing) {
  const inbox = getUrl(thing, LDP.inbox) || "";
  const name =
    getStringNoLocale(thing, FOAF.name) || getStringNoLocale(thing, VCARD.fn);

  let newThing = buildThing(createThing({ url: asUrl(thing) })).addUrl(
    RDF.type,
    AS.Service
  );
  if (name) newThing = newThing.addStringNoLocale(AS.name, name);
  if (inbox) newThing = newThing.addUrl(LDP.inbox, inbox);
  return newThing.build();
}

/**
 * Create notification body dataset
 * @param {type: string, actor: string, target: string, object: string} data
 */
export async function createNotification(fetchFunc, data) {
  const actorOriginalThing = data.actor
    ? getThing(
        await getSolidDataset(data.actor, { fetch: fetchFunc }),
        data.actor
      )
    : null;

  const actorThing = actorOriginalThing
    ? buildPersonThing(actorOriginalThing)
    : null;
  const objectThing = data.object
    ? getThing(
        await getSolidDataset(data.object, { fetch: fetchFunc }),
        data.object
      )
    : null;
  const targetOriginalThing = data.target
    ? getThing(
        await getSolidDataset(data.target, { fetch: fetchFunc }),
        data.target
      )
    : null;
  const targetType =
    targetOriginalThing && getUrl(targetOriginalThing, RDF.type);
  const targetThing =
    targetType && targetType === FOAF.person
      ? buildPersonThing(targetOriginalThing)
      : buildServiceThing(targetOriginalThing);

  const originThing = buildThing(createThing({ url: ORIGINURL }))
    .addUrl(RDF.type, AS.Application)
    .addStringNoLocale(AS.name, "Mellon dashboard application")
    .build();

  // Create a new SolidDataset for Writing 101
  let notificationDataset = createSolidDataset();
  let notificationThing = buildThing(createThing({ url: data.id })).addUrl(
    RDF.type,
    data.type
  );

  if (actorThing)
    notificationThing = notificationThing.setIri(AS.actor, actorThing);
  if (objectThing)
    notificationThing = notificationThing.setIri(AS.object, objectThing);
  if (targetThing)
    notificationThing = notificationThing.setIri(AS.target, targetThing);

  notificationThing = notificationThing
    .addUrl(AS.origin, originThing)
    .addDatetime(AS.published, new Date())
    .build();

  notificationDataset = setThing(notificationDataset, notificationThing);
  if (actorThing)
    notificationDataset = setThing(notificationDataset, actorThing);
  if (objectThing)
    notificationDataset = setThing(notificationDataset, objectThing);
  if (targetThing)
    notificationDataset = setThing(notificationDataset, targetThing);
  notificationDataset = setThing(notificationDataset, originThing);

  return notificationDataset;
}

export async function sendNotification(
  fetchFunction,
  webId,
  dataset,
  notificationId
) {
  let orchestratorWebId = null;
  try {
    orchestratorWebId = getUrl(
      getThing(await getSolidDataset(webId, { fetch: fetchFunction }), webId),
      ORCHESTRATORPREDICATE
    );
  } catch (e) {
    alert(
      "Could not find orchestrator to route message. Please initialize the orchestrator field on your profile."
    );
    return null;
  }
  if (!orchestratorWebId) {
    alert(
      "Could not find orchestrator to route message. Please initialize the orchestrator field on your profile."
    );
    return null;
  }
  let inboxUrl = null;
  try {
    inboxUrl = getUrl(
      getThing(
        await getSolidDataset(orchestratorWebId, { fetch: fetchFunction }),
        orchestratorWebId
      ),
      LDP.inbox
    );
  } catch (e) {
    alert(
      "Could not find orchestrator to route message. Please initialize the orchestrator field on your profile."
    );
    return null;
  }
  if (!inboxUrl) {
    alert(`Could not discover inbox for: ${orchestratorWebId}`);
    return null;
  }
  const response = await postDatasetAtURLWithDefaultThing(
    fetchFunction,
    dataset,
    inboxUrl,
    NOTIFICATIONCONTENTTYPE,
    notificationId // "text/turtle"
  );
  if (response) {
    alert(`Notification sent to: ${inboxUrl}`);
  } else {
    alert(`Could not send notification to: ${inboxUrl || orchestratorWebId}`);
  }
  return response;
}
