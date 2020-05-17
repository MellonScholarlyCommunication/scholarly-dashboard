import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavbarComponent from './components/NavbarComponent'
import CommentsSidebar from './components/CommentsSidebar';
import MainContent from './components/MainContent';
import NotificationsSideBar from 'components/NotificationsSideBar';
import CommunicationManager from 'util/CommunicationManager';
import solid from 'solid-auth-client'

export default class APP extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      selection: [],
    };
    this.cm = new CommunicationManager(solid)
    this.handleSelection = this.handleSelection.bind(this);
  }

  handleSelection(newSelection) {
    console.log("selected", "old", this.state.selection, "new", newSelection)
    this.setState({selection: newSelection})
  }

  getSidebar(){
    if(Object.keys(this.state.selection).length === 0)
      return <NotificationsSideBar selection={this.state.selection} cm={this.cm}/>
    return <CommentsSidebar selection={this.state.selection} cm={this.cm}/>
  }

  render(){
    return (
      <div className="App">
          <NavbarComponent className="navbar" cm={this.cm}/>
          <div className="contentcontainer row">
            <div className="maincontentcontainer col-md-8">
              <MainContent handleSelection={this.handleSelection} cm={this.cm}/>
            </div>
            <div className="sidebarcontainer col-md-4">
              { this.getSidebar() }
            </div>
          </div>
      </div>
    );
  }
}
