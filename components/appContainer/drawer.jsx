import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import LanguageIcon from '@mui/icons-material/Language';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';
import PublishIcon from '@material-ui/icons/Publish';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';

import { useRouter } from 'next/dist/client/router';


const drawerWidth = 240;

const routingOptions = {
  "browser": {
    label:"Browser",
    pathname:"/",
    query: null,
    icon: <LanguageIcon />,
  },
  "profile": {
    label:"Profile",
    pathname:"/profile",
    query: null,
    icon: <PersonIcon />,
  },
  "artefacts": {
    label:"Artefacts",
    pathname:"/artefacts",
    query: null,
    icon: <InboxIcon />,
  },
  "events": {
    label:"Events",
    pathname:"/events",
    query: null,
    icon: <UploadFileIcon />,
  },
  "notifications": {
    label:"Notifications",
    pathname:"/notifications",
    query: null,
    icon: <InboxIcon />,
  },
  
  "upload": {
    label:"Upload",
    pathname:"/upload",
    query: null,
    icon: <UploadFileIcon />,
  },
  "createNotifications": {
    label:"Create Notification",
    pathname:"/notifications/create",
    query: null,
    icon: <MailIcon />,
  },

  "settings": {
    label:"Settings",
    pathname:"/settings",
    query: null,
    icon: <SettingsIcon />,
  },
  
}

export default function MyDrawer( {children} ) {
  const router = useRouter();
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          zIndex: 1000,
        }}
        id="drawer"
      >
        <Toolbar />
        <Box id="box">
          <List>
            {[routingOptions.browser, routingOptions.profile, routingOptions.notifications].map(object => 
              <ListItem button key={object.label} style={{padding: "8px 16px"}} onClick={() => route(router, object)}>
                <ListItemIcon>
                  {object.icon}
                </ListItemIcon>
                <ListItemText primary={object.label} />
              </ListItem>
            )}
          </List>
          <Divider />
          <List>
            {[routingOptions.upload, routingOptions.createNotifications].map(object => (
              <ListItem button key={object.label} style={{padding: "8px 16px"}} onClick={() => route(router, object)}>
                <ListItemIcon>
                  {object.icon}
                </ListItemIcon>
                <ListItemText primary={object.label} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {[routingOptions.settings].map(object => (
              <ListItem button key={object.label} style={{padding: "8px 16px"}} onClick={() => route(router, object)}>
                <ListItemIcon>
                  {object.icon}
                </ListItemIcon>
                <ListItemText primary={object.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        { children }
      </Box>
    </Box>
  );
}

function route(router, object) {

  router.push({
    pathname: object.pathname,
    query: object.query,
  })
}