/* eslint-disable react/jsx-props-no-spreading */
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Container,
} from "@material-ui/core";
import { AS, DCTERMS, RDF } from "@inrupt/vocab-common-rdf";
import { useForm } from "react-hook-form";
import { useSession, useThing } from "@inrupt/solid-ui-react";
import { getStringNoLocale, getUrl } from "@inrupt/solid-client";
import useArtefacts from "../../hooks/useArtefacts";
import {
  createNotification,
  sendNotification,
} from "../../utils/NotificationUtils";
import useNotifications from "../../hooks/useNotifications";

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
        <Typography gutterBottom variant="h5" component="h3">
          {label}
        </Typography>
      </Grid>
      <Grid item sm={9} xs={12}>
        <Typography
          gutterBottom
          variant="h6"
          component="h3"
          style={{ marginLeft: "10px" }}
        >
          <a href={getUrl(thing, property)}>{getUrl(thing, property)}</a>
        </Typography>
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

export function CreateNotificationView() {
  const { session } = useSession();
  const { webId } = session.info;
  const { register, handleSubmit } = useForm();
  const artefactMappings = useArtefacts(webId);

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
      console.log("submitting", data);
      alert("Please select a notification target");
      return;
    }

    const finalData = { ...data, actor: webId };

    const notificationDataset = await createNotification(
      session.fetch,
      finalData
    );
    await sendNotification(session.fetch, webId, notificationDataset);
  }

  return (
    <Container fixed>
      <Card>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h3">
            Create Notification
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item sm={2} xs={12}>
                <label>Notification Type</label>
              </Grid>
              <Grid item sm={10} xs={12}>
                <select {...register("type")}>
                  <option value={AS.Offer} key="offer">
                    Offer
                  </option>
                  <option value={AS.Announce} key="announce">
                    Announce
                  </option>
                </select>
              </Grid>

              <Grid item sm={2} xs={12}>
                <label>Notification Object</label>
              </Grid>
              <Grid item sm={10} xs={12}>
                <select {...register("object")}>
                  {Array.from(artefactMappings.entries()).map((entry) => (
                    <option key={entry[0]} value={entry[0]}>
                      {getStringNoLocale(entry[1].resourceMap, DCTERMS.title)}
                    </option>
                  ))}
                </select>
              </Grid>

              <Grid item sm={2} xs={12}>
                <label>Notification Target WebId</label>
              </Grid>
              <Grid item sm={10} xs={12}>
                <input {...register("target")} />
              </Grid>
            </Grid>
            <input type="submit" />
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
