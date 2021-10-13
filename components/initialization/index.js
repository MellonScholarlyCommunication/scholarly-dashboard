import { LDP } from '@inrupt/lit-generated-vocab-common'
import { getSolidDataset, getThing, getUrl, getUrlAll, overwriteFile, saveSolidDatasetAt, setThing, setUrl } from '@inrupt/solid-client'
import { useSession, useThing, Value, CombinedDataProvider } from '@inrupt/solid-ui-react'
import { AS } from '@inrupt/vocab-common-rdf'
import { SOLID } from '@inrupt/vocab-solid'
import { CardContent, Container, Grid, Input, Typography, Card } from "@material-ui/core"
import { useState, useEffect } from 'react'
import { createFolderRecursive } from '../../utils/FileUtils'

export function InitializationView(props) {
  const { session } = useSession();
  const { webId } = session.info;

  let {thing, error} = useThing(webId, webId)

  const [eventsFolder, setEventsFolder] = useState(thing ? getUrl(thing, AS.NAMESPACE+"outbox") : "");
  const [indexFolder, setIndexFolder] = useState(thing ? getUrl(thing, SOLID.publicTypeIndex) : "");

  async function handleSubmit() {
    if (!eventsFolder || !indexFolder) {alert("Please provide a valid url for both fields"); return;}

    let submissionIndexFolder = indexFolder
    let submissionEventsFolder = eventsFolder
    if (!submissionEventsFolder.endsWith('/')) submissionEventsFolder = submissionEventsFolder + '/'
    if (!submissionIndexFolder.endsWith('/')) submissionIndexFolder = submissionIndexFolder + '/'

    let eventsContainer, indexContainer = null
    // create required containers
    try {
      eventsContainer = await createFolderRecursive(submissionEventsFolder, session.fetch)
    } catch (e) {alert('Could not create events folder: ' + e.message) ; return}
    try {
      indexContainer = await createFolderRecursive(submissionIndexFolder, session.fetch)
    } catch (e) {alert('Could not create type index folder: ' + e.message) ; return}
    
    // Create the type index file
    const typeIndexFileLocation = submissionIndexFolder+"publicTypeIndex.ttl"
    const contents = `
@prefix : <#>.
@prefix solid: <http://www.w3.org/ns/solid/terms#>.
<> a solid:ListedDocument, solid:TypeIndex.`

    try {
      const savedFile = await overwriteFile(
        typeIndexFileLocation,
        new Blob([contents], { type: "text/turtle" }),
        { contentType: "text/turtle", fetch: session.fetch}
      );
    } catch (e) {
      alert("Could not store index file in its requested container: " + e.message)
    }

    // Create the profile links

    let profileDataset = await getSolidDataset(webId)
    let thing = getThing(profileDataset, webId)
    thing = setUrl(thing, AS.NAMESPACE+"outbox", eventsFolder)
    thing = setUrl(thing, SOLID.publicTypeIndex, typeIndexFileLocation)
    profileDataset = setThing(profileDataset, thing)
    await saveSolidDatasetAt(webId, profileDataset, {fetch: session.fetch})
  }


  const getErrorMessage = (error) => <Container> Error retrieving profile data: {error.message} </Container>

  return(
    <CombinedDataProvider datasetUrl={webId} thingUrl={webId}  loadingComponent={<Container> Retrieving profile data </Container>} onError={error => setError(error)}>
      { error
      ? getErrorMessage(error)
      :<Container>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h3">
              Before making use of this functionality, please provide some initialization options.
            </Typography>
            <Typography gutterBottom variant="h6" component="h3">
              Enter the location that may be used for the outbox (storage of artefact lifecycle event data), and for the type index (index of where your artefacts are stored).
            </Typography>

            <hr></hr>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography gutterBottom variant="h5" component="h3">
                  container storing events
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Input value={eventsFolder} onChange={e => setEventsFolder(e.target.value)} fullWidth/>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography gutterBottom variant="h5" component="h3">
                  container storing type index
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Input value={indexFolder} onChange={e => setIndexFolder(e.target.value)} fullWidth/>
              </Grid>
            </Grid>
            <Input type="submit" onClick={handleSubmit} />
          </CardContent>
        </Card>
      </Container> }
    </CombinedDataProvider>
  )
}

export async function checkRequiredProfileLinks(fetchFunction, webId) {
  let links = await getProfileLinks(fetchFunction, webId)
  console.log('initialized', links.inbox , links.outbox , links.publicTypeIndex)
  return !!(links.outbox && links.publicTypeIndex)
}

export async function getProfileLinks (fetchFunction, webId) {
  let links = {}
  let thing = getThing(await getSolidDataset(webId, {fetch: fetchFunction}), webId)
  links['inbox'] = getUrl(thing, LDP.inbox)
  links['outbox'] = getUrl(thing, AS.NAMESPACE+"outbox")
  links['publicTypeIndex'] = getUrl(thing, SOLID.publicTypeIndex)
  return links
}