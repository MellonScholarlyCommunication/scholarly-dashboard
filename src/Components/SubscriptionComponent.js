import { FormControl, Input, InputLabel, makeStyles, MenuItem, Select } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Subscription, SubscriptionTopic } from 'util/Util';
import { useForm } from "react-hook-form";
import styles from '../css/components/profilecard.module.css'
import { createFollowEventNotification } from 'util/MellonUtils/notifications';
import { getInboxAgent } from 'singletons/InboxAgent';

// TODO:: on error, reload page

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  dividerDiv: {
    "height": "10px"
  }
}));

const SubscriptionComponent = (props) => {

  const [addSubView, setAddSubView] = useState(false)

  const [subscriptions, setSubscriptions] = useState([
    new Subscription(SubscriptionTopic.AUHTORID, "https://carol.localhost:8443/profile/card#me", "https://myservice.com/subscriptions/", 1),
    new Subscription(SubscriptionTopic.KEYWORD, "test", "https://myservice.com/subscriptions/", 2),
    new Subscription(SubscriptionTopic.TITLE, "Test title", "https://myservice.com/subscriptions/", 3),
    new Subscription(SubscriptionTopic.ARTEFACTID, "https://carol.localhost:8443/publications/publication.ttl", "https://myservice.com/subscriptions/", 4),
  ])

  const submitSubscription = async(subscription) => {

    const notification = createFollowEventNotification(props.webId, [subscription])
    const agent = getInboxAgent(props.webId)
    // await dosomething
    // on success
    agent.sendNotification({
      to: [ props.webId ],
      contentType: "application/ld+json",
      contentTypeOutput: "application/ld+json",
      notification: notification,
    })

    const newstate = subscriptions.slice()
    newstate.push(subscription)
    setSubscriptions(newstate)
    setAddSubView(false)
  }

  const removeSubscription = async(subscription) => {
    // remove remote subscription
    // on success
    let newstate = subscriptions.slice()
    newstate = newstate.filter(s => s.id !== subscription.id)
    setSubscriptions(newstate)
  }

  const subscriptionListing = (subscription) => {
    return (
      <div>
        <div className={styles.container}>
          <Row key={subscription.id || Math.round(Math.random() * 100)}>
            <Col> {subscription.topic} </Col>
            <Col> {subscription.value} </Col>
            <Col> {subscription.url} </Col>
            { subscription.id
              ? <Col><Button onClick={ () => removeSubscription(subscription)}> {"X"} </Button></Col> 
              : <Col>Pending</Col>}
          </Row>
        </div>
        <div style={{height: "5px"}} />
      </div>
    )
  }


  return (
    <div id="subscrptioncomponent" className='container'>
      <h4> Subscriptions </h4>
      {
        addSubView
          ? <SubscriptionCreateComponent onSubmit={(item) => submitSubscription(item)}/>
          : <Button onClick={() => setAddSubView(true)}>Add new subscription</Button>
      }
      <div style={{height: "20px"}} />
      <div className="subscriptionListings">
        <Row>
          <Col><b>Topic</b></Col>
          <Col><b>Value</b></Col>
          <Col><b>Service URL</b></Col>
          <Col><b>Remove subscription</b></Col>
        </Row>
        <div style={{height: "5px"}} />
        {subscriptions.map(s => subscriptionListing(s))}
      </div>
      <div className="subscriptionCreation"></div>
    </div>
  )
}

const SubscriptionCreateComponent = (props) => {
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = data => { 
    console.log(data);
    const subscriptionObject = new Subscription(data.topic, data.value, data.url)
    props.onSubmit(subscriptionObject)
  }

  return (
    <div id="createsubscriptioncomponent" className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col><b>Topic</b></Col>
          <Col><b>Value</b></Col>
        </Row>
        <Row>
          <Col>
          <select name='topic' ref={register({ required: true })}>
            <option value={SubscriptionTopic.ARTEFACTID}>artefact</option>
            <option value={SubscriptionTopic.AUHTORID}>author</option>
            <option value={SubscriptionTopic.KEYWORD}>keyword</option>
            <option value={SubscriptionTopic.TITLE}>title</option>
          </select>
          </Col>
          <Col><input name="value" className="inputfield" ref={register({ required: true })} /></Col>
        </Row>
        <Row>
          <Col>
            {errors.topic && <span className="errortext">This field is required</span>}
          </Col>
          <Col>
            {errors.value && <span className="errortext">This field is required</span>}
          </Col>
        </Row>
        <Row>
          <input type="submit" />    
        </Row>
      </form>
    </div>
  )
}

export default SubscriptionComponent

