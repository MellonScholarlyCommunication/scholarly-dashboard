import { useSession } from "@inrupt/solid-ui-react";
import {useState, useEffect} from "react"
import { ARTEFACTTYPES } from "../components/artefacts";
import { getArtefactMetadataThings, getContainedResourceURLs, getTypeRegistrationEntry } from "../utils/FileUtils";

/**
 * 
 * @param {fetch: Function, webId: string, types: string[] } props 
 * @returns 
 */
export function useArtefacts(target, types) {
  const { session } = useSession();
  types = types && types.length || ARTEFACTTYPES
  const [artefactIds, setArtefactIds] = useState([]); // List of artefact URIs
  const [artefactMappings, setArtefactMappings] = useState(new Map()); // List of artefact URIs
  useEffect(() => {
    if(!target) return;
    let running = true;
    async function runEffect() {
      const {instances, containers} = await getTypeRegistrationEntry(session.fetch, target, types)
      let ids = instances
      for (let container of containers) {
        if (running) ids = ids.concat( await getContainedResourceURLs(session.fetch, container) )
      }
      if (running) setArtefactIds(ids)
    }
    runEffect();
    return () => { running = false; }
  }, [target, types])

  useEffect(() => {
    if(!artefactIds || !artefactIds.length) return;
    let running = true;
    async function runEffect() {
      let artefactMappings = await Promise.all(artefactIds.map(async (id) => [id, await getArtefactMetadataThings(session.fetch, id)]))
      artefactMappings = new Map(artefactMappings)
      if (running) setArtefactMappings(artefactMappings)
    }
    runEffect();
    return () => { running = false; }
  }, [artefactIds])

  return artefactMappings
}