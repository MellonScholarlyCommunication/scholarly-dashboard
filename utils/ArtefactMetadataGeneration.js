/* eslint-disable no-underscore-dangle */
import {
  createSolidDataset,
  createThing,
  setThing,
  buildThing,
} from "@inrupt/solid-client";
import { DCTERMS, XSD } from "@inrupt/lit-generated-vocab-common";
import { RDF } from "@inrupt/vocab-common-rdf";
import { SOLID } from "@inrupt/vocab-solid";
import DataFactory from "@rdfjs/data-model";
import { NS_DCMI, NS_ORE } from "./util";

const quad = require("rdf-quad");

export function generateArtefactResourceDescriptionQuads(webId, metadata) {
  if (!metadata.resourceURI) return [];
  const time = new Date();

  const quads = [];

  const defaultSubject = DataFactory.namedNode("");
  // Add resourceMap
  quads.push(
    DataFactory.quad(
      defaultSubject,
      DataFactory.namedNode(RDF.type),
      DataFactory.namedNode(`${NS_ORE}ResourceMap`)
    )
  );
  quads.push(
    DataFactory.quad(
      defaultSubject,
      DataFactory.namedNode(DCTERMS.title.value),
      DataFactory.literal(metadata.title, DataFactory.namedNode(XSD.string))
    )
  );
  quads.push(
    DataFactory.quad(
      defaultSubject,
      DataFactory.namedNode(DCTERMS.created.value),
      DataFactory.literal(
        time.toISOString(),
        DataFactory.namedNode(XSD.dateTime)
      )
    )
  );
  quads.push(
    DataFactory.quad(
      defaultSubject,
      DataFactory.namedNode(DCTERMS.modified.value),
      DataFactory.literal(
        time.toISOString(),
        DataFactory.namedNode(XSD.dateTime)
      )
    )
  );
  quads.push(
    DataFactory.quad(
      defaultSubject,
      DataFactory.namedNode(DCTERMS.creator.value),
      DataFactory.namedNode(webId)
    )
  );
  quads.push(
    DataFactory.quad(
      defaultSubject,
      DataFactory.namedNode(DCTERMS.publisher.value),
      DataFactory.namedNode(webId)
    )
  );
  quads.push(
    DataFactory.quad(
      defaultSubject,
      DataFactory.namedNode(`${NS_ORE}describes`),
      DataFactory.namedNode("#aggregation")
    )
  );

  // Add aggregation
  quads.push(quad("#aggregation", RDF.type, `${NS_ORE}Aggregation`));
  quads.push(quad("#aggregation", DCTERMS.title.value, `"${metadata.title}"`));
  quads.push(quad("#aggregation", DCTERMS.publisher.value, webId));
  quads.push(
    quad("#aggregation", DCTERMS.abstract_.value, `"${metadata.abstract}"`)
  );
  quads.push(quad("#aggregation", `${NS_ORE}aggregates`, metadata.resourceURI));
  for (const author of metadata.authors) {
    quads.push(quad("#aggregation", DCTERMS.creator.value, author.webId));
  } // add authors as creators

  // Add representation
  quads.push(quad(metadata.resourceURI, RDF.type, metadata.type));
  quads.push(
    quad(metadata.resourceURI, DCTERMS.language.value, `"${metadata.language}"`)
  );
  quads.push(
    quad(metadata.resourceURI, DCTERMS.title.value, `"${metadata.title}"`)
  );
  quads.push(
    quad(metadata.resourceURI, `${NS_DCMI}format`, `"${metadata.format}"`)
  );

  return quads;
}

/**
 * Generate the metadata file for a stored artefact
 * @param {id: string, title: string, abstract: string, authors: string[] } metadata
 */
export function generateArtefactMetadata(webId, metadata) {
  let artefactMetadataDataset = createSolidDataset();
  let metadataThing = buildThing(createThing({ name: "" }))
    .addStringNoLocale(DCTERMS.title, metadata.title)
    .addUrl(RDF.type, metadata.type)
    .addUrl(DCTERMS.publisher, webId);

  if (webId) metadataThing = metadataThing.addUrl(DCTERMS.publisher, webId);
  for (const author of metadata.authors)
    metadataThing = metadataThing.addUrl(DCTERMS.creator, author.webId);

  metadataThing = metadataThing.build();

  artefactMetadataDataset = setThing(artefactMetadataDataset, metadataThing);

  return artefactMetadataDataset;
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
