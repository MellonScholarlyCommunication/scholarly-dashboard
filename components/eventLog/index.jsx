/* eslint-disable import/no-cycle */
import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect } from "react";
import { Card, CardContent, Grid } from "@material-ui/core";
import { AS, RDF } from "@inrupt/lit-generated-vocab-common";
import { Label } from "@inrupt/prism-react-components";
import { asUrl, getDate, getUrl, getUrlAll } from "@inrupt/solid-client";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getEventIds, getEventThings } from "./eventlog";
import { CardViewerComponent } from "../cards";

/**
 * Display eventLog if available.
 * Provide functionality to create Event Log if none found (and you are owner)
 * Event log creation must request a location & create an event log there + link it from the profile
 */
function EventListingComponent(props) {
  const { session } = useSession();
  const { webId } = session.info;
  const { target, artefactId, small } = props;
  const [ids, setIds] = useState(null); // List of event URIs
  const targetWebId = target || webId;

  useEffect(() => {
    let running = true;
    async function effect() {
      const ids = await getEventIds(session.fetch, targetWebId, artefactId);
      if (running) setIds(ids);
    }
    effect();
    return () => {
      running = false;
    };
  }, [artefactId, session.fetch, targetWebId]);

  function getContents() {
    if (!ids) {
      return <label>Loading Event information</label>;
    }
    if (ids && ids.length === 0) {
      return <label>No Events could be found</label>;
    }
    return ids.map((id) => (
      <Grid item md={small ? 6 : 4} sm={12} key={`listingcard${id}`}>
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
  console.log("we have a card for", props);
  const { session } = useSession();
  const [eventThings, setEventThings] = useState(null);
  const { artefactId, id } = props;

  useEffect(() => {
    let running = true;
    async function retrieveData(id) {
      const eventThings = await getEventThings(session.fetch, id);
      if (running) setEventThings(eventThings);
    }
    retrieveData(id);
    return () => {
      running = false;
    };
  }, [artefactId, id, session.fetch]);

  function getEventType(thing) {
    const types = getUrlAll(thing, RDF.type);
    const returnTypes = [];
    for (const type of types) {
      let splitType = type && type.split("/");
      const result = splitType[splitType.length - 1];
      splitType = result && result.split("#");
      returnTypes.push(splitType[splitType.length - 1]);
    }
    return returnTypes.join(", ");
  }

  function createAccordion(label, thing, property) {
    const url = getUrl(thing, property);
    return url ? (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${asUrl(thing)}-panel-${label}-content`}
          id={`${asUrl(thing)}-panel-${label}-header`}
        >
          <Label>
            {label}: {}
          </Label>
        </AccordionSummary>
        <AccordionDetails>
          <CardViewerComponent target={url} />
        </AccordionDetails>
      </Accordion>
    ) : (
      <div style={{ display: "hidden" }} />
    );
  }

  return (
    <div>
      {eventThings &&
        eventThings.map((eventThing) => {
          return (
            <Card
              style={{
                padding: "5px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
              }}
            >
              <a href={id} target="_blank" rel="noopener noreferrer">
                <Label>{getEventType(eventThing)}</Label>
              </a>
              <br />
              <Label>URI: {asUrl(eventThing)}</Label>
              <CardContent>
                <Label>{getDate(eventThing, AS.published)}</Label>
                {createAccordion("Actor", eventThing, AS.actor)}
                {createAccordion("Subject", eventThing, AS.subject)}
                {createAccordion("Object", eventThing, AS.object)}
                {createAccordion("Target", eventThing, AS.target)}
                {createAccordion("Origin", eventThing, AS.origin)}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}

export { EventListingComponent, EventCardComponent };
