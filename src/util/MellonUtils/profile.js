import ns from "../../util/NameSpaces"
import { getVal, getValArray } from '../../singletons/QueryEngine'
import { patchFile } from "../FileUtil";
import { getError } from "../../Errors/errors";
import { getDocumentsCollection, checkAndThrowErrors } from "./documents";

/**
 * 
 * @param {string} id - The profile id
 */
const fetchProfile = async (id) => {
  console.log('fetching profile')
  id = await id;
  return {
    id: id,
    name: await getVal(id, ns.foaf('name')), 
    bdate: await getVal(id, ns.dbo('birthDate')), 
    location: await getVal(id, ns.dbo('location')),
    contacts: await getValArray(id, ns.foaf('knows'))
  }
}

const followProfile = async (webId, profileWebId) => {
  const patchBody = `INSERT { <${webId}> <${ns.foaf('knows')}> <${profileWebId}> }`
  const response = await patchFile(webId, patchBody)
  checkAndThrowErrors(response, webId, patchBody)
  return response
}

const unfollowProfile = async (webId, profileWebId) => {
  const patchBody = `DELETE { <${webId}> <${ns.foaf('knows')}> <${profileWebId}> }`
  const response = await patchFile(webId, patchBody)
  checkAndThrowErrors(response, webId, patchBody)
  return response
}

/**
 * Get the publication collection id
 * @param {string} webId 
 * @returns string
 */
const getCollectionId = (webId) => webId && webId.split('#')[0]+'#publications'

/**
 * Initialize profile with collection of publications (if collection is not yet present)
 * @param {string} webId 
 * @returns boolean
 */
const createCollection = async (webId) => {
  if (await getDocumentsCollection()) return true

  const collectionId = getCollectionId(webId)
  const patchBody = `INSERT { 
    <${webId}> <${ns.ex('publications')}> <${collectionId}> .
    <${collectionId}> <${ns.rdf('type')}> <${ns.hydra('Collection')}> .
    <${collectionId}> <${ns.dct('subject')}> <${ns.ex('Publication')}> .
    <${collectionId}> <${ns.dct('description')}> "${'Collection of publications'}" .
  }`
  const response = await patchFile(webId, patchBody)
  checkAndThrowErrors(response, webId, patchBody)
  return true;
}


export {
  fetchProfile, followProfile, unfollowProfile, createCollection
}