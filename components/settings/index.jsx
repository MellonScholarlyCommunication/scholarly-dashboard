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
  createPublicReadAclIfNotExists,
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
      await createFolderRecursiveIfNotExists(inboxUrl, session.fetch);
    }

    // Check if outbox exists and create if not.
    if (outboxUrl) {
      await createFolderRecursiveIfNotExists(outboxUrl, session.fetch);
    }

    // Check if type index exists and create if not.
    if (typeIndexUrl) {
      const body = `
      @prefix : <#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      <> a solid:ListedDocument, solid:TypeIndex.`;
      await createResourceIfNotExists(
        typeIndexUrl,
        body,
        "text/turtle",
        session.fetch
      );
    }

    // Set permissions
    // Set public read permissions for outbox
    if (outboxUrl)
      await createPublicReadAclIfNotExists(outboxUrl, session.fetch);
    // Set public read permissions for type index
    if (typeIndexUrl)
      await createPublicReadAclIfNotExists(typeIndexUrl, session.fetch);
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
                  <b>Inbox URI of container where notifications are sent to</b>
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
                  <b>Outbox URI of container to store events</b>
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
                  <b>
                    Type index file URI of file storing an index of your linked
                    files linked from your profile
                  </b>
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
                  <b>WebId of the orchestrator managing this data pod.</b>
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
                  <b>Ready</b>
                </Button>
              ) : (
                <Button type="submit" onClick={() => setEdit(!edit)}>
                  <b>Edit</b>
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
