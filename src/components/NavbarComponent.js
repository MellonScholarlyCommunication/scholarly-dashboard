import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar'
import { AuthButton, LoggedIn, Value } from '@solid/react';
import { withAuthorization, Name,  } from '@inrupt/solid-react-components';
import "./NavbarComponent.css"



const NavbarComponent = (props) => {
  return (
    <Navbar className="navbar" bg="light">
      <Navbar.Brand href="#home">Mellon</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <LoggedIn >
            <Navbar.Text className="welcomeText">
              Welcome <Value src="user.name"/>
            </Navbar.Text> 
        </LoggedIn>
        <AuthButton className="authButton" popup="https://solid.community/common/popup.html" login="Login" logout="Logout"/>
      </Navbar.Collapse>
    </Navbar>  
  );
}
export default NavbarComponent;
