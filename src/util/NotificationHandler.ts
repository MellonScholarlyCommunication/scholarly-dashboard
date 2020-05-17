import CommunicationManager, { Notification } from "./CommunicationManager";
import { fstat } from "fs";
// This code is based on the solid-notifications package found at https://github.com/solid/solid-notifications
const DEFAULT_CONTENT_TYPE = "application/ld+json";
const DEFAULT_ACCEPT = "application/ld+json;q=0.9,text/turtle;q=0.8";
const INBOX_LINK_REL = "http://www.w3.org/ns/ldp#inbox";

export default class NotificationHandler {
  cm: CommunicationManager;
  auth: any;

  constructor(cm: CommunicationManager, auth: any) {
    this.cm = cm;
    this.auth = auth;
  }

  /**
   * Resolves to the LDN Inbox URI for a given resource.
   * @see https://www.w3.org/TR/ldn/#discovery
   * @param uri {string} Resource uri
   * @param webClient {SolidWebClient}
   * @param [resource] {SolidResponse} Optional resource (passed in if you already
   *   have requested the resource and have it handy). Saves making a GET request.
   * @throws {Error} Rejects with an error if the resource has no inbox uri.
   * @return {Promise<string>} Resolves to the inbox uri for the given resource
   */
  async discoverInboxUri(profileURI: string, resource?: any) {
    resource =
      resource ||
      (await this.auth.fetch(profileURI, {
        headers: {
          Origin: "http://localhost:8080",
          Link: "<meta.rdf>;rel=http://www.w3.org/ns/ldp#inbox"
        }
      }));
    // First check the headers for an inbox link rel
    const inboxLinkRel = resource.headers[INBOX_LINK_REL];
    if (inboxLinkRel) {
      return inboxLinkRel;
    }
    // If not found, parse the body, look for an ldp:inbox predicate
    const text = await resource.text();
    const store = await this.cm.getDataStore(
      text,
      this.cm.getBaseIRI(profileURI)
    );
    if (!store) return null;
    else {
      const matches = await store.getQuads(null, INBOX_LINK_REL, null, null);
      if (matches.length) {
        return matches[0].object.value;
      } else {
        return null;
      }
    }
  }

  /**
   * Resolves to a list of uris for notifications that reside in the inbox of a
   * given resource. If the optional `inboxUri` is not passed in, also performs
   * LDN inbox discovery.
   * @method getNotificationsFromInbox
   * @param resourceUri {string}
   * @return {Promise<Array<Notification>>}
   */
  async getNotificationsForURI (inboxURI : string) : Promise<Array<Notification>> {
    inboxURI = await this.discoverInboxUri(inboxURI) || inboxURI;
    const store = await this.cm.getDataStoreFromFile(inboxURI)
    const notificationIds = (await store.getQuads(inboxURI, "http://www.w3.org/ns/ldp#contains", null, null)).map(quad => (quad.object.id || quad.object.value))
    let notifications = []
    for (let notificationId of notificationIds) {
      notifications.push(await this.cm.getNotificationFromId(notificationId))
    } 
    return await Promise.all(notifications);
  }

  /**
   * Sends a notification to a given resource's LDN inbox. If no inbox uri is
   * provided in the options, also performs LDN Inbox discovery.
   * @see https://www.w3.org/TR/ldn/#discovery
   * @see https://www.w3.org/TR/ldn/#sending
   * @method send
   * @param inboxURI {string} Location of the inbox
   * @param payload {string} Notification body (serialized JSON-LD)
   * @return {Promise<SolidResponse>}
   */
  async send(inboxURI: string, payload: string) {
    return await this.auth.fetch(inboxURI, {
      method: "Post",
      headers: {
        "Content-Type": DEFAULT_CONTENT_TYPE
      },
      body: payload
    });
  }
}
