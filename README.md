# Scholarly Dashboard
This application serves as the scholarly dashboard prototype for the Mellon project.




# Technical breakdown

## Browser tab
The browser tab of the dashboard is a prototype for the scholarly browser.
It enables the user to manually follow the available links to discover scholarly artefacts in the network.
It contains a dumbed down collector, that only collects relevant resources that are directly linked to the browser artefacts.
The data displayed by the browser is limited according to the read permissions of the active user on the browser data pod.

The URL bar at the top of the screen can be used to manually browse specific entities or artefacts in the network for scholarly information.


## Profile tab
*Requires the user to be authenticated and have an active session.*
The profile tab provides an overview of the profile information of the webId connected to the current session.
The tab provides a button to edit the profile.
In the edit menu, the user can update their profile information and avatar.
Updates to these fields make use of the [Value](https://solid-ui-react.docs.inrupt.com/?path=/docs/components-value--string-value) components of the [inrupt react libraries](https://solid-ui-react.docs.inrupt.com/).
On a new value being submitted, the profile is patched with the new value automatically.


## Artefacts
*Requires the user to be authenticated and have an active session.*
The artefacts tab 



*discovery*
The artefact discovery algorithm follows the [mellon datapod spec](https://mellonscholarlycommunication.github.io/spec-datapod/).
It makes use of the type index file linked from the user profile using the *solid:publicTypeIndex* predicate.
In the typeIndex file, artefacts are linked according to:
- their resource map:
```
@prefix ore: <http://www.openarchives.org/ore/terms/>.
@prefix solid: <http://www.w3.org/ns/solid/terms#>
... 
<....> a solid:typeRegistration;
       solid:forClass ore:ResourceMap;
       solid:instance <ResourceMapLocation>.
```
- their aggregation:
```
@prefix ore: <http://www.openarchives.org/ore/terms/>.
@prefix solid: <http://www.w3.org/ns/solid/terms#>
... 
<....> a solid:typeRegistration;
       solid:forClass ore:Aggregation;
       solid:instance <AggregationLocation>.
```
- their instances:
```
@prefix ore: <http://www.openarchives.org/ore/terms/>.
@prefix solid: <http://www.w3.org/ns/solid/terms#>
... 
<....> a solid:typeRegistration;
       solid:forClass example:Artefact;
       solid:instance <InstanceLocation>.
```

The **ResourceMap** resource is a HTML resource that serves as a landing page for an artefact for both users and machines. It provides a link to the aggregation resource using a Link element, as well as using embedded rdf in the HTML page.s

The **Aggregation** resource is an RDF resource that aggregates the available instances of the artefact. 
<> a ore:Aggregation;
     ...
     ore:aggregates </scholar/artefact1_pdf.pdf>;
     ore:aggregates </scholar/artefact1_tex.tex>;
</scholar/artefact1_tex.tex> a <https://example.com/Artefact>;
     ...
</scholar/artefact1_pdf.pdf> a <https://example.com/Artefact>;
     ...
/scholar/artefact1_pdf.pdf
a pdf file

/scholar/artefact1_tex.tex
a latex file

**This View is also available in the data browser, when browsing the WebId of another user to display their available artefacts.**

### Artefact View
This view displays the available data for an **Artefact Resource Map**.
It incorporates the resource map data, the aggregation data, and all available instances.
It links to the available instances, as well as to the **HTML representation** of the resource map.

## Upload
*Requires the user to be authenticated and have an active session.*

## Events
*Requires the user to be authenticated and have an active session.*
The Event tab displays a listing of the events available on the data pod of the WebId of the current session.
The events are aggregated using the event logs advertised via the user's profile or available artefacts.
The events can be clicked to view a detailed page of the individual events.
**This View is also available in the data browser, when browsing the WebId of another user to display their available events.**

### Event View
This view shows the details of an individual event.

## Create Notification
*Requires the user to be authenticated and have an active session.*
The create notification tab enables the user to manually create a simple notification.
It takes a type of **Offer** or **Announce**, an object as one of the user's artefacts, and a target to which the offer or announcement of the artefact has to be sent.
On sending, a notification is generated, and sent to the orchestrator inbox.

## Settings
*Requires the user to be authenticated and have an active session.*
The settings tab enables the user to update the links on their profile that are required to use the full range of functionality from the scholarly dashboard.
It displays the current links for the required predicates, and enables to used to edit these links.
The required links are:
- **inbox** : The link of the user inbox. 
- **outbox** : The link of the user's container where events are stored.
- **publicTypeIndex** : The user's public type index file, where all actors on the network can view the user's linked resources. This resource is used to link all artefacts and their aggregations and resource maps from the user profile.
- **orchestrator** : The orchestrator link enables the dashboard to send outgoing notifications to the orchestrator for processing.