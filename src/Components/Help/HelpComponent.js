import React from 'react'

const HelpComponent = (props) => {
  return (
    <div id="HelpComponent" className='container leftaligntext'>
      TODO
    </div>
  )
}

export default HelpComponent




/*
<h4 className='container centeraligntext'>How to get married with SOLID in 5 simple steps</h4>

      <Row>
        <Col md={1}>{availableViews.login.icon}</Col>
        <Col md={11}><h4>Preliminaries</h4></Col>
      </Row>
      <Row>
      
        <Col md={1}></Col>
        <Col md={11}>
          <p>Before starting this demonstration for SOLID, you are expected to created a SOLID pod.</p>
          <p>In case you do not do not yet have a SOLID pod available, you can create a pod on <a href={'https://solid.community/register'}>solid community</a>.</p>
          <p>(or using login button - choose provider - register account. But this should be explained with pictures)</p>
        </Col>
      </Row>
      <br />
        
      <Row>
        <Col md={1}>{availableViews.profile.icon}</Col>
        <Col md={11}><h4>Step 1 - Complete user profile</h4></Col>
      </Row>
      <Row>
        <Col md={1}></Col>
        <Col md={11}>
          <p>The first step of this demonstration is to fill out your profile information.</p>
          <p>This ensures that subsequent steps in the demonstration can retrieve some information from your pod to show in the forms.</p>
          <p>You can find (some of) your profile information in the profile tab on the left.</p>
          <p>In this tab, you can edit your profile information by clicking the <Button>Edit</Button> button.</p>
          <p>In the edit screen, you can fill in your profile information in the fields, and submit the using the <Button type="submit">Submit</Button> button.</p>
          <p>All fields are mandatory!</p>
        </Col>
      </Row>
      <br />

      <Row>
        <Col md={1}>{availableViews.requests.icon}</Col>
        <Col md={11}><h4>Step 2 - Planning a Wedding</h4></Col>
      </Row>
      <Row>
        <Col md={1}></Col>
        <Col md={11}>
          <p>Now that your profile information is filled in, you can start planning your wedding.</p>
          <p>To initiate the marriage procedure, go to the <b>Procedures</b> tab.</p>
          <p>Here, the procedure can be initiated by clicking <Button>Initiate procedure</Button> for the Marriage certificate type.</p>
          <p>Now, you will find your information already filled out as one of the spouses.</p>
          <p>A marriage requires two spouses to be given, as well as one or more witnesses.</p>
          <p>If a valid webId is entered, the associated profile will be shown automatically.</p>
          <p>In case this profile is incomplete, an error message will be shown. Please choose a different webId, or wait for the person to complete their profile.</p>
          <p>If all necessary information is filled in, the proposal is ready to be submitted.</p>
          <p>You can use the default storage location to store the created marriage proposal on your pod, or select a custom location (please make sure the selected location is valid, and read permissions are public. If this is not the case, the people you invite will not be able to see the marriage proposal).</p>
          <p>Now, you can submit the marriage proposal using <Button>Submit</Button></p>
        </Col>
      </Row>
      <br />

      <Row>
        <Col md={1}>{availableViews.running.icon}</Col>
        <Col md={11}><h4>Step 3 - Confirming requests</h4></Col>
      </Row>
      <Row>
        <Col md={1}></Col>
        <Col md={11}>
          <p>On creation of a marriage proposal, all parties (spouses and witnesses) are notified of the created proposal.</p>
          <p>These notifications can be found by clicking the notification icon 
          <IconButton aria-label={'notifications'} color="inherit">
            <Badge badgeContent={1} color="secondary">
              {availableViews.notifications.icon}
            </Badge>
          </IconButton>
          at the top of your screen.</p>
          <p>Now, you can see the marriage proposal, and all people involved in the proposal.</p>
          <p>In this form, you will see two action buttons next to your name: <button type="button" className="marriageview_accept__3V0c_ centeraligntext btn btn-primary" style={{width: '120px'}}> Accept </button> and <button type="button" className="marriageview_refuse__2lqar centeraligntext btn btn-primary" style={{width: '120px'}}> Refuse </button>.</p>
          <p>With these, you can accept or refuse the invitation.</p>
          <p>For the creator of a proposal, a button is available to resend an invitation. This will trigger another notification to be sent to the person.</p>
          <p>When everybody has accepted the proposal, a button <button type="button" className="marriageview_accept__3V0c_ valuebutton btn btn-primary" style={{width: '220px'}}> Submit Marriage Proposal </button> is available for the creator of the proposal to submit the proposal for validation.</p>
        </Col>
      </Row>    
      <br />

      <Row>
        <Col md={1}>{availableViews.official.icon}</Col>
        <Col md={11}><h4>Step 4 - Validation by an official</h4></Col>
      </Row>
      <Row>
        <Col md={1}></Col>
        <Col md={11}>
          <p>With the proposal submitted, it is now ready to be validated by a state official.</p>
          <p>In this demo, you are yourself promoted to state official, congratulations!</p>
          <p>Now that you are a state official, you can see the proposals submitted to the state pod inbox (which in this case is the inbox of your personal pod) in the official tab</p>
          <p>In this tab, all proposal submissions that are made to the state pod (your pod in this case) are listed.</p>
          <p>A proposal can be evaluated by clicking <Button className='centeraligntext' style={{width: '100px'}}>Evaluate</Button></p>
          <p>In the evaluation screen, the people involved in the proposal are listed with their information and their status if they confirmed or rejected the wedding proposal.</p>
          <p>In case all information can be retrieved, and all people have confirmed their part in the marriage, the official (you) can approve the marriage proposal with <button type="button" className="marriageview_accept__3V0c_ valuebutton btn btn-primary" style={{width: '160px'}}> Approve Proposal </button>, or choose to reject it with <button type="button" className="marriageview_delete__1FaK6 valuebutton btn btn-primary" style={{width: '160px'}}> Reject Proposal </button>.</p>
          <p>Depending on your choice, a notification will be sent to the people involved that the marriage proposal has been approved or rejected</p>
        </Col>
      </Row>    
      <br />

      <Row>
        <Col md={1}>{availableViews.certificates.icon}</Col>
        <Col md={11}><h4>Step 5 - Retrieving the certificate</h4></Col>
      </Row>
      <Row>
        <Col md={1}></Col>
        <Col md={11}>
          <p>In the case that your marriage proposal is accepted, you are now officially married, and you can now retrieve your marriage certificate.</p>
          <p>This can be found in the Certificates tab.</p>
          <p>You can view the certificate using  <button type="button" className="btn btn-primary" style={{width: '150px'}}>View certificate</button>.</p>
          <p>In this view, all the information about the marriage and the certificate is listed.</p>
          <p>A PDF version of the certificate can be retrieved using <button type="button" className="btn btn-primary" style={{width: '100px'}}>Get PDF</button>.</p>
        </Col>
      </Row>
      <br />

*/