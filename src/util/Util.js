import React from 'react'
import * as N3 from 'n3'
import NotificationsViewerComponent from '../Components/NotificationsViewerComponent'
import ProfileViewerComponent from '../Components/Views/ProfileViewerComponent'
import ProfileEditorComponent from '../Components/ProfileEditorComponent'
import HelpComponent from '../Components/Help/HelpComponent'
import LoginComponent from '../Components/Login/LoginComponent'

import PersonIcon from '@material-ui/icons/Person';
import NotificationsIcon from '@material-ui/icons/Notifications';
import HelpIcon from '@material-ui/icons/Help';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import CardMembershipIcon from '@material-ui/icons/CardMembership';
import ListIcon from '@material-ui/icons/List';
import GavelIcon from '@material-ui/icons/Gavel';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ContactsIcon from '@material-ui/icons/Contacts';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import PublishIcon from '@material-ui/icons/Publish';

import FeedComponent from '../Components/Views/FeedComponent'
import DocumentsViewerComponent from '../Components/Views/DocumentsViewerComponent'
import ContactsComponent from '../Components/Views/ContactsComponent'
import ResourceMissingComponent from '../Components/ResourceMissingComponent'
import UploadComponent from '../Components/Views/UploadComponent'
import DocumentInfoViewer from '../Components/Documents/DocumentInfoViewer'
import { Switch, Route } from 'react-router-dom'
import withContent from '../HOC/withContent'

export const validStatusCodes = [200, 201, 202]

export async function getPromiseValueOrUndefined (promise){
  try { return await promise.value }
  catch { return undefined }
}

/**
 * The available views that can be set, with the required information
 */
export const availableViews = {
  login:          {id:"login",            label:'Login',            component: LoginComponent,                generation:(props) => <LoginComponent {...props}/>,               icon: <ExitToAppIcon />,        target: '/login',         newtab: false},
  profile:        {id:"profile",          label:'Profile',          component: ProfileViewerComponent,        generation:(props) => <ProfileViewerComponent {...props}/>,       icon: <PersonIcon />,           target: '/profile',       newtab: false},
  profileeditor:  {id:"profileedit",      label:'Profile Editor',   component: ProfileEditorComponent,        generation:(props) => <ProfileEditorComponent {...props}/>,       icon: <HelpIcon />,             target: '/profileedit',   newtab: false},
  notifications:  {id:"notifications",    label:'Notifications',    component: NotificationsViewerComponent,  generation:(props) => <NotificationsViewerComponent {...props}/>, icon: <NotificationsIcon />,    target: '/notifications', newtab: false},
  help:           {id:"help",             label:'Help',             component: HelpComponent,                 generation:(props) => <HelpComponent {...props}/>,                icon: <HelpIcon />,             target: '/help',          newtab: true},
  feed:           {id:"feed",             label:'Feed',             component: FeedComponent,                 generation:(props) => <FeedComponent {...props}/>,                icon: <DynamicFeedIcon />,      target: '/feed',          newtab: false},
  documents:      {id:"documents",        label:'Publications',     component: DocumentsViewerComponent,      generation:(props) => <DocumentsViewerComponent {...props}/>,     icon: <InsertDriveFileIcon />,  target: '/documents',     newtab: false},
  contacts:       {id:"contacts",         label:'Following',        component: ContactsComponent,             generation:(props) => <ContactsComponent {...props}/>,            icon: <ContactsIcon />,         target: '/contacts',      newtab: false},
  missing:        {id:"missing",          label:'Resource Missing', component: ResourceMissingComponent,      generation:(props) => <ResourceMissingComponent {...props}/>,     icon: <HelpIcon />,             target: '/missing',       newtab: false},
  upload:         {id:"upload",           label:'Upload',           component: UploadComponent,               generation:(props) => <UploadComponent {...props}/>,              icon: <PublishIcon />,          target: '/upload',        newtab: false},
  documentinfo:   {id:"documentinfo",     label:'Document info',    component: DocumentInfoViewer,            generation:(props) => <DocumentInfoViewer {...props}/>,           icon: <HelpIcon />,             target: '/docinfo',       newtab: false},
}

export const getAvailableRoutes = () => {
  return(
    <Switch>
      {Object.keys(availableViews).map((viewId, index) => 
        <Route exact path={availableViews[viewId].target} key={availableViews[viewId].id} component={withContent(availableViews[viewId])} key={index}/>
      )}
      <Route path='' key='defaultroute' component={withContent(availableViews.missing)} />
    </Switch>
  )
}

/**
 * Mapping to see which sidebar item should be displayed as selected per view.
 */
export const activeDrawerItemMapping = {
  profile:          "profile",
  profileeditor:    "profile",
  requests:         "requests",
  marriagerequest:  "requests",
  running:          "running",
  marriageview:     "running",
  certificates:     "certificates",
  certificateview:  "certificates",
  official:         "official",
  submissionview:   "official",
  notifications:    "notifications",
  help:             "help",
}


export function formatDate(date) {
  date = new Date(date)
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = date.getFullYear();
  return (mm + '/' + dd + '/' + yyyy)
}

export function getCleanedIRI(IRI) {
  return IRI.split("#")[0];
}

export function getBaseIRI(IRI) {
  let path = IRI;
  path = path.replace(/(^\w+:|^)\/\//, "");
  path = path.split("/").slice(1).join("/");
  path =
    IRI.substring(0, IRI.indexOf(path)).replace(/\/$/, "") +
    "/";
  return path;
}

export function routeViewWithParams (view, params) {
  const route = view.target;
  let paramString = '?'
  for (const [key, value] of Object.entries(params)) {
    if(value) paramString += `${key}=${params[key]}&` 
  }
  return paramString === '?' ? route : route+paramString.slice(0, -1) // slice away last & sign

}