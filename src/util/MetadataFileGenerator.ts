import { PaperMetadata } from './CommunicationManager';
import { DataFactory } from "n3";
const FOAF = "http://xmlns.com/foaf/0.1/";
const DCTERMS = "http://purl.org/dc/terms/";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const TREE = "https://w3id.org/tree#";
const RESEARCH_PAPER_CLASS = "http://example.com/ResearchPaper";
const HYDRA = "http://www.w3.org/ns/hydra/core#";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const SIOC = "http://rdfs.org/sioc/ns#";
const AS = "https://www.w3.org/ns/activitystreams";

const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class MetadataFileGenerator {
  static generatePaperCollection(
    collectionId: string,
    partialCollectionViewId: string
  ): string {
    console.log(
      "generatePaperCollection",
      collectionId,
      partialCollectionViewId
    );
    const contents =
      "<"+collectionId+"> <"+RDF+"type> <"+HYDRA+"Collection> ; \n \
                      <"+DCTERMS+'description> "Collection of research papers" ; \n \
                      <'+HYDRA+"VIEW> <"+partialCollectionViewId+"> . ";
    return contents;
  }

  // Add the paper id as a member to the collection
  // Add the collection of comments for the paper

  static generatePaperEntry(collectionURI: string, paperURI: string, metadata: PaperMetadata): string {
    console.log("generating paper entry", collectionURI, paperURI, metadata.metadatalocation, metadata)
    let content =
      "<"+collectionURI+"> <"+HYDRA+"member> <"+paperURI+"> . \n\
      <"+paperURI+"> <"+RDF+"type> <"+RESEARCH_PAPER_CLASS+"> . \n";
    if(metadata) {
      if(metadata?.title)
      content += '<'+paperURI+'> <'+DCTERMS+'title> "'+metadata.title+'" . \n';
        content += '<'+paperURI+'> <'+RDFS+'seeAlso> <'+metadata.metadatalocation+'> . \n';
      content += '<'+paperURI+'> <'+DCTERMS+'publisher> "'+metadata.publisher+'" . \n';
    }
    return content;
  }

  static createComment(
    commentId: string,
    articleId: string,
    userWebId: string,
    content: string
  ) {
    const now = new Date();
    const metadata = '<'+commentId+'> <'+RDF+'type> <'+SIOC+'Post> . \
    <'+commentId+'> <'+SIOC+'reply_of> <'+articleId+'> . \
    <'+commentId+'> <'+SIOC+'created_at> "'+now.toISOString()+'"^^<'+XSD+'dateTime> . \
    <'+commentId+'> <'+SIOC+'has_creator> <'+userWebId+'> . '

    const payload = metadata + '\
    <'+commentId+'> <'+SIOC+'content> "'+content+'" . \
    <'+commentId+'> <'+SIOC+'note> "This post was created using the Mellon web application" . '

    
    let notification = '\
    <> <'+RDF+'type> <'+AS+'Announce> . \
    <> <'+RDFS+'comment> "Comment by '+userWebId+' over '+articleId+'" . \
    <> <'+SIOC+'created_at> "'+now.toISOString()+'"^^<'+XSD+'dateTime> . \
    <> <'+AS+'actor> <'+userWebId+'> . \
    <> <'+AS+'object> <'+commentId+'> . \
    <'+commentId+'> <'+RDF+'type> <'+SIOC+'Post> . \
    <'+commentId+'> <'+SIOC+'reply_of> <'+articleId+'> . \
    <'+commentId+'> <'+SIOC+'created_at> "'+now.toISOString()+'"^^<'+XSD+'dateTime> . \
    <'+commentId+'> <'+SIOC+'has_creator> <'+userWebId+'> . ' 

    // const notification = JSON.stringify({
    // "@context": "",
    // "@id": "",
    // "@type": "Announce",
    // "actor": {
    //   "@id": userWebId,
    //   "@type": "Person"
    // },
    // "object": {
    //   "@id": commentId,
    //   "@type": SIOC+'Post',
    //   [SIOC+'reply_of']: articleId,
    //   [SIOC+'created_at']: {
    //     "@value": now.toISOString(),
    //     "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
    //   },
    //   [SIOC+'has_creator']: articleId,
    // }}, null, 2)
    return {
      metadata: metadata,
      payload: payload,
      notification: notification
    };
  }


  static createPaperPublishedNotification(userWebId: string, paperId: string, paperTitle: string) : string {
    // return JSON.stringify({
    //   "@context": "https://www.w3.org/ns/activitystreams",
    //   "@id": "",
    //   "@type": "Announce",const
    //   "actor": {
    //     "@id": userWebId,
    //     "@type": "Person"
    //   },
    //   "object": {
    //     "@id": paperId,
    //     "@type": RESEARCH_PAPER_CLASS,
    //     "http://purl.org/dc/terms/title": paperTitle
    //   }}, null, 2)
    const now = new Date()
    let notification = '\
    <> <'+RDF+'type> <'+AS+'Announce> . \
    <> <'+RDFS+'comment> "'+userWebId+' just published '+paperTitle+' at '+paperId+'" . \
    <> <'+SIOC+'created_at> "'+now.toISOString()+'"^^<'+XSD+'dateTime> . \
    <> <'+AS+'actor> <'+userWebId+'> . \
    <> <'+AS+'object> <'+paperId+'> . \
    <'+paperId+'> <'+RDF+'type> <'+RESEARCH_PAPER_CLASS+'> . \
    <'+paperId+'> <'+DCTERMS+'publisher> <'+userWebId+'> . '
    if(paperTitle) notification += '<'+paperId+'> <'+DCTERMS+'title> <'+paperTitle+'> .'
    return notification
  }

  static initializeMetadataFile(metadataURI:string, paperURI: string, metadata?: PaperMetadata){
    let content = '\
    <'+metadataURI+'> <'+RDFS+'subject> <'+paperURI+'> . \n\
    <'+metadataURI+'> <'+RDFS+'comment> "This is the metadata file for '+paperURI+'" . \n'
    if(metadata){
      if(metadata.title) content += '<'+paperURI+'> <'+DCTERMS+'title> "'+metadata.title+'" . \n';
      content += '<'+paperURI+'> <'+DCTERMS+'publisher> "'+metadata.publisher+'" . \n';
    }
    return content
  }
}

