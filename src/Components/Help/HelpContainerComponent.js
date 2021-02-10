import React, { useState, useEffect } from 'react'
import NavBarWrapper from '../NavBarWrapper'

export default function HelpContainerComponent() {

  useEffect(() => {
    document.title = "Mellon - Help";
  }, []);

  return (
    <div>
    <h1>{`${window.location}`}</h1>
    <NavBarWrapper defaultview='help' sideBarItems={[]} topBarItems={[]} hidelogout={true}></NavBarWrapper>
    </div>
    
  )
}