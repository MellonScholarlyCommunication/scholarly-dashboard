const DataFactory = require("@rdfjs/data-model");

export const ORCHESTRATORPREDICATE = "https://example.com/ns/orchestrator";
export const NS_ORE = "http://www.openarchives.org/ore/terms/";
export const NS_DCMI = "http://purl.org/dc/elements/1.1/";

export function getBaseIRI(IRI) {
  let path = IRI;
  path = path.replace(/(^\w+:|^)\/\//, "");
  path = path.split("/").slice(1).join("/");
  path = `${IRI.substring(0, IRI.indexOf(path)).replace(/\/$/, "")}/`;
  return path;
}

export function getQuadsFromDataset(dataset) {
  if (!dataset) return [];
  return toRdfJsQuads(dataset);
}

export function toRdfJsQuads(dataset, options = {}) {
  const quads = [];
  const dataFactory = DataFactory;

  Object.keys(dataset.graphs).forEach((graphIri) => {
    const graph = dataset.graphs[graphIri];
    const graphNode =
      graphIri === "default"
        ? dataFactory.defaultGraph()
        : dataFactory.namedNode(graphIri);

    Object.keys(graph).forEach((subjectIri) => {
      const { predicates } = graph[subjectIri];
      const subjectNode = isBlankNodeId(subjectIri)
        ? dataFactory.blankNode(getBlankNodeValue(subjectIri))
        : dataFactory.namedNode(subjectIri);
      quads.push(
        ...subjectToRdfJsQuads(predicates, subjectNode, graphNode, options)
      );
    });
  });

  return quads;
}

export function subjectToRdfJsQuads(
  predicates,
  subjectNode,
  graphNode,
  options = {}
) {
  const quads = [];
  const dataFactory = DataFactory;

  Object.keys(predicates).forEach((predicateIri) => {
    const predicateNode = dataFactory.namedNode(predicateIri);
    const langStrings = predicates[predicateIri].langStrings ?? {};
    const namedNodes = predicates[predicateIri].namedNodes ?? [];
    const literals = predicates[predicateIri].literals ?? {};
    const blankNodes = predicates[predicateIri].blankNodes ?? [];

    const literalTypes = Object.keys(literals);
    literalTypes.forEach((typeIri) => {
      const typeNode = dataFactory.namedNode(typeIri);
      const literalValues = literals[typeIri];
      literalValues.forEach((value) => {
        const literalNode = dataFactory.literal(value, typeNode);
        quads.push(
          dataFactory.quad(subjectNode, predicateNode, literalNode, graphNode)
        );
      });
    });

    const locales = Object.keys(langStrings);
    locales.forEach((locale) => {
      const localeValues = langStrings[locale];
      localeValues.forEach((value) => {
        const langStringNode = dataFactory.literal(value, locale);
        quads.push(
          dataFactory.quad(
            subjectNode,
            predicateNode,
            langStringNode,
            graphNode
          )
        );
      });
    });

    namedNodes.forEach((namedNodeIri) => {
      const node = dataFactory.namedNode(namedNodeIri);
      quads.push(dataFactory.quad(subjectNode, predicateNode, node, graphNode));
    });

    blankNodes.forEach((blankNodeIdOrPredicates) => {
      if (isBlankNodeId(blankNodeIdOrPredicates)) {
        const blankNode = dataFactory.blankNode(
          getBlankNodeValue(blankNodeIdOrPredicates)
        );
        quads.push(
          dataFactory.quad(subjectNode, predicateNode, blankNode, graphNode)
        );
      } else {
        const node = dataFactory.blankNode();
        const blankNodeObjectQuad = dataFactory.quad(
          subjectNode,
          predicateNode,
          node,
          graphNode
        );
        const blankNodeSubjectQuads = subjectToRdfJsQuads(
          blankNodeIdOrPredicates,
          node,
          graphNode
        );
        quads.push(blankNodeObjectQuad);
        quads.push(...blankNodeSubjectQuads);
      }
    });
  });

  return quads;
}

function isLocalNodeIri(iri) {
  return (
    iri.substring(0, localNodeSkolemPrefix.length) === localNodeSkolemPrefix
  );
}
function getLocalNodeName(localNodeIri) {
  return localNodeIri.substring(localNodeSkolemPrefix.length);
}
function getLocalNodeIri(localNodeName) {
  return `${localNodeSkolemPrefix}${localNodeName}`;
}

function isBlankNodeId(value) {
  return typeof value === "string" && value.substring(0, 2) === "_:";
}

function getBlankNodeValue(blankNodeId) {
  return blankNodeId.substring(2);
}

function getBlankNodeId(blankNode) {
  return `_:${blankNode.value}`;
}
