import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect } from "react"
import { getEventData, getEventIds } from "./eventlog";
import { Card, CardContent, Grid, Typography } from "@material-ui/core";

/**
 * Display eventLog if available.
 * Provide functionality to create Event Log if none found (and you are owner)
 * Event log creation must request a location & create an event log there + link it from the profile
 */
 function EventListingComponent(props) {
  const { session } = useSession();

  const targetWebId = props.target
  const [ids, setIds] = useState([]); // List of event URIs


  useEffect(() => {
    let running = true;
    async function effect() {
      let ids = await getEventIds(session.fetch, targetWebId)
      if (running) setIds(ids)
    }
    effect();
    return () => { running = false; }
  }, [])

  return (
    <Grid container spacing={1}>
      { ids.map( id => 
        <Grid item md={3} sm={6} xs={12}>
          <EventCardComponent id={id} key={id} /> 
        </Grid>
      )}
    </Grid>
  )
}


function EventCardComponent(props) {
  const { session } = useSession();
  const [event, setEvent] = useState(null)

  useEffect(() => {
    let running = true;
    async function retrieveData(id) {
      let event = await getEventData(session.fetch, id)
      if (running) {
        if(event.object && event.object.id === props.artefactId) {
          setEvent(event)
        } else {
          return;
        }
      }
    }
    retrieveData(props.id)
    return () => { running = false; }
  }, [props.id])

  function getProp(object, predicate) { return object && object[predicate] && object[predicate][0]}
  return (
    <div>
      { event && 
      <Card style={{padding: "5px", whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
        <small><a href={props.id}>{props.id}</a></small>
        <Typography gutterBottom variant="h5" component="h3">
          {getProp(event, "title")}
        </Typography>

        <CardContent style={{margin: ".25em", padding: ".25em"}}>
          <Typography gutterBottom variant="h6" component="h3">
            Type
          </Typography>
          <Typography gutterBottom variant="h6" component="h3" style={{marginLeft: "10px"}}>
            <a href={getProp(event, "type")}>{getProp(event, "type")}</a>
          </Typography>
        </CardContent>

        <CardContent style={{margin: ".25em", padding: ".25em"}}>
          <Typography gutterBottom variant="h6" component="h3">
            Subject
          </Typography>
          <Typography gutterBottom variant="h6" component="h3" style={{marginLeft: "10px"}}>
            <a href={getProp(event, "subject")}>{getProp(event, "subject")}</a>
          </Typography>
        </CardContent>


        <CardContent style={{margin: ".25em", padding: ".25em"}}>
          <Typography gutterBottom variant="h6" component="h3">
            Object
          </Typography>
          <Typography gutterBottom variant="h6" component="h3" style={{marginLeft: "10px"}}>
            <a href={getProp(event, "object")}>{getProp(event, "object")}</a>
          </Typography>
        </CardContent>
        
      </Card>
    }
    </div>
  )
}


export { EventListingComponent, EventCardComponent }

