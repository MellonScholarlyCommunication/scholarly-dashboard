/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
import {
  saveFileInContainer,
  getSourceUrl,
  getSolidDataset,
  getThing,
  getUrlAll,
  setThing,
  saveSolidDatasetAt,
  getThingAll,
  getContainedResourceUrlAll,
  getUrl,
  getResourceInfo,
  isContainer,
  createContainerAt,
  overwriteFile,
  hasResourceAcl,
  createAclFromFallbackAcl,
  saveAclFor,
  getResourceInfoWithAcl,
  setPublicResourceAccess,
  getStringNoLocale,
  asUrl,
  setUrl,
} from "@inrupt/solid-client";
import { SOLID } from "@inrupt/vocab-solid";
import { AS, FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import DataFactory from "@rdfjs/data-model";
import rdfSerializer from "rdf-serialize";
import { getBaseIRI, getQuadsFromDataset, NS_ORE } from "./util";
// eslint-disable-next-line import/no-cycle
import { createNotification, sendNotification } from "./NotificationUtils";
import {
  generateArtefactResourceDescriptionQuads,
  generateTypeIndexEntryThing,
} from "./ArtefactMetadataGeneration";
import generateLandingPageHTML from "./LandingPageGeneration";

const LinkHeader = require("http-link-header");

export const LINKTYPE = `${NS_ORE}ResourceMap`;
export const LANDINGPAGEPREDICATE = "https://mellon.org/ns/landingPage";

/**
 *
 * @param {*} fetchFunc The authenticated fetch function for Solid.
 * @param {*} webId The user WebId.
 * @param {*} data The artefact data object.
 * @param {*} data.title The artefact title.
 * @param {*} data.abstract The artefact abstract.
 * @param {*} data.file The artefact file.
 * @param {*} data.type The artefact type (publication, dataset, ...).
 * @param {*} data.format The artefact content type.
 * @returns
 */
export async function postArtefactWithMetadata(fetchFunc, webId, data) {
  console.log("posting with metadata", data);
  // TODO Validation
  const randomizedUUID = Math.floor(1000 + Math.random() * 9000);

  data.contentType = data.contentType || "text/turtle";

  await createFolderRecursiveIfNotExists(data.location, fetchFunc);

  const submittedFile = await postFileToContainer(
    fetchFunc,
    data.location,
    data.file,
    randomizedUUID
  );
  const fileLocation = getSourceUrl(submittedFile);
  data.resourceURI = fileLocation;

  const artefactResourceDescriptionQuads =
    generateArtefactResourceDescriptionQuads(webId, data);

  const response = await postQuadsAtURL(
    fetchFunc,
    artefactResourceDescriptionQuads,
    data.location,
    "text/turtle"
  );
  const resourceMapLocation = response.headers.get("Location");
  const aggregationURI =
    resourceMapLocation && `${resourceMapLocation}#aggregation`;
  const userThing = getThing(
    await getSolidDataset(webId, { fetch: fetchFunc }),
    webId
  );
  let authorThings = data.authors.map(async (a) =>
    getThing(await getSolidDataset(a.webId, { fetch: fetchFunc }), a.webId)
  );
  authorThings = await Promise.all(authorThings);

  // Create artefact landing page
  const landingPageHTML = generateLandingPageHTML({
    baseURL: data.location, // The BaseURL of the landing page is the location where the resources are uploaded.
    title: data.title,
    aggregation: { uri: aggregationURI, contentType: "text/turtle" },
    aggregated: [
      { uri: data.resourceURI, title: data.title, format: data.format },
    ],
    profile: {
      webId,
      name: getThingName(userThing),
      image: getUrl(userThing, VCARD.hasPhoto), // name of the current datapod owner
    },
    abstract: data.abstract,
    keywords: [],
    authors: authorThings.map((thing) => {
      return { webId: asUrl(thing), name: getThingName(thing) };
    }),
    organizations: authorThings.map((thing) => {
      return {
        uri: "",
        name: getStringNoLocale(thing, VCARD.organization_name),
      };
    }),
  });

  const savedLandingPageFile = await saveFileInContainer(
    data.location,
    new Blob([landingPageHTML], { type: "text/html" }),
    {
      slug: `landingpage-${`${randomizedUUID}-${data.file.name || ""}`}.html`,
      contentType: "text/html",
      fetch: fetchFunc,
    }
  );
  const landingPageLocation = getSourceUrl(savedLandingPageFile);

  // Update resourceMap to include link to landing page
  updateThingPropertyInDataset(
    fetchFunc,
    resourceMapLocation,
    resourceMapLocation,
    LANDINGPAGEPREDICATE,
    landingPageLocation,
    setUrl
  );

  // Link the created resources
  if (resourceMapLocation) {
    // Update type index
    await linkArtefactToProfile(
      fetchFunc,
      webId,
      resourceMapLocation,
      LINKTYPE
    );
    await linkArtefactToProfile(fetchFunc, webId, fileLocation, data.type);
  }

  // Send Notification
  const notificationData = {
    type: AS.Create,
    actor: webId,
    object: resourceMapLocation,
  };
  const notificationDataset = await createNotification(
    fetchFunc,
    notificationData
  );
  sendNotification(fetchFunc, webId, notificationDataset);

  // Set access to newly created items
  // Set public read access to uploaded artefact
  if (fileLocation)
    await createPublicReadAclIfNotExists(fileLocation, fetchFunc);
  // Set public read access to uploaded ORE metadata file
  if (resourceMapLocation)
    await createPublicReadAclIfNotExists(resourceMapLocation, fetchFunc);
  // Set public read access for landing page
  if (landingPageLocation)
    await createPublicReadAclIfNotExists(landingPageLocation, fetchFunc);

  return { fileId: fileLocation, resourceMapURI: resourceMapLocation };
}

export const DEFAULTNAMEPREFIX =
  "https://inrupt.com/.well-known/sdk-local-node/";
const streamifyArray = require("streamify-array");
const stringifyStream = require("stream-to-string");

export async function postDatasetAtURLWithDefaultThing(
  fetchFunction,
  dataset,
  containerURL,
  defaultName,
  contentType
) {
  let datasetQuads = getQuadsFromDataset(dataset);
  // Process quads to map default URL on the url of the to be posted thing
  const defaultNamedNode = DataFactory.namedNode("");
  defaultName = DEFAULTNAMEPREFIX + defaultName;
  datasetQuads = datasetQuads.map((q) => {
    if (q.subject.value === defaultName) {
      q.subject = defaultNamedNode;
    }
    if (q.object.value === defaultName) {
      q.object = defaultNamedNode;
    }
    return q;
  });
  const quadStream = streamifyArray(datasetQuads);
  const textStream = rdfSerializer.serialize(quadStream, {
    contentType,
  });
  const stringRepresentation = await stringifyStream(textStream);
  return await fetchFunction(containerURL, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: stringRepresentation,
  });
}

export async function postQuadsAtURL(
  fetchFunction,
  quads,
  containerURL,
  contentType
) {
  const quadStream = streamifyArray(quads);
  const textStream = rdfSerializer.serialize(quadStream, {
    contentType,
  });
  const stringRepresentation = await stringifyStream(textStream);
  return await fetchFunction(containerURL, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: stringRepresentation,
  });
}

export async function createResourceIfNotExists(
  fileURI,
  fileContents,
  contentType,
  fetchFunction
) {
  if (!fileURI || !fileContents) return;
  let resourceInfo = null;
  try {
    resourceInfo = await getResourceInfo(fileURI);
  } catch (_ignored) {
    resourceInfo = null;
  }
  // I use IsContainer to test if the found resource can be read as a file
  try {
    if (!resourceInfo || !getSourceUrl(resourceInfo)) {
      // Create the requested container
      overwriteFile(fileURI, new Blob([fileContents], { type: contentType }), {
        contentType,
        fetch: fetchFunction,
      });
    }
  } catch (e) {
    alert(`Could not create requested file: ${fileURI} - ${e.message}`);
  }
}

export async function createFolderRecursiveIfNotExists(
  folderURI,
  fetchFunction
) {
  if (!folderURI) return;

  let resourceInfo = null;
  try {
    resourceInfo = await getResourceInfo(folderURI);
  } catch (_ignored) {
    resourceInfo = null;
  }
  // I use IsContainer to test if the found resource can be read as a container
  try {
    if (!resourceInfo || !isContainer(resourceInfo)) {
      // Create the requested container
      createContainerAt(folderURI, { fetch: fetchFunction });
    }
  } catch (e) {
    alert(`Could not create requested folder: ${folderURI} - ${e.message}`);
  }
}

/**
 *
 * @param {Function} fetchFunc
 * @param {String} webId
 * @param {String[]} artefactTypes
 * @returns
 */
export async function getTypeRegistrationEntry(
  fetchFunc,
  webId,
  artefactTypes
) {
  if (!webId) return [];
  const matches = { instances: [], containers: [] };
  const profileDataset = await getSolidDataset(webId, { fetch: fetchFunc });
  const profileThing = getThing(profileDataset, webId);
  const typeIndexURIs = getUrlAll(profileThing, SOLID.publicTypeIndex);
  if (!typeIndexURIs || !typeIndexURIs.length) return matches;
  const typeIndexURI = typeIndexURIs[0];
  const typeIndexDataset = await getSolidDataset(typeIndexURI, {
    fetch: fetchFunc,
  });
  const entries = getThingAll(typeIndexDataset);
  for (const typeIndexEntry of entries) {
    const entryTypes = getUrlAll(typeIndexEntry, SOLID.forClass);
    for (const type of artefactTypes) {
      if (entryTypes.indexOf(type) !== -1) {
        // Add matching urls to results
        matches.instances = matches.instances.concat(
          getUrlAll(typeIndexEntry, SOLID.instance)
        );
        matches.containers = matches.containers.concat(
          getUrlAll(typeIndexEntry, SOLID.instanceContainer)
        );
        break;
      }
    }
  }
  return matches;
}

export async function getContainedResourceURLs(fetchFunc, containerId) {
  const containerDataset = await getSolidDataset(containerId, {
    fetch: fetchFunc,
  });
  return getContainedResourceUrlAll(containerDataset);
}

export async function getArtefactMetadataThings(
  fetchFunc,
  artefactResourceMapId
) {
  const resourceMapDataset = await getSolidDataset(artefactResourceMapId, {
    fetch: fetchFunc,
  });
  const resourceMapThing = getThing(resourceMapDataset, artefactResourceMapId);

  const aggregationId = getUrl(resourceMapThing, `${NS_ORE}describes`);
  const aggregationDataset = await getSolidDataset(aggregationId, {
    fetch: fetchFunc,
  });
  const aggregationThing = getThing(aggregationDataset, aggregationId);

  return {
    resourceMap: resourceMapThing,
    aggregation: aggregationThing,
    instances: getUrlAll(aggregationThing, `${NS_ORE}aggregates`).map((id) =>
      getThing(aggregationDataset, id)
    ),
  };
}

export async function linkArtefactToProfile(
  fetchFunc,
  webId,
  artefactId,
  artefactType
) {
  // TODO:: create type index if none available

  const profileDataset = await getSolidDataset(webId, { fetch: fetchFunc });
  const profileThing = getThing(profileDataset, webId);
  const typeIndexURIs = getUrlAll(profileThing, SOLID.publicTypeIndex);
  if (!typeIndexURIs || !typeIndexURIs.length) return null;
  // Take the first one, should only be one and no use updating all
  const typeIndexURI = typeIndexURIs[0];

  const TypeIndexEntryThing = generateTypeIndexEntryThing(
    artefactId,
    artefactType
  );
  let typeIndexDataset = await getSolidDataset(typeIndexURI, {
    fetch: fetchFunc,
  });
  typeIndexDataset = setThing(typeIndexDataset, TypeIndexEntryThing);

  // save the update type index
  const savedSolidDataset = await saveSolidDatasetAt(
    typeIndexURI,
    typeIndexDataset,
    { fetch: fetchFunc }
  );
  return savedSolidDataset;
}

export async function postFileToContainer(
  fetchFunc,
  targetContainerURL,
  file,
  randomizedUUID
) {
  let location;
  const fetchFunction = fetchFunc || fetch;
  try {
    const savedFile = await saveFileInContainer(
      targetContainerURL, // Container URL
      file, // File
      {
        slug: ((randomizedUUID && `${randomizedUUID}-`) || "") + file.name,
        contentType: file.type,
        fetch: fetchFunction,
      }
    );
    console.log(`File saved at ${getSourceUrl(savedFile)}`);
    return savedFile;
  } catch (error) {
    console.error(error);
  }

  return location;
}

export async function checkFolder(fetchFunc, dirURI) {
  const response = await fetchFunc(dirURI, {
    method: "HEAD",
  });
  return response;
}

export async function createFolder(fetchFunc, url) {
  if (!(await checkFolder(fetchFunc, url)))
    return await postEmpty(fetchFunc, url);
  return null;
}

async function postEmpty(fetch, containerUrl) {
  const parentUrl = getParentUrl(containerUrl);

  if (!(await checkFolder)) {
    await createFolder(fetch, parentUrl);
  }

  const response = await fetch(containerUrl, {
    method: "POST",
    headers: {
      Link: `<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"`,
      "Content-Type": "text/turtle",
    },
    body: "",
  });
  return response;
}

const getParentUrl = (url) => {
  url = removeSlashesAtEnd(url);
  return url.substring(0, url.lastIndexOf("/") + 1);
};

const removeSlashesAtEnd = (url) => {
  while (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
};

export async function createPublicReadAclIfNotExists(
  resourceURI,
  fetchFunction
) {
  if (!resourceURI) return;
  const resourceWithPerms = await getResourceInfoWithAcl(resourceURI, {
    fetch: fetchFunction,
  });
  if (!resourceWithPerms) return;
  if (!(await hasResourceAcl(resourceWithPerms))) {
    const resourceAcl = await createAclFromFallbackAcl(resourceWithPerms);
    const updatedAcl = await setPublicResourceAccess(resourceAcl, {
      read: true,
    });
    await saveAclFor(resourceWithPerms, updatedAcl, { fetch: fetchFunction });
  }
}

// https://solid.github.io/specification/protocol#storage
export async function getStorageRoot(url, fetchFunction) {
  if (!url) return null;
  // Clients can determine the storage of a resource by moving up the URI path hierarchy until the response includes a Link header with rel="type" targeting http://www.w3.org/ns/pim/space#Storage. Clients may check the root path of a URI for the storage claim at any time.
  const spliturl = url.split("/");
  let index = spliturl.length;
  while (index > 0) {
    const currentURL = `${spliturl.slice(0, index).join("/")}/`;
    // eslint-disable-next-line no-await-in-loop
    const response = await fetchFunction(currentURL, { method: "HEAD" });

    const linkHeaders = response.headers.get("Link");
    if (!linkHeaders || !linkHeaders.length) return "";
    const links = LinkHeader.parse(linkHeaders);
    for (const typeLink of links.get("rel", "type")) {
      if (typeLink.uri === "http://www.w3.org/ns/pim/space#Storage") {
        return currentURL;
      }
    }

    // Fix to keep it from running towards http://
    if (currentURL === getBaseIRI(url)) return null;
    index -= 1;
  }
  return "";
}

function getThingName(thing) {
  return (
    getStringNoLocale(thing, VCARD.fn) || getStringNoLocale(thing, FOAF.name)
  );
}
/**
 *
 * @param {Function} fetchFunction - An authenticated fetch function.
 * @param {*} datasetURL - The URL of the dataset.
 * @param {*} thingURL - The URL of the thing
 * @param {*} predicate - The property to add / update on the thing
 * @param {*} value - The value to update the property with
 * @param {*} updateFunction - Function of the inrupt libs to update the thing with
 */
async function updateThingPropertyInDataset(
  fetchFunction,
  datasetURL,
  thingURL,
  predicate,
  value,
  updateFunction
) {
  let dataset = await getSolidDataset(datasetURL, { fetch: fetchFunction });
  if (!dataset) throw new Error(`Could not load dataset at url: ${datasetURL}`);
  let thing = getThing(dataset, thingURL);
  if (!thing) throw new Error(`Could not load thing at url: ${thingURL}`);
  thing = updateFunction(thing, predicate, value);
  dataset = setThing(dataset, thing);
  const savedSolidDataset = await saveSolidDatasetAt(
    datasetURL,
    dataset,
    { fetch: fetchFunction } // fetch from authenticated Session
  );
  return savedSolidDataset;
}
