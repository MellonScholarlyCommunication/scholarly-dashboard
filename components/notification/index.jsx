import { Card, CardContent, Grid, Typography, Container } from "@material-ui/core"
import { AS, DCTERMS, RDF } from "@inrupt/vocab-common-rdf";
import { useForm } from "react-hook-form";
import { useSession, useThing } from "@inrupt/solid-ui-react";
import { useArtefacts } from "../../hooks/useArtefacts";
import { getStringNoLocale, getUrl } from "@inrupt/solid-client";
import { createNotification, sendNotification } from "../../utils/NotificationUtils";
import useNotifications from "../../hooks/useNotifications";


export function NotificationView(props) {
  let notificationIds = useNotifications()
  console.log('NOTIFICATIONIDS', notificationIds)

  return (
    <Container fixed> 
      <Grid container spacing={2}>
        {notificationIds.map(id => 
          <Grid item md={4} sm={6} xs={12}> 
            <NotificationCard target={id} /> 
          </Grid>
        )} 
      </Grid>
    </Container>
  )
}

function createLabelledValue(label, property, thing) {
  console.log('creating', label, property, thing)
  return(
    <Grid container spacing={2}>
      <Grid item sm={3} xs={12}>
        <Typography gutterBottom variant="h5" component="h3">
          {label}
        </Typography>
      </Grid>
      <Grid item sm={9} xs={12}>
        <Typography gutterBottom variant="h6" component="h3" style={{marginLeft: "10px"}}>
          <a href={getUrl(thing, property)}>{getUrl(thing, property)}</a>
        </Typography>
      </Grid>
    </Grid>
  )
}

export function NotificationCard(props) {
  let {thing, error} = useThing(props.target, props.target)
  console.log('THING', thing, error, props)
  return (
    error
    ? <Card> Could not load notification {props.target} </Card>
    : thing
    ?<Card>
      <CardContent>
        {createLabelledValue("Type", RDF.type, thing)}
        {createLabelledValue("Actor", AS.actor, thing)}
        {createLabelledValue("Object", AS.object, thing)}
        {createLabelledValue("Target", AS.target, thing)}
        {createLabelledValue("Origin", AS.origin, thing)}

      </CardContent>
    </Card>
    : <Card> Loading Notification </Card>
  )
}

export function CreateNotificationView() {
  const { session } = useSession();
  const { webId, isLoggedIn } = session.info;

  const { register, handleSubmit } = useForm();

  let artefactMappings = useArtefacts(webId)
  console.log('session', isLoggedIn)

  async function onSubmit (data) { 
    console.log("submitting", data); 
    if (!data.type) { alert("Please select a notification type"); return }
    if (!data.object) { alert("Please select a notification object"); return }
    if (!data.target) { alert("Please select a notification target"); return }
    data.actor = webId

    const notificationDataset = await createNotification(data)
    await sendNotification(session.fetch, webId, notificationDataset)
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

              <Grid item sm={2} xs={12}> <label>Notification Type</label> </Grid>
              <Grid item sm={10} xs={12}>
                <select {...register("type")}>
                  <option value={AS.Offer} key="offer" >Offer</option>
                  <option value={AS.Announce} key="announce">Announce</option>
                </select>
              </Grid>

              <Grid item sm={2} xs={12}> <label>Notification Object</label> </Grid>
              <Grid item sm={10} xs={12}>
                <select {...register("object")}>
                  
                  {Array.from(artefactMappings.entries()).map(entry => <option key={entry[0]} value={entry[0]}>{getStringNoLocale(entry[1].resourceMap, DCTERMS.title)}</option>)}
                </select>
              </Grid>

              <Grid item sm={2} xs={12}> <label>Notification Target WebId</label> </Grid>
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
