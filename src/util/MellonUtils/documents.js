import { getVal, getValArray } from "../../singletons/QueryEngine";
import ns from "../NameSpaces";
import { putFile, patchFile, postFile, getFile } from "../FileUtil";
import { getError } from "../../Errors/errors";
import { createACL, createPermission, MODES } from "../PermissionManager";
import { getBaseIRI } from "../Util";
import { getResourceAsStore } from "@dexagod/rdf-retrieval";
/**
 * Check profile for a publications collection
 * @param {string} webId 
 */
const getDocumentsCollection = async (webId) => await getVal(webId, ns.ex('publications'));

// const getCollectionMemberSeeAlso

/**
 * Get the documents metadata from the publications collection
 * @param {string} webId 
 */
const getPublicationIds = async (webId) => {
  const publications = await getValArray(webId, ns.ex('publications'), ns.hydra('member'));
  // const documentMetadataFileId = await getValArray(webId, ns.ex('publications'), ns.hydra('member'), ns.rdfs('isDefinedBy'));
  const documentsMetadata = []
  for (const [index, documentId] of publications.entries()) {
    documentsMetadata.push(documentId)
  }
  return documentsMetadata
}

/**
 * Get the documents metadata from the publications collection
 * @param {string} webId 
 */
const getPublications = async (webId) => {
  const publicationIds = await getPublicationIds(webId);
  const publications = []
  for (let publicationId of publicationIds) {
    publications.push(new Promise((resolve, reject) => {
      getPublicationData(publicationId).then(publicationData => {
        publicationData.name = publicationData && publicationData.title && publicationData.title[0]
        resolve(publicationData)
      })
    }))
  }
  return publications
}

const getDocumentMetadata = async (documentId, metadataId) => {
  console.log('testing', `${await getVal(metadataId, documentId)}`)
  const metadata = {
    id: metadataId,
    type: await getVal(metadataId, ns.rdf('type')),
    title: await getVal(metadataId, ns.ex('title')),
    keywords: await getValArray(metadataId, ns.ex('keywords')),
    date: await getVal(metadataId, ns.ex('date')),
    authors: await getValArray(metadataId, ns.ex('authors')),
    abstract: await getVal(metadataId, ns.ex('abstract')),
    comments: await getVal(metadataId, ns.ex('comments')),
  }
  metadata.date = metadata.date && new Date(metadata)
  return metadata
}

const getPublicationData = async (id) => {
  console.log('getting data from', id)
  console.log('getting title', JSON.stringify(await getValArray(id, 'type')))
  const publication = {
    id: id,
    type: await getValArray(id, ns.rdf('type')),
    title: await getValArray(id, ns.ex('title')),
    keywords: await getValArray(id, ns.ex('keywords')),
    authors: await getValArray(id, ns.ex('authors')),
    date: await getValArray(id, ns.ex('date')),
    abstract: await getValArray(id, ns.ex('abstract')),
    file: await getValArray(id, ns.ex('file')),
    lifecycleEvents: await getValArray(id, ns.ex('lifecycleEvents')),
  }
  publication.date = publication.date && new Date(publication.date)
  console.log('retrieved:', publication)
  return publication
}

/**
 * Function to retrieve events from an LDES ldp container
 * @param {string} id The LDES directory id
 */
const retrieveLDESEventIds = async (id) => {
  const store = await getResourceAsStore(id)
  const assertion = await store.getQuads(id, ns.rdf('type'), ns.ldes('EventStream'))
  if (!assertion || !assertion.length) return [];

  // Discover all the member events
  const eventIds = (await store.getQuads(id, ns.ldp('Resource'), null)).map(q => q.object.id)
  return eventIds
}

const retrieveEvent = async (id) => {
  const event = {
    id: id,
    type: await getValArray(id, ns.rdf('type')),
    created_at: await getValArray(id, ns.ex('created_at')),
    token: await getValArray(id, ns.ex('token')),
  }
  event.created_at = event.created_at && new Date(event.created_at)
  return event
}

const retrieveLDESEvents = async (id) => {
  const eventIds = await retrieveLDESEventIds(id)
  const events = []
  for (let eventId of eventIds) {
    events.push(retrieveEvent(eventId))
  }
  return Promise.all(events)
}



/**
 * Create publication document in turtle format
 * @param {*} documentMetadata 
 * @param {*} documentId 
 */
const createPublicationTTLResource = (documentMetadata, documentURI, eventStreamURI) => {
  return `
  @prefix : <#>.
  @prefix ex: <${ns.ex('')}> .
  @prefix xsd: <${ns.xsd('')}> .
  :artefact a ex:Publication ;
    ex:title "${documentMetadata.title}" ;
    ex:keywords "${documentMetadata.keywords.join('", "')}" ;
    ex:date "${documentMetadata.date}"^^xsd:date ;
    ex:authors <${documentMetadata.authors.join('>, <')}> ;
    ex:abstract "${documentMetadata.abstract}" ;
    ex:file <${documentURI}> ;
    ex:lifecycleEvents <${eventStreamURI}> .
  `
}

const createEventStreamMetadataFile = () => {
  return `
@prefix : <#>.
@prefix folder: <>.
@prefix ldes: <https://w3id.org/ldes#>.
folder: a ldes:EventStream.
  `
}

const createCollectionPatchBody = async (webId, publicationResourceId) => {
  const collectionId = await getDocumentsCollection(webId)
  return `INSERT { 
    <${collectionId}> <${ns.hydra('member')}> <${publicationResourceId}>.
  }`
}

/**
 * 
 * @param {File} file Publication Document
 * @param {string} location Location to publish the publication document root
 * @returns {{rootURI: string, publicationURI: string, publicationDocumentURI: string, eventStreamFolderURI: string}}
 */
const getPublicationURIs = (file, location, publicationExtension = '.ttl') => {
  if (!location) return;
  if (!location.endsWith("/")) location = location + "/";
  const fileNameBaseFolder = file.name.split('.')[0] + '/'
  const rootURI = location + fileNameBaseFolder
  const publicationDocumentURI = rootURI+file.name
  const publicationURI = createPublicationIdentifier(publicationDocumentURI)
  const eventStreamFolderURI = rootURI+'eventStream/'
  const artefactURI = publicationURI+'#artefact'
  return { rootURI, publicationURI, publicationDocumentURI, eventStreamFolderURI, artefactURI };
}

const createPublicationIdentifier = (documentId, extention) => {
  const split = documentId.split('.');
  return split.slice(0, split.length-1).join('.') + '_publication.' + (extention || 'ttl')
}

const checkAndThrowErrors = (response, URI, requestBody) => {
  if (response.code >= 400 && response.code < 500) throw new getError(URI, response, requestBody)
}


/**
 * 
    submission.authors = submission.authors.map(a => a.webId).filter(a => !!a)
    submission.keywords = submission.authors.map(k => k.val).filter(k => !!k)
    submission.file = submission.file[0]
 * @param {{title: string, date: Date, abstract: string, description?: string, authors: string[], keywords: string[], file: any, location: string}} submission 
 * @param {string} webId The user WebId
 */
const uploadPublication = async (submission, webId) => {
  const documentMetadata = submission
  const location = submission.location
  
  // rootURI, publicationURI, publicationDocumentURI, eventStreamFolderURI
  const publicationIds = getPublicationURIs(documentMetadata.file, location)
  
  // Uploading submission document (the publication document in pdf / http format)
  const documentPut = putFile(publicationIds.publicationDocumentURI, documentMetadata.file)
  checkAndThrowErrors(documentPut, publicationIds.publicationDocumentURI, documentMetadata.file.name)
  
  // Uploading the publication file, containing the required metadata, and referencing the uploaded file
  const publicationRDFResource = createPublicationTTLResource(documentMetadata, publicationIds.publicationDocumentURI, publicationIds.eventStreamFolderURI)
  const publicationPut = await putFile(publicationIds.publicationURI, publicationRDFResource, {"Content-Type": 'text/turtle'})
  checkAndThrowErrors(publicationPut, publicationIds.publicationURI, publicationRDFResource)

  // create event stream metadata body
  const FolderMetadataBody = await createEventStreamMetadataFile()
  // set LDES folder metadata
  // this indirectly also creates the event stream folder
  const eventStreamMetadataPut = await putFile(publicationIds.eventStreamFolderURI+'.meta', FolderMetadataBody, {"Content-Type": 'text/turtle'})
  checkAndThrowErrors(eventStreamMetadataPut, publicationIds.eventStreamFolderURI+'.meta', FolderMetadataBody)
  
  // Update collection
  const patchBody = await createCollectionPatchBody(webId, publicationIds.artefactURI)
  const patch = await patchFile(webId, patchBody)
  checkAndThrowErrors(patch, webId, patchBody)

  
  // Set public read permissions for the publication
  await createACL(webId, publicationIds.rootURI,
    [createPermission([MODES.READ], null)]
  );
  // Enable write permissions for the even stream
  await createACL(webId, publicationIds.eventStreamFolderURI,
    [createPermission([MODES.READ, MODES.WRITE], null)]
  );

  // Post a created lifecycle event to the eventstream
  const eventpostbody = await createLifecycleEvent(webId, 'Create')
  const eventpost = await postFile(publicationIds.eventStreamFolderURI, eventpostbody)
  checkAndThrowErrors(eventpost, publicationIds.eventStreamFolderURI, eventpostbody)
  
  return publicationIds.publicationURI
}

const getDocumentMetadataId = async (webId, documentId) => {
  const documentsAndMetadata = await getPublicationIds(webId);
  const documentIds = documentsAndMetadata.filter(e => e.id === documentId)
  return documentIds[0] && documentIds[0].metadataId
}



const createLifecycleEvent = (webId, eventType) => {
  return `
  @prefix ex: <${ns.ex('')}> .
  @prefix xsd: <${ns.xsd('')}> .
  <> a ex:${eventType} ;
   ex:created_at "${new Date().toISOString()}"^^xsd:date ;
   ex:creator <${webId}> .
  `
}

const createComment = (commentData) => {
  return `
    @prefix sioc: <${ns.sioc('')}> .
    @prefix xsd: <${ns.xsd('')}> .
    <> a sioc:Post ;
     sioc:reply_of <${commentData.reply_of}> ;
     sioc:created_at "${commentData.created_at}"^^xsd:date ;
     sioc:has_creator "${commentData.has_creator}" ;
     sioc:content <${commentData.content}> ;
     sioc:note "${commentData.node}" .
  `
}

const createCommentNotifications = (webId, commentId, commentData) => {
  return `
    @prefix as: <${ns.as('')}> .
    @prefix sioc: <${ns.sioc('')}> .
    <> a as:Announce ;
      as:actor <${webId}> ;
      as:object [ 
        a as:Create ;
        as:actor <${webId}>  ;
        as:object <${commentId}> ;
        as:target <${commentData.reply_of}> ;
      ] ;
      as:summary "${webId} created a new comment on ${commentData.reply_of}." .
    <${commentId}> a sioc:Post ;
      sioc:reply_of <${commentData.reply_of}> .
  `
}

const createPublicationUploadNotification = (webId, documentId, metadataId) => {
  return `
    @prefix as: <${ns.as('')}> .
    @prefix rdfs: <${ns.rdfs('')}> .
    @prefix ex: <${ns.ex('')}> .
    <> a as:Announce ;
      as:actor <${webId}> ;
      as:object [ 
        a as:Create ;
        as:actor <${webId}>  ;
        as:object <${documentId}> ;
      ] ;
      as:summary "${webId} uploaded a new publication." .
    <${documentId}> a ex:Publication ;
      rdfs:isDefinedBy <${metadataId}> .
  `
}


const createAndPostComment = async (webId, commentData, metadataId) => {
  if (!commentData.documentId || !commentData.has_creator) {
    return false;
  }
  
  // Create comment body
  const commentbody = createComment(commentData)
  // Create comment file
  const postresponse = await postFile(commentData.location, commentbody)
  checkAndThrowErrors(postresponse, commentData.location, commentbody)
  const relativeCommentLocation = Object.fromEntries(postresponse.headers).location
  const absoluteCommentLocation = getBaseIRI(commentData.has_creator) + relativeCommentLocation.slice(1) // TODO:: is this the best way? webId base IRI , remove starting / for second part
  console.log('commentLocation', absoluteCommentLocation)

  await createACL(webId, absoluteCommentLocation,
    [createPermission([MODES.READ], null)] // make comment publicly readable
  );

  // // // Update metadata information with link to comment
  const patchBody = `INSERT { <${commentData.reply_of}> <${ns.ex('comments')}> <${absoluteCommentLocation}> }` 
  const response = await patchFile(metadataId, patchBody)
  checkAndThrowErrors(response, metadataId, patchBody)

  // // send notifications of comment to all contacts
  // const commentNotification = createCommentNotifications(webId, absoluteCommentLocation, commentData)
  // const profile = await fetchProfile(webId) || null
  // let contacts = (profile && profile.contacts) || [];
  // const agent = getInboxAgent(webId) 
  // agent.sendNotification({notification: commentNotification, to: contacts})

  return true
}
   


export {checkAndThrowErrors, getDocumentsCollection, getPublicationIds, uploadPublication, getDocumentMetadata, createAndPostComment, getDocumentMetadataId, getPublicationData, retrieveLDESEventIds, retrieveEvent, retrieveLDESEvents, getPublications}



