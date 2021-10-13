import { createSolidDataset, createThing, setThing, buildThing, asUrl } from "@inrupt/solid-client";
import { DCTERMS } from "@inrupt/lit-generated-vocab-common";
import { RDF } from "@inrupt/vocab-common-rdf";
import { SOLID } from "@inrupt/vocab-solid";
import { NS_DCMI, NS_ORE } from "./util";


export function generateArtefactResourceDescription(webId, metadata) {
  let resourceDescriptionDataset = createSolidDataset();
  let time = (new Date());

  let aggregationThingBuilder = buildThing(createThing({name: 'aggregation'}))
    .addUrl(RDF.type, NS_ORE+"Aggregation")
    .addStringNoLocale(DCTERMS.title, metadata.title) // add title of work
    .addUrl(DCTERMS.publisher, webId) // set current uploader as publisher
    .addStringNoLocale(DCTERMS.abstract_, metadata.abstract) // set the abstract
    .addUrl(NS_ORE+"aggregates", metadata.resourceURI) // add uploaded file as aggregated resource
  for (let author of metadata.authors) { aggregationThingBuilder.addUrl(DCTERMS.creator, author.webId) } // add authors as creators
  let aggregationThing = aggregationThingBuilder.build();

  let resourceMapThing = buildThing(createThing({name: 'resourceMap'}))
    .addUrl(RDF.type, NS_ORE+"ResourceMap")
    .addUrl(NS_ORE+"describes", aggregationThing)
    .addDatetime(DCTERMS.created, time)
    .addDatetime(DCTERMS.modified, time)
    .addUrl(DCTERMS.creator, webId)  // add authors as creators
    .addStringNoLocale(DCTERMS.title, metadata.title)
    .addUrl(DCTERMS.publisher, webId)
    .build();

  metadata = JSON.parse(JSON.stringify(metadata))
  let representationThing = buildThing(createThing({url: metadata.resourceURI}))
    .addUrl(RDF.type, metadata.type) 
    .addStringNoLocale(DCTERMS.language, metadata.language) 
    .addStringNoLocale(DCTERMS.title, metadata.title) 
    .addStringNoLocale(NS_DCMI+"format", metadata.format)
    .build();

  resourceDescriptionDataset = setThing(resourceDescriptionDataset, resourceMapThing)
  resourceDescriptionDataset = setThing(resourceDescriptionDataset, aggregationThing)
  resourceDescriptionDataset = setThing(resourceDescriptionDataset, representationThing)
  return (resourceDescriptionDataset)
}

/**
 * Generate the metadata file for a stored artefact
 * @param {id: string, title: string, abstract: string, authors: string[] } metadata 
 */
export function generateArtefactMetadata(webId, metadata) {

  let artefactMetadataDataset = createSolidDataset();
  let metadataThing = buildThing(createThing({name: ''}))
    .addStringNoLocale(DCTERMS.title, metadata.title)
    .addUrl(RDF.type, metadata.type)
    .addUrl(DCTERMS.publisher, webId)

  if (webId) metadataThing = metadataThing.addUrl(DCTERMS.publisher, webId)
  for (let author of metadata.authors) metadataThing = metadataThing.addUrl(DCTERMS.creator, author.webId)

  metadataThing = metadataThing.build();
  
  artefactMetadataDataset = setThing(artefactMetadataDataset, metadataThing)

  return (artefactMetadataDataset)
}



// :id1619781682625
// a solid:TypeRegistration;
// solid:forClass bookm:Bookmark;
// solid:instance </profile/bookmarks.ttl>.

/**
 * 
 * @param {id: string, title: string, abstract: string, authors: string[] } metadata 
 */
 export function generateTypeIndexEntryThing(artefactId, artefactType) {
  return buildThing(createThing({}))
    .addUrl(RDF.type, SOLID.TypeRegistration)
    .addUrl(SOLID.forClass, artefactType)
    .addUrl(SOLID.instance, artefactId)
    .build();
 }