import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect } from "react";
import { Card, CardContent, Grid, Typography } from "@material-ui/core";
import { getEventData, getEventIds } from "./eventlog";

/**
 * Display eventLog if available.
 * Provide functionality to create Event Log if none found (and you are owner)
 * Event log creation must request a location & create an event log there + link it from the profile
 */
function EventListingComponent(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const { target } = props;
  const [ids, setIds] = useState(null); // List of event URIs
  const targetWebId = target || webId;

  useEffect(() => {
    let running = true;
    async function effect() {
      const ids = await getEventIds(session.fetch, targetWebId);
      if (running) setIds(ids);
    }
    effect();
    return () => {
      running = false;
    };
  }, [session.fetch, targetWebId]);

  function getContents() {
    if (!ids) {
      return <label>Loading Event information</label>;
    }
    if (ids && ids.length === 0) {
      return <label>No Events could be found</label>;
    }
    return ids.map((id) => (
      <Grid item md={3} sm={6} xs={12} key={`listingcard${id}`}>
        <EventCardComponent id={id} key={`cardcomponent${id}`} />
      </Grid>
    ));
  }

  return (
    <Grid container spacing={1}>
      {getContents()}
    </Grid>
  );
}

function EventCardComponent(props) {
  const { session } = useSession();
  const [event, setEvent] = useState(null);
  const { artefactId, id } = props;

  useEffect(() => {
    let running = true;
    async function retrieveData(id) {
      const event = await getEventData(session.fetch, id);
      if (running && event.object && event.object.id === artefactId) {
        setEvent(event);
      }
    }
    retrieveData(id);
    return () => {
      running = false;
    };
  }, [artefactId, id, session.fetch]);

  function getProp(object, predicate) {
    return object && object[predicate] && object[predicate][0];
  }
  return (
    <div>
      {event && (
        <Card
          style={{
            padding: "5px",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
          }}
        >
          <small>
            <a href={id}>{id}</a>
          </small>
          <Typography gutterBottom variant="h5" component="h3">
            {getProp(event, "title")}
          </Typography>

          <CardContent style={{ margin: ".25em", padding: ".25em" }}>
            <Typography gutterBottom variant="h6" component="h3">
              Type
            </Typography>
            <Typography
              gutterBottom
              variant="h6"
              component="h3"
              style={{ marginLeft: "10px" }}
            >
              <a href={getProp(event, "type")}>{getProp(event, "type")}</a>
            </Typography>
          </CardContent>

          <CardContent style={{ margin: ".25em", padding: ".25em" }}>
            <Typography gutterBottom variant="h6" component="h3">
              Subject
            </Typography>
            <Typography
              gutterBottom
              variant="h6"
              component="h3"
              style={{ marginLeft: "10px" }}
            >
              <a href={getProp(event, "subject")}>
                {getProp(event, "subject")}
              </a>
            </Typography>
          </CardContent>

          <CardContent style={{ margin: ".25em", padding: ".25em" }}>
            <Typography gutterBottom variant="h6" component="h3">
              Object
            </Typography>
            <Typography
              gutterBottom
              variant="h6"
              component="h3"
              style={{ marginLeft: "10px" }}
            >
              <a href={getProp(event, "object")}>{getProp(event, "object")}</a>
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { EventListingComponent, EventCardComponent };
