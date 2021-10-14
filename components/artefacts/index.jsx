import { DatasetProvider, CombinedDataProvider, ThingProvider, useSession, Value} from "@inrupt/solid-ui-react";
import { Button, Card, CardContent, Grid, Tooltip, Typography } from "@material-ui/core";
import {useEffect, useState} from "react"
import { getArtefactMetadataThings, getContainedResourceURLs, getTypeRegistrationEntry, LINKTYPE } from "../../utils/FileUtils";
import Link from "next/link";
import { EventListingComponent } from "../eventLog";
import { DCTERMS, VCARD } from "@inrupt/lit-generated-vocab-common";
import { getSourceUrl, getStringNoLocale, getUrl, getUrlAll } from "@inrupt/solid-client";
import { NS_DCMI } from "../../utils/util";

export const ARTEFACTTYPES = [LINKTYPE]

function ArtefactListingComponent(params) {
  const { session } = useSession();

  const targetWebId = params.target
  const [artefactIds, setArtefactIds] = useState([]); // List of artefact URIs


  useEffect(() => {
    let running = true;
    async function effect() {
      const {instances, containers} = await getTypeRegistrationEntry(session.fetch, targetWebId, ARTEFACTTYPES)
      let ids = []
      ids = ids.concat(instances)
      for (let container of containers) {
        if (running) ids = ids.concat( await getContainedResourceURLs(session.fetch, container) )
      }
      if (running) setArtefactIds(ids)
    }
    effect();
    return () => { running = false; }
  }, [])

  return (
      <Grid container spacing={1}>
        { artefactIds.map( id => 
          <Grid item md={3} sm={6} xs={12}>
            <ArtefactCardComponent artefactId={id} /> 
          </Grid>
        )}
      </Grid>
  )
}

function ArtefactCardComponent(props) {
  const { session } = useSession();
  const artefactId = props.artefactId

  const [metadata, setMetadata] = useState(null)
  useEffect(() => {
    let running = true;
    async function fetchMetadata(artefactId) {
      if (running) setMetadata(await getArtefactMetadataThings(session.fetch, artefactId))
    }
    fetchMetadata(artefactId)
    return () => { running = false; }
  }, [artefactId])

  return (
    <div>
      { metadata && 
      <Card style={{padding: "5px", whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
        <Typography gutterBottom variant="h5" component="h3">
          <Link href={{
              pathname: '/',
              query: { uri: metadata.resourceMap.url },
          }}>{metadata && getStringNoLocale(metadata.resourceMap, DCTERMS.title)}</Link>
        </Typography>


        {createCardContent("Title", <Value property={DCTERMS.title} thing={metadata.resourceMap} dataType="string"/>, 6)}
        {createCardContent("Created", <Value property={DCTERMS.created} thing={metadata.resourceMap} dataType="datetime"/>, 6)}
        {createCardContent("Modified", <Value property={DCTERMS.modified} thing={metadata.resourceMap} dataType="datetime"/>, 6)}
        {createCardContent("Publisher", multiValueGrid(getUrlAll(metadata.resourceMap, DCTERMS.publisher).map(webId => getRemoteValueLink(webId, VCARD.fn))), 6)}
        {createCardContent("Author", multiValueGrid(getUrlAll(metadata.resourceMap, DCTERMS.creator).map(webId => getRemoteValueLink(webId, VCARD.fn))), 6)}
      </Card>
    }
    </div>
  )
}



function ArtefactViewComponent(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const artefactId = props.uri

  const [metadata, setMetadata] = useState(null)
  useEffect(() => {
    let running = true;
    async function fetchMetadata(artefactId) {
      if (running) setMetadata(await getArtefactMetadataThings(session.fetch, artefactId))
    }
    fetchMetadata(artefactId)
    return () => { running = false; }
  }, [artefactId])

  return (
    <div>
      { metadata && 

      <CombinedDataProvider datasetUrl={artefactId} thingUrl={artefactId}>
        <Card style={{padding: "5px", whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h3">
              ResourceMap
            </Typography>

            {createCardContent("Title", <Value property={DCTERMS.title} thing={metadata.resourceMap} dataType="string"/>)}
            {createCardContent("Created", <Value property={DCTERMS.created} thing={metadata.resourceMap} dataType="datetime"/>)}
            {createCardContent("Modified", <Value property={DCTERMS.modified} thing={metadata.resourceMap} dataType="datetime"/>)}
            {createCardContent("Publisher", multiValueGrid(getUrlAll(metadata.resourceMap, DCTERMS.publisher).map(webId => getRemoteValueLink(webId, VCARD.fn))))}
            {createCardContent("Author", multiValueGrid(getUrlAll(metadata.resourceMap, DCTERMS.creator).map(webId => getRemoteValueLink(webId, VCARD.fn))))}

            <hr></hr>
            <Typography gutterBottom variant="h5" component="h3">
              Aggregation
            </Typography>

            {createCardContent("Publisher", multiValueGrid(getUrlAll(metadata.aggregation, DCTERMS.publisher).map(webId => getRemoteValueLink(webId, VCARD.fn))))}
            {createCardContent("Author", multiValueGrid(getUrlAll(metadata.aggregation, DCTERMS.creator).map(webId => getRemoteValueLink(webId, VCARD.fn))))}
            {createCardContent("Title", <Value property={DCTERMS.abstract_} thing={metadata.aggregation} dataType="string"/>)}

            <hr></hr>
            <Grid container spacing={2}>
            {metadata.instances.map(instanceThing => {
              return(
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Card>
                    <Typography gutterBottom variant="h3" component="h3">
                      <a href={instanceThing.url}><Value property={DCTERMS.title} thing={instanceThing} dataType="string"/></a>
                    </Typography>
                    {createCardContent("Format", <Value property={NS_DCMI+"format"} thing={instanceThing} dataType="string"/>, 6)}
                    {createCardContent("Language", <Value property={DCTERMS.language} thing={instanceThing} dataType="string"/>, 6)}
                    <Button onClick={() => window.open(instanceThing.url)}>Open</Button>
                  </Card>
                </Grid>
              )
            })}
            </Grid>

            <hr></hr>
            <Typography gutterBottom variant="h5" component="h3">
              Events
            </Typography>
            {webId && 
              <EventListingComponent target={webId} artefactId={artefactId} /> 
            }
          </CardContent>
        </Card>
      </CombinedDataProvider>
    }
    </div>
  )
}

function getRemoteValue(thingUrl, property) {
  return (
    <DatasetProvider datasetUrl={thingUrl}>
      <ThingProvider thingUrl={thingUrl}>
        <Value property={property} /> 
      </ThingProvider>
    </DatasetProvider>
  )
}


function getRemoteValueLink(thingUrl, property) {
  return (
    <DatasetProvider datasetUrl={thingUrl}>
      <ThingProvider thingUrl={thingUrl}>
        <a href={thingUrl}> <Value property={property} /> </a>
      </ThingProvider>
    </DatasetProvider>
  )
}

function createCardContent(label, valueObjects, size=8) {
  return (
    <CardContent style={{margin: ".25em", padding: ".15em"}}>
      <Grid container spacing={2}>
        <Grid item xs={12-size} sm={12-size+1} md={12-size-2}>
          <Typography gutterBottom variant="h6" component="h3">
            {label}
          </Typography>
        </Grid>
        <Grid item xs={size} sm={size+1} md={size+2}>
          <Typography gutterBottom variant="h6" component="h3">
            {valueObjects}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  )
}

function multiValueGrid(valueComponents) { return <Grid container spacing={1}> {valueComponents.map(vc => <Grid item xs={12}>{vc}</Grid>)} </Grid> }

function getFormatString(value) {
  if(!value || !value.length) return ""
  value = Array.isArray(value) ? value[0] : value
  const val = value.split('/')
  return val[val.length-1]
}


export { ArtefactListingComponent, ArtefactCardComponent, ArtefactViewComponent }