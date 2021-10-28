/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
import { getSolidDataset, getThing, getUrlAll } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { FOAF } from "@inrupt/vocab-common-rdf";
import { useState, useEffect } from "react";
/**
 *
 * @param {fetch: Function, webId: string, types: string[] } props
 * @returns
 */
export default function useContacts(target) {
  const { session } = useSession();
  const [contacts, setContacts] = useState([]); // List of artefact URIs
  useEffect(() => {
    if (!target) return;
    let running = true;
    async function runEffect() {
      let dataset = null;
      let thing = null;
      try {
        dataset = await getSolidDataset(target, { fetch: session.fetch });
        if (!dataset) return;
        thing = getThing(dataset, target);
        if (!thing) return;
        if (running) setContacts(getUrlAll(thing, FOAF.knows));
      } catch (error) {
        console.error(`Error retrieving contacts for ${target}: ${error}`);
      }
    }
    runEffect();
    return () => {
      running = false;
    };
  }, [session.fetch, target]);

  return contacts;
}
