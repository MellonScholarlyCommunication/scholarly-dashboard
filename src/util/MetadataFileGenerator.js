"use strict";
exports.__esModule = true;
var n3_1 = require("n3");
var FOAF = "http://xmlns.com/foaf/0.1/";
var DCTERMS = "http://purl.org/dc/terms/";
var RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
var RDFS = "http://www.w3.org/2000/01/rdf-schema#";
var TREE = "https://w3id.org/tree#";
var RESEARCH_PAPER_CLASS = "http://example.com/ResearchPaper";
var HYDRA = "http://www.w3.org/ns/hydra/core#";
var XSD = "http://www.w3.org/2001/XMLSchema#";
var SIOC = "http://rdfs.org/sioc/ns#";
var AS = "https://www.w3.org/ns/activitystreams";
var namedNode = n3_1.DataFactory.namedNode, literal = n3_1.DataFactory.literal, defaultGraph = n3_1.DataFactory.defaultGraph, quad = n3_1.DataFactory.quad;
var MetadataFileGenerator = /** @class */ (function () {
    function MetadataFileGenerator() {
    }
    MetadataFileGenerator.generatePaperCollection = function (collectionId, partialCollectionViewId) {
        console.log("generatePaperCollection", collectionId, partialCollectionViewId);
        var contents = "<" + collectionId + "> <" + RDF + "type> <" + HYDRA + "Collection> ; \n \
                      <" + DCTERMS + 'description> "Collection of research papers" ; \n \
                      <' + HYDRA + "VIEW> <" + partialCollectionViewId + "> . ";
        return contents;
    };
    // Add the paper id as a member to the collection
    // Add the collection of comments for the paper
    MetadataFileGenerator.generatePaperEntry = function (collectionURI, paperURI, metadata) {
        console.log("generating paper entry", collectionURI, paperURI, metadata.metadatalocation, metadata);
        var content = "<" + collectionURI + "> <" + HYDRA + "member> <" + paperURI + "> . \n\
      <" + paperURI + "> <" + RDF + "type> <" + RESEARCH_PAPER_CLASS + "> . \n";
        if (metadata) {
            if (metadata === null || metadata === void 0 ? void 0 : metadata.title)
                content += '<' + paperURI + '> <' + DCTERMS + 'title> "' + metadata.title + '" . \n';
            content += '<' + paperURI + '> <' + RDFS + 'seeAlso> <' + metadata.metadatalocation + '> . \n';
            content += '<' + paperURI + '> <' + DCTERMS + 'publisher> "' + metadata.publisher + '" . \n';
        }
        return content;
    };
    MetadataFileGenerator.createComment = function (commentId, articleId, userWebId, content) {
        var now = new Date();
        var metadata = '<' + commentId + '> <' + RDF + 'type> <' + SIOC + 'Post> . \
    <' + commentId + '> <' + SIOC + 'reply_of> <' + articleId + '> . \
    <' + commentId + '> <' + SIOC + 'created_at> "' + now.toISOString() + '"^^<' + XSD + 'dateTime> . \
    <' + commentId + '> <' + SIOC + 'has_creator> <' + userWebId + '> . ';
        var payload = metadata + '\
    <' + commentId + '> <' + SIOC + 'content> "' + content + '" . \
    <' + commentId + '> <' + SIOC + 'note> "This post was created using the Mellon web application" . ';
        var notification = '\
    <> <' + RDF + 'type> <' + AS + 'Announce> . \
    <> <' + RDFS + 'comment> "Comment by ' + userWebId + ' over ' + articleId + '" . \
    <> <' + SIOC + 'created_at> "' + now.toISOString() + '"^^<' + XSD + 'dateTime> . \
    <> <' + AS + 'actor> <' + userWebId + '> . \
    <> <' + AS + 'object> <' + commentId + '> . \
    <' + commentId + '> <' + RDF + 'type> <' + SIOC + 'Post> . \
    <' + commentId + '> <' + SIOC + 'reply_of> <' + articleId + '> . \
    <' + commentId + '> <' + SIOC + 'created_at> "' + now.toISOString() + '"^^<' + XSD + 'dateTime> . \
    <' + commentId + '> <' + SIOC + 'has_creator> <' + userWebId + '> . ';
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
    };
    MetadataFileGenerator.createPaperPublishedNotification = function (userWebId, paperId, paperTitle) {
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
        var now = new Date();
        var notification = '\
    <> <' + RDF + 'type> <' + AS + 'Announce> . \
    <> <' + RDFS + 'comment> "' + userWebId + ' just published ' + paperTitle + ' at ' + paperId + '" . \
    <> <' + SIOC + 'created_at> "' + now.toISOString() + '"^^<' + XSD + 'dateTime> . \
    <> <' + AS + 'actor> <' + userWebId + '> . \
    <> <' + AS + 'object> <' + paperId + '> . \
    <' + paperId + '> <' + RDF + 'type> <' + RESEARCH_PAPER_CLASS + '> . \
    <' + paperId + '> <' + DCTERMS + 'publisher> <' + userWebId + '> . ';
        if (paperTitle)
            notification += '<' + paperId + '> <' + DCTERMS + 'title> <' + paperTitle + '> .';
        return notification;
    };
    MetadataFileGenerator.initializeMetadataFile = function (metadataURI, paperURI, metadata) {
        var content = '\
    <' + metadataURI + '> <' + RDFS + 'subject> <' + paperURI + '> . \n\
    <' + metadataURI + '> <' + RDFS + 'comment> "This is the metadata file for ' + paperURI + '" . \n';
        if (metadata) {
            if (metadata.title)
                content += '<' + paperURI + '> <' + DCTERMS + 'title> "' + metadata.title + '" . \n';
            content += '<' + paperURI + '> <' + DCTERMS + 'publisher> "' + metadata.publisher + '" . \n';
        }
        return content;
    };
    return MetadataFileGenerator;
}());
exports.MetadataFileGenerator = MetadataFileGenerator;
