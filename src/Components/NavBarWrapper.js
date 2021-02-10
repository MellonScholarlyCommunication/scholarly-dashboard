import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { availableViews, getAvailableRoutes } from '../util/Util';
import useNotifications from '../hooks/useNotifications';
import { withWebId } from '@inrupt/solid-react-components';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import { LogoutButton, LoggedIn, LoggedOut  } from '@solid/react';

import '../css/Drawer.css'


// import solidlogo from '../assets/solid-emblem.svg';
// import idlablogo from '../assets/idlab.png';
import { Route, Link, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import LoginComponent from './Login/LoginComponent';
import withContent from '../HOC/withContent';

var drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const NavBarWrapper = withWebId((props) => {
  const [open, setOpen] = React.useState(true);


  // const isActive = (item) => item.id === activeDrawerItemMapping[selectedView.id]
  // TODO:: fix this with new routing to display grey border around appropriate sidebar item
  const isActive = (item) => false;

  const getSidebarComponent = (itemName, index) => { 
    const item = availableViews[itemName]
    switch (itemName) {
      case 'divider':
        return (<Divider key={index}/>)
      case 'br':
        return (<br key={index}/>)
      default:
        if (!item) return <div />
        return (
          <Link to={item.target} target={item.newtab ? "_blank" : undefined} style={{ textDecoration: 'none', color: "black" }} key={index}>
            <ListItem button={true} className={isActive(item) ? 'active' : 'nonactive'} key={index}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        )
    }
  }

  // const openApp = () => { if(window.location.endsWith('help')) window.open(window.location)
  // const openHelp = () => window.open(window.location + 'help')

  const getTopBarComponent = (itemName, index) => {
    const item = availableViews[itemName]
    const className = index === 0 ? 'topmenuitem topmenuitemleft' : 'topmenuitem'
    switch (itemName) {
      case 'notifications':
        return (
          <Link to={item.target} className={className}  target={item.newtab ? "_blank" : undefined} key={index }>
            <NotificationsMenuItem item={item} webId={props.webId} index={index} key={'topmenuitem' + index}/>
          </Link>
        )
      default:
        return (
          <Link to={item.target} className={className}  target={item.newtab ? "_blank" : undefined} key={index }>
            <MenuItem key={index}>
              <IconButton aria-label={item.label} style={{color: "white"}}>
                  {item.icon}
              </IconButton>
            </MenuItem>
          </Link>
        )
    }
  }

  const sideBarItems = props.sideBarItems || []
  const sidebarComponents = sideBarItems.map((e, index) => getSidebarComponent(e, index))

  const topBarItems = props.topBarItems || []
  const topbarComponents = topBarItems.map((e, index) => getTopBarComponent(e, index))

  const handleDrawerOpen = () => setOpen(true);

  const handleDrawerClose = () => setOpen(false);

  drawerWidth = sidebarComponents.length ? drawerWidth : 0;

  const classes = useStyles();
  const theme = useTheme();

  // <Navbar.Brand href="https://solidproject.org/">
  //   <img
  //     alt=""
  //     width='50px'
  //     src={solidlogo}
  //   />{' '}
  // </Navbar.Brand>

  // <Navbar.Brand href="https://www.ugent.be/ea/idlab/en">
  //   <img
  //     alt=""
  //     src={idlablogo}
  //     height="40px"
  //   />{' '}
  // </Navbar.Brand>
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>

          <Link to="/" target="_blank">
            <Typography variant="h6" style={{color: "white"}} noWrap>
              Mellon
            </Typography>
          </Link>

          {topbarComponents}
          {props.hidelogout 
            ? <div />
            : <MenuItem className='topmenuitem'>
                <LogoutButton className="logoutButton"/>
              </MenuItem>}

        </Toolbar>
      </AppBar>
      {sidebarComponents.length
      ?
        <Drawer
          variant="permanent"
          className={`${clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })} sidebar`}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
        >
          <Toolbar className={`${classes.toolbar} toolbarcolor`}>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon style={{fill: "white"}}/> : <ChevronLeftIcon style={{fill: "white"}}/>}
            </IconButton>
          </Toolbar>
          <Divider />
          <div className='sidebarcontent'>
            <List>
              {sidebarComponents}
            </List>
          </div>
        </Drawer>
      : <div />}
      
      <main className={classes.content}>
        <Toolbar />
          <LoggedOut>
            <Switch>
              <Route exact path={'/login'} key={availableViews.login.id} component={withContent(availableViews.login)} />
              <Redirect to="/login" />
            </Switch>
          </LoggedOut>
          <LoggedIn>
            {getAvailableRoutes()}
          </LoggedIn>
      </main>
    </div>
  );
})

export default NavBarWrapper

const NotificationsMenuItem = (props) => {
  const item = availableViews.notifications;
  const notifications = useNotifications(props.webId)
  return (
    <MenuItem className={props.className} key={props.index}>
      <IconButton aria-label={item.label} color="inherit" style={{color: 'white'}} >
          <Badge badgeContent={notifications.length} color="secondary">
            {item.icon}
          </Badge>
      </IconButton>
    </MenuItem>
  )
}