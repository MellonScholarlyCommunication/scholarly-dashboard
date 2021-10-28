/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Card,
  CardContent,
  Grid,
  Container,
  // TextField,
} from "@material-ui/core";
import { AS, DCTERMS, FOAF, RDF, VCARD } from "@inrupt/vocab-common-rdf";
import { useForm } from "react-hook-form";
import { useSession, useThing } from "@inrupt/solid-ui-react";
import {
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getUrl,
} from "@inrupt/solid-client";
import { useEffect, useState } from "react";
// import { Autocomplete } from "@mui/material";
import useArtefacts from "../../hooks/useArtefacts";
import {
  createNotification,
  sendNotification,
} from "../../utils/NotificationUtils";
import useNotifications from "../../hooks/useNotifications";
import useContacts from "../../hooks/useContacts";

const NOTIFICATIONTYPES = [
  { label: "Offer", value: AS.Offer },
  { label: "Announce", value: AS.Announce },
  { label: "Accept", value: AS.Accept },
  { label: "Reject", value: AS.Reject },
  { label: "Undo", value: AS.Undo },
];

export function NotificationView() {
  const notificationIds = useNotifications();

  return (
    <Container fixed>
      <Grid container spacing={2}>
        {notificationIds.map((id) => (
          <Grid item md={4} sm={6} xs={12} key={`notification${id}`}>
            <NotificationCard target={id} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function createLabelledValue(label, property, thing) {
  return (
    <Grid container spacing={2}>
      <Grid item sm={3} xs={12}>
        {label}
      </Grid>
      <Grid item sm={9} xs={12}>
        <a href={getUrl(thing, property)}>{getUrl(thing, property)}</a>
      </Grid>
    </Grid>
  );
}

export function NotificationCard(props) {
  const { target } = props;
  const { thing, error } = useThing(target, target);

  function getContent(thing, error) {
    if (error) return <Card> Could not load notification {props.target} </Card>;
    if (!thing) return <Card> Loading Notification </Card>;
    return (
      <Card>
        <CardContent>
          {createLabelledValue("Type", RDF.type, thing)}
          {createLabelledValue("Actor", AS.actor, thing)}
          {createLabelledValue("Object", AS.object, thing)}
          {createLabelledValue("Target", AS.target, thing)}
          {createLabelledValue("Origin", AS.origin, thing)}
        </CardContent>
      </Card>
    );
  }

  return getContent(thing, error);
}

export function CreateEventView() {
  const { session } = useSession();
  const { webId } = session.info;
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      type: null,
      object: null,
      target: null,
    },
  });

  const artefactMappings = useArtefacts(webId);

  const contacts = useContacts(webId);

  useEffect(() => {
    if (!artefactMappings) return;
    reset({
      type: null,
      object: null,
      target: null,
    });
  }, [artefactMappings, reset]);

  async function onSubmit(data) {
    if (!data.type) {
      alert("Please select a notification type");
      return;
    }
    if (!data.object) {
      alert("Please select a notification object");
      return;
    }
    if (!data.target) {
      alert("Please select a notification target");
      return;
    }

    const finalData = { ...data, actor: webId };
    console.log("FINALDATA", finalData);
    const notificationDataset = await createNotification(
      session.fetch,
      finalData
    );
    await sendNotification(session.fetch, webId, notificationDataset);
  }

  const handleOnChange = (e) => {
    const val = e.target.value;
  };

  const objectSelections = Array.from(artefactMappings.entries()).map(
    (entry) => {
      return {
        value: entry[0],
        label: getStringNoLocale(entry[1].resourceMap, DCTERMS.title),
      };
    }
  );

  return (
    <Container fixed>
      <Card>
        <CardContent>
          Create Event Notification
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ wordBreak: "break-word" }}
          >
            <Grid container spacing={2}>
              <Grid item sm={2} xs={12}>
                <label>Type</label>
              </Grid>
              <Grid item sm={10} xs={12} className="valueParent">
                <select {...register("type")}>
                  {NOTIFICATIONTYPES.map((entry) => (
                    <option value={entry.value} key={entry.label}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </Grid>

              <Grid item sm={2} xs={12}>
                <label>Object</label>
              </Grid>
              <Grid item sm={10} xs={12} className="valueParent">
                {/* <Autocomplete
                  disablePortal
                  id="objects"
                  options={objectSelections}
                  sx={{ width: 300 }}
                  renderInput={(params) => (
                    <TextField {...params} label="Object" />
                  )}
                /> */}
                <input
                  type="text"
                  list="objectList"
                  label="label"
                  {...register("object", { required: true })}
                  onChange={handleOnChange}
                />
                <datalist id="objectList">
                  {objectSelections.map((selection) => (
                    <option key={selection.label} value={selection.value}>
                      {selection.label}
                    </option>
                  ))}
                </datalist>
                {/* <select {...register("object")}>
                  {Array.from(artefactMappings.entries()).map((entry) => (
                    <option key={entry[0]} value={entry[0]}>
                      {getStringNoLocale(entry[1].resourceMap, DCTERMS.title)}
                    </option>
                  ))}
                </select> */}
              </Grid>

              <Grid item sm={2} xs={12}>
                <label>Target WebId</label>
              </Grid>
              <Grid item sm={10} xs={12} className="valueParent">
                <input
                  type="text"
                  list="targetList"
                  label="label"
                  {...register("target", { required: true })}
                  onChange={handleOnChange}
                />
                <datalist id="targetList">
                  {contacts.map((contactWebId) => (
                    <LoadingContactOption target={contactWebId} />
                  ))}
                </datalist>
              </Grid>
            </Grid>
            <input type="submit" />
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

function LoadingContactOption(props) {
  const { session } = useSession();
  const { target } = props;
  const [name, setName] = useState("Loading Name");

  useEffect(() => {
    if (!target) return;
    async function run() {
      try {
        const dataset = await getSolidDataset(target, { fetch: session.fetch });
        if (!dataset) {
          setName("Failed to load profile name");
          return;
        }
        const thing = getThing(dataset, target);

        if (!thing) {
          setName("Failed to load profile name");
          return;
        }
        const name =
          getStringNoLocale(thing, VCARD.fn) ||
          getStringNoLocale(thing, FOAF.name);

        if (!name) {
          setName("Failed to load profile name");
          return;
        }
        setName(name);
      } catch (error) {
        console.error(`Failed to load profile name for ${target}: ${error}`);
        setName("Failed to load profile name");
      }
    }
    run();
  }, [session.fetch, target]);

  return (
    <option key={target} value={target}>
      {name}
    </option>
  );
}
