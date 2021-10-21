import { useState } from "react";
import { LDP } from "@inrupt/lit-generated-vocab-common";
import { getSolidDataset, getThing, getUrl } from "@inrupt/solid-client";
import {
  useSession,
  Value,
  CombinedDataProvider,
} from "@inrupt/solid-ui-react";
import { AS } from "@inrupt/vocab-common-rdf";
import { SOLID } from "@inrupt/vocab-solid";
import { CardContent, Container, Grid, Card, Button } from "@material-ui/core";
import { useRouter } from "next/router";
import { ORCHESTRATORPREDICATE } from "../../utils/util";
import {
  createFolderRecursiveIfNotExists,
  createResourceIfNotExists,
} from "../../utils/FileUtils";

export function SettingsView() {
  const { session } = useSession();
  const { webId } = session.info;

  const [error, setError] = useState(null);

  const router = useRouter();
  const editInitialValue = !!router.query.edit;
  const [edit, setEdit] = useState(editInitialValue);

  async function handleSubmit() {
    setEdit(!edit);
    const thing = getThing(
      await getSolidDataset(webId, { fetch: session.fetch }),
      webId
    );
    const inboxUrl = getUrl(thing, LDP.inbox);
    const outboxUrl = getUrl(thing, `${AS.NAMESPACE}outbox`);
    const typeIndexUrl = getUrl(thing, SOLID.publicTypeIndex);

    // Check if inbox exists and create if not.
    if (inboxUrl) {
      createFolderRecursiveIfNotExists(inboxUrl, session.fetch);
    }

    // Check if outbox exists and create if not.
    if (outboxUrl) {
      createFolderRecursiveIfNotExists(outboxUrl, session.fetch);
    }

    // Check if type index exists and create if not.
    if (typeIndexUrl) {
      const body = `
      @prefix : <#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      <> a solid:ListedDocument, solid:TypeIndex.`;
      createResourceIfNotExists(
        typeIndexUrl,
        body,
        "text/turtle",
        session.fetch
      );
    }
  }

  const getErrorMessage = (error) => (
    <Container> Error retrieving profile data: {error.message} </Container>
  );

  return (
    <CombinedDataProvider
      datasetUrl={webId}
      thingUrl={webId}
      loadingComponent={<Container> Retrieving profile data </Container>}
      onError={(error) => setError(error)}
    >
      {error ? (
        getErrorMessage(error)
      ) : (
        <Container>
          <Card>
            <CardContent>
              Datapod Settings. To make full use of the Mellon dashboard, please
              fill in all fields.
              <hr />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  Inbox URI of container where notifications are sent to
                </Grid>
                <Grid item xs={12} sm={9} className="valueParent">
                  <Value
                    autosave
                    edit={edit}
                    dataType="url"
                    property={LDP.inbox}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  Outbox URI of container to store events
                </Grid>
                <Grid item xs={12} sm={9} className="valueParent">
                  <Value
                    autosave
                    edit={edit}
                    dataType="url"
                    property={`${AS.NAMESPACE}outbox`}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  Type index file URI of file storing an index of your linked
                  files linked from your profile
                </Grid>
                <Grid item xs={12} sm={9} className="valueParent">
                  <Value
                    autosave
                    edit={edit}
                    dataType="url"
                    property={SOLID.publicTypeIndex}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  Orchestrator id WebId of the orchestrator that manages this
                  data pod.
                </Grid>
                <Grid item xs={12} sm={9} className="valueParent">
                  <Value
                    autosave
                    edit={edit}
                    dataType="url"
                    property={ORCHESTRATORPREDICATE}
                  />
                </Grid>
              </Grid>
              {edit ? (
                <Button type="submit" onClick={handleSubmit}>
                  Ready
                </Button>
              ) : (
                <Button type="submit" onClick={() => setEdit(!edit)}>
                  Edit
                </Button>
              )}
            </CardContent>
          </Card>
        </Container>
      )}
    </CombinedDataProvider>
  );
}

export async function isInitialized(session) {
  if (!session) return false;
  const { webId } = session.info;
  if (!webId) return false;

  const profileThing = getThing(
    await getSolidDataset(webId, { fetch: session.fetch }),
    webId
  );
  const requiredProperties = [
    LDP.inbox,
    `${AS.NAMESPACE}outbox`,
    SOLID.publicTypeIndex,
    ORCHESTRATORPREDICATE,
  ];

  for (const property of requiredProperties) {
    if (!getUrl(profileThing, property)) {
      return false;
    }
  }
  return true;
}
