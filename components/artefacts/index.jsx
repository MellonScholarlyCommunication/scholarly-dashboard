/* eslint-disable react/jsx-curly-newline */
/* eslint-disable no-underscore-dangle */
import {
  DatasetProvider,
  CombinedDataProvider,
  ThingProvider,
  useSession,
  Value,
} from "@inrupt/solid-ui-react";
import { Button, Card, CardContent, Grid } from "@material-ui/core";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DCTERMS, VCARD } from "@inrupt/lit-generated-vocab-common";
import { getStringNoLocale, getUrl, getUrlAll } from "@inrupt/solid-client";
import { EventListingComponent } from "../eventLog";
import {
  getArtefactMetadataThings,
  getContainedResourceURLs,
  getTypeRegistrationEntry,
  LANDINGPAGEPREDICATE,
  LINKTYPE,
} from "../../utils/FileUtils";
import { NS_DCMI, openInNewTab } from "../../utils/util";

export const ARTEFACTTYPES = [LINKTYPE];

function getRemoteValueLink(thingUrl, property, id = 1) {
  return (
    <DatasetProvider datasetUrl={thingUrl} key={`remotevalue${property}${id}`}>
      <ThingProvider thingUrl={thingUrl}>
        <a href={thingUrl} target="_blank" rel="noopener noreferrer">
          <Value property={property} />
        </a>
      </ThingProvider>
    </DatasetProvider>
  );
}

function createCardContent(label, valueObjects, size = 8) {
  return (
    <CardContent style={{ margin: ".25em", padding: ".15em" }}>
      <Grid container spacing={2}>
        <Grid item xs={12 - size} sm={12 - size + 1} md={12 - size - 2}>
          {label}
        </Grid>
        <Grid item xs={size} sm={size + 1} md={size + 2}>
          {valueObjects}
        </Grid>
      </Grid>
    </CardContent>
  );
}

function multiValueGrid(valueComponents) {
  return (
    <Grid container spacing={1}>
      {valueComponents.map((vc) => (
        <Grid item xs={12} key={`valuecomponent${vc}`}>
          {vc}
        </Grid>
      ))}
    </Grid>
  );
}

function ArtefactListingComponent(props) {
  const { target, small } = props;
  const { session } = useSession();
  const { webId } = session.info;
  const [artefactIds, setArtefactIds] = useState(null); // List of artefact URIs
  const [unavailableArtefacts, setUnavailableArtefacts] = useState([]); // List of artefact URIs

  useEffect(() => {
    const targetWebId = target || webId;
    let running = true;
    async function effect() {
      if (!targetWebId) return;
      const { instances, containers } = await getTypeRegistrationEntry(
        session.fetch,
        targetWebId,
        ARTEFACTTYPES
      );
      let ids = [];
      ids = ids.concat(instances || []);
      for (const container of containers) {
        ids = ids.concat(getContainedResourceURLs(session.fetch, container));
      }
      ids = await Promise.all(ids);
      if (running) setArtefactIds(ids);
    }
    effect();
    return () => {
      running = false;
    };
  }, [session.fetch, target, webId]);

  function getContents() {
    if (!artefactIds) {
      return <label>Loading Artefact information</label>;
    }
    if (artefactIds && artefactIds.length === 0) {
      return <label>No Artefacts could be found</label>;
    }
    return artefactIds
      .filter((id) => unavailableArtefacts.indexOf(id) === -1)
      .map((id) => (
        <Grid
          item
          lg={small ? 6 : 4}
          md={6}
          sm={6}
          xs={12}
          key={`artefactcard${id}`}
        >
          <ArtefactCardComponent
            artefactId={id}
            noData={() =>
              setUnavailableArtefacts(unavailableArtefacts.concat(id))
            }
          />
        </Grid>
      ));
  }

  return (
    <Grid container spacing={2}>
      {getContents()}
    </Grid>
  );
}

function ArtefactCardComponent(props) {
  const { session } = useSession();
  const { artefactId, noData } = props;

  const [metadata, setMetadata] = useState(null);
  useEffect(() => {
    let running = true;
    async function fetchMetadata(artefactId) {
      const artefactMetadata = await getArtefactMetadataThings(
        session.fetch,
        artefactId
      );
      if (running && artefactMetadata) setMetadata(artefactMetadata);
      if (running && !artefactMetadata) noData();
    }
    fetchMetadata(artefactId);
    return () => {
      running = false;
    };
  }, [artefactId, noData, session.fetch]);

  const landingPageURI =
    metadata && getUrl(metadata.resourceMap, LANDINGPAGEPREDICATE);

  return (
    <div>
      {metadata && (
        <CombinedDataProvider datasetUrl={artefactId} thingUrl={artefactId}>
          <Card
            style={{
              padding: "5px",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
            }}
          >
            <CardContent>
              <Link
                href={{
                  pathname: "/",
                  query: { uri: metadata.resourceMap.url },
                }}
              >
                {metadata &&
                  getStringNoLocale(metadata.resourceMap, DCTERMS.title)}
              </Link>

              {createCardContent(
                "Title",
                <Value
                  property={DCTERMS.title}
                  thing={metadata.resourceMap}
                  dataType="string"
                />,
                6
              )}
              {createCardContent(
                "Created",
                <Value
                  property={DCTERMS.created}
                  thing={metadata.resourceMap}
                  dataType="datetime"
                />,
                6
              )}
              {createCardContent(
                "Modified",
                <Value
                  property={DCTERMS.modified}
                  thing={metadata.resourceMap}
                  dataType="datetime"
                />,
                6
              )}
              {createCardContent(
                "Publisher",
                multiValueGrid(
                  getUrlAll(metadata.resourceMap, DCTERMS.publisher).map(
                    (webId) => getRemoteValueLink(webId, VCARD.fn)
                  )
                ),
                6
              )}
              {createCardContent(
                "Author",
                multiValueGrid(
                  getUrlAll(metadata.resourceMap, DCTERMS.creator).map(
                    (webId) => getRemoteValueLink(webId, VCARD.fn)
                  )
                ),
                6
              )}
              {landingPageURI && (
                <Button
                  style={{ backgroundColor: "lightblue" }}
                  onClick={() => openInNewTab(landingPageURI)}
                >
                  Open Landing Page
                </Button>
              )}
            </CardContent>
          </Card>
        </CombinedDataProvider>
      )}
    </div>
  );
}

function ArtefactViewComponent(props) {
  const { uri } = props;
  const { session } = useSession();
  const { webId } = session.info;
  const artefactId = uri;

  const [metadata, setMetadata] = useState(null);
  useEffect(() => {
    let running = true;
    async function fetchMetadata(artefactId) {
      const artefactMetadata = await getArtefactMetadataThings(
        session.fetch,
        artefactId
      );
      if (running && artefactMetadata) setMetadata(artefactMetadata);
    }
    fetchMetadata(artefactId);
    return () => {
      running = false;
    };
  }, [artefactId, session.fetch]);

  const landingPageURI =
    metadata && getUrl(metadata.resourceMap, LANDINGPAGEPREDICATE);

  return (
    <div>
      {metadata && (
        <CombinedDataProvider datasetUrl={artefactId} thingUrl={artefactId}>
          <Card
            style={{
              padding: "5px",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
            }}
          >
            <CardContent>
              <Value
                property={DCTERMS.title}
                thing={metadata.resourceMap}
                dataType="string"
              />
              {createCardContent(
                "Created",
                <Value
                  property={DCTERMS.created}
                  thing={metadata.resourceMap}
                  dataType="datetime"
                />
              )}
              {createCardContent(
                "Modified",
                <Value
                  property={DCTERMS.modified}
                  thing={metadata.resourceMap}
                  dataType="datetime"
                />
              )}
              {createCardContent(
                "Publisher",
                multiValueGrid(
                  getUrlAll(metadata.resourceMap, DCTERMS.publisher).map(
                    (webId) => getRemoteValueLink(webId, VCARD.fn)
                  )
                )
              )}
              {createCardContent(
                "Author",
                multiValueGrid(
                  getUrlAll(metadata.resourceMap, DCTERMS.creator).map(
                    (webId) => getRemoteValueLink(webId, VCARD.fn)
                  )
                )
              )}
              {landingPageURI && (
                <Button
                  style={{ backgroundColor: "lightblue" }}
                  onClick={() => openInNewTab(landingPageURI)}
                >
                  Open Landing Page
                </Button>
              )}
              <hr />
              Aggregated Resources
              <Grid container spacing={2}>
                {metadata.instances.map((instanceThing) => {
                  return (
                    <Grid item xs={12} sm={6} md={6} lg={4}>
                      <Card>
                        <CardContent>
                          <a
                            href={instanceThing.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Value
                              property={DCTERMS.title}
                              thing={instanceThing}
                              dataType="string"
                            />
                          </a>

                          {createCardContent(
                            "Format",
                            <Value
                              property={`${NS_DCMI}format`}
                              thing={instanceThing}
                              dataType="string"
                            />,
                            6
                          )}
                          {createCardContent(
                            "Language",
                            <Value
                              property={DCTERMS.language}
                              thing={instanceThing}
                              dataType="string"
                            />,
                            6
                          )}
                          <Button
                            style={{ backgroundColor: "lightblue" }}
                            onClick={() => openInNewTab(instanceThing.url)}
                          >
                            Open
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              <hr />
              Events
              {webId && (
                <EventListingComponent target={webId} artefactId={artefactId} />
              )}
            </CardContent>
          </Card>
        </CombinedDataProvider>
      )}
    </div>
  );
}

export {
  ArtefactListingComponent,
  ArtefactCardComponent,
  ArtefactViewComponent,
};
