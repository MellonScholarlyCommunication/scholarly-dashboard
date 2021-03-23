import React, { useEffect } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { LoggedIn, LoggedOut } from '@solid/react'
import NavBarWrapper from './Components/NavBarWrapper'
function App () {


  const loginviewcomponents = {
    defaultview:'login',
    sideBarItems:['login', 'help'],
    topBarItems:['help'],
    hidelogout: true,
  }

  const mainviewcomponents = {
    defaultView: 'profile',
    sideBarItems: ['divider', 'profile', 'divider', 'documents', 'divider', 'feed', 'divider', 'contacts', 'divider', 'listsub', 'divider', 'br', 'divider', 'upload', 'divider'],
    topBarItems: ['notifications', 'help'],
    hidelogout: false,
  }

  useEffect(() => {
    document.title = "Mellon";
  }, []);


  return (
    <div className="App">
      <LoggedIn>
        <NavBarWrapper defaultview={mainviewcomponents.defaultview} 
                        sideBarItems={mainviewcomponents.sideBarItems} 
                        topBarItems={mainviewcomponents.topBarItems} 
                        hidelogout={mainviewcomponents.hidelogout} />
      </LoggedIn>
      <LoggedOut>
        <NavBarWrapper defaultview={loginviewcomponents.defaultview} 
                        sideBarItems={loginviewcomponents.sideBarItems} 
                        topBarItems={loginviewcomponents.topBarItems} 
                        hidelogout={loginviewcomponents.hidelogout} />
      </LoggedOut>
    </div>
  )
}

export default App
