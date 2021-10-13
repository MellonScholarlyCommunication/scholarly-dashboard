import { overwriteFile, saveFileInContainer, getSourceUrl, saveSolidDatasetInContainer, getSolidDataset, getThing, getUrlAll, setThing, saveSolidDatasetAt, getThingAll, getContainedResourceUrlAll, getStringNoLocaleAll, getDatetime, getDatetimeAll, getUrl, getResourceInfo, getEffectiveAccess, isContainer, createContainerAt } from "@inrupt/solid-client";
import { generateArtefactResourceDescription, generateArtefactMetadata, generateTypeIndexEntry, generateTypeIndexEntryThing } from "./ArtefactMetadataGeneration";
import { SOLID } from "@inrupt/vocab-solid"
import { RDF } from "@inrupt/vocab-common-rdf";
import { AS, DCTERMS } from "@inrupt/lit-generated-vocab-common";
import { getBaseIRI, NS_DCMI, NS_ORE } from "./util";
import { createNotification, sendNotification } from "./NotificationUtils";

export const LINKTYPE = NS_ORE+"ResourceMap"


export async function postArtefactWithMetadata(fetchFunc, webId, data) {
  // TODO Validation

  data.contentType = data.contentType || "text/turtle"

  await createFolderRecursive(data.location, fetchFunc)

  const submittedFile = await postFileToContainer(fetchFunc, data.location, data.file)
  const fileLocation = getSourceUrl(submittedFile)
  data.resourceURI = fileLocation

  const artefactResourceDescription = generateArtefactResourceDescription(webId, data)
  const artefactFileSubmitted = await saveSolidDatasetInContainer(
    data.location,
    artefactResourceDescription,
    { fetch: fetchFunc }             // fetch from authenticated Session
  );

  let resourceDescriptionSourceURL = getSourceUrl(artefactFileSubmitted)
  let thingRetrieved = getThing(artefactFileSubmitted, resourceDescriptionSourceURL+"#resourceMap")
  let resourceMapLocation = thingRetrieved.url

  if (resourceMapLocation) {
    // Update type index
    await linkArtefactToProfile(fetchFunc, webId, resourceMapLocation, LINKTYPE)
    await linkArtefactToProfile(fetchFunc, webId, fileLocation, data.type)
  }

  // Send Notification
  let notificationData = {type: AS.Create, actor: webId, object: resourceMapLocation, target: webId}
  let notificationDataset = await createNotification(notificationData)
  sendNotification(fetchFunc, notificationDataset, notificationData.target)
  
  return {fileId: fileLocation, resourceMapURI: resourceMapLocation}

}


export async function createFolderRecursive(folderURI, fetchFunction) {
  if(!folderURI) return

  let resourceInfo = null;
  try { resourceInfo = await getResourceInfo(folderURI) } 
  catch (_ignored) {}
  // I use IsContainer to test if the found resource can be read as a container
  try {
    if (!resourceInfo || !isContainer(resourceInfo)) {
      // Create the requested container
      return await createContainerAt(folderURI, {fetch:fetchFunction})
    } else {
      return resourceInfo
    }
  } catch (e) {
    alert(`Could not create requested folder: ${folderURI} - ${error.message}`)
    return null
  }
}

/**
 * 
 * @param {Function} fetchFunc 
 * @param {String} webId 
 * @param {String[]} artefactTypes 
 * @returns 
 */
export async function getTypeRegistrationEntry(fetchFunc, webId, artefactTypes){
  const matches = {instances: [], containers: []}
  const profileDataset = await getSolidDataset( webId, { fetch: fetchFunc } ); 
  const profileThing = getThing(profileDataset, webId)
  const typeIndexURIs = getUrlAll(profileThing, SOLID.publicTypeIndex)
  if (!typeIndexURIs || !typeIndexURIs.length) return matches;
  let typeIndexURI = typeIndexURIs[0] 
  let typeIndexDataset = await getSolidDataset( typeIndexURI, { fetch: fetchFunc } ); 
  let entries = getThingAll(typeIndexDataset)
  for (let typeIndexEntry of entries) {
    const entryTypes = getUrlAll(typeIndexEntry, SOLID.forClass)
    for (const type of artefactTypes) {
      if (entryTypes.indexOf(type) !== -1) {
        // Add matching urls to results
        matches.instances = matches.instances.concat(getUrlAll(typeIndexEntry, SOLID.instance))
        matches.containers = matches.containers.concat(getUrlAll(typeIndexEntry, SOLID.instanceContainer))
        break;
      }
    }
  }
  return matches
}


export async function getContainedResourceURLs(fetchFunc, containerId) {
  const containerDataset = await getSolidDataset( containerId, { fetch: fetchFunc } ); 
  return getContainedResourceUrlAll( containerDataset )
}


export async function getArtefactMetadataThings(fetchFunc, artefactResourceMapId) {
  const resourceMapDataset = await getSolidDataset( artefactResourceMapId, { fetch: fetchFunc } ); 
  const resourceMapThing = getThing(resourceMapDataset, artefactResourceMapId)

  const aggregationId = getUrl(resourceMapThing, NS_ORE+"describes")
  const aggregationDataset = await getSolidDataset(aggregationId, { fetch: fetchFunc } ); 
  const aggregationThing = getThing(aggregationDataset, aggregationId)

  return ( { resourceMap: resourceMapThing, aggregation: aggregationThing, instances: getUrlAll(aggregationThing, NS_ORE+"aggregates").map(id => getThing(aggregationDataset, id)) } )
}


export async function linkArtefactToProfile(fetchFunc, webId, artefactId, artefactType) {
  // TODO:: create type index if none available

  const profileDataset = await getSolidDataset( webId, { fetch: fetchFunc } ); 
  const profileThing = getThing(profileDataset, webId)
  const typeIndexURIs = getUrlAll(profileThing, SOLID.publicTypeIndex)
  if (!typeIndexURIs || !typeIndexURIs.length) return;
  // Take the first one, should only be one and no use updating all
  let typeIndexURI = typeIndexURIs[0] 

  let TypeIndexEntryThing = generateTypeIndexEntryThing(artefactId, artefactType)
  let typeIndexDataset = await getSolidDataset( typeIndexURI, { fetch: fetchFunc } ); 
  typeIndexDataset = setThing(typeIndexDataset, TypeIndexEntryThing)
  
  // save the update type index
  const savedSolidDataset = await saveSolidDatasetAt(
    typeIndexURI,
    typeIndexDataset,
    { fetch: fetchFunc }
  )
  return savedSolidDataset
}

export async function postFileToContainer(fetchFunc, targetContainerURL, file) {
  let location;
  const fetchFunction = fetchFunc || fetch
  try {
    const savedFile = await saveFileInContainer(
      targetContainerURL,           // Container URL
      file,                         // File 
      { slug: file.name, contentType: file.type, fetch: fetchFunction }
    );
    console.log(`File saved at ${getSourceUrl(savedFile)}`);
    return savedFile
  } catch (error) {
    console.error(error);
  }

  return location
}

export async function checkFolder (fetchFunc, dirURI) {
  const response = await fetchFunc(dirURI, {
    method: 'HEAD'
  })
  return response;
}

export async function createFolder (fetchFunc, url) {
  if (!await checkFolder(fetchFunc, url))
    return await postEmpty(fetchFunc, url)
}

async function postEmpty (fetch, containerUrl) {
  const parentUrl = getParentUrl(containerUrl)

  if (!await checkFolder) {
    await createFolder(fetch, parentUrl)
  }

  const response = await fetch(containerUrl, {
    method: "POST",
    headers: {
      "Link": `<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"`,
      'Content-Type': "text/turtle",
    },
    body: ''
  })
  return response
}

const getParentUrl = url => {
  url = removeSlashesAtEnd(url)
  return url.substring(0, url.lastIndexOf('/') + 1)
}

const removeSlashesAtEnd = url => {
  while (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  return url
}
