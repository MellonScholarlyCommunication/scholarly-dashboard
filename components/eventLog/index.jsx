import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect } from "react";
import { Card, CardContent, Grid } from "@material-ui/core";
import { getEventData, getEventIds } from "./eventlog";

/**
 * Display eventLog if available.
 * Provide functionality to create Event Log if none found (and you are owner)
 * Event log creation must request a location & create an event log there + link it from the profile
 */
function EventListingComponent(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const { target, small } = props;
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
      <Grid item md={small ? 6 : 4} sm={6} xs={12} key={`listingcard${id}`}>
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
            <a href={id} target="_blank" rel="noopener noreferrer">
              {id}
            </a>
          </small>

          {getProp(event, "title")}

          <CardContent style={{ margin: ".25em", padding: ".25em" }}>
            Type
            <a
              href={getProp(event, "type")}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getProp(event, "type")}
            </a>
          </CardContent>

          <CardContent style={{ margin: ".25em", padding: ".25em" }}>
            Subject
            <a href={getProp(event, "subject")}>{getProp(event, "subject")}</a>
          </CardContent>

          <CardContent style={{ margin: ".25em", padding: ".25em" }}>
            Object
            <a
              href={getProp(event, "object")}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getProp(event, "object")}
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { EventListingComponent, EventCardComponent };
