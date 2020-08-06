import React from 'react'
import { createPermission, MODES } from '../util/PermissionManager'

export class GivePermission extends React.Component {

  constructor(props) {
    super(props);

    this.cm = props.cm;
    this.state = {
        // Might also want to save props.selection in the future
        value: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    try {
      this.cm.pm.addToACL(
        Object.keys(this.props.selection)[0], // document URI
        [createPermission(
            [MODES.READ],
            [this.state.value]
        )]
      );
    } catch (e) {
      console.log(e);
      alert(`Failed to add "${this.state.value}" as reader to your document.`);
    }
    alert(`Added ${this.state.value} as reader to your document!`);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
            Give someone access to read your paper:
            <input type="text" value={this.state.value}
              onChange={this.handleChange} placeholder="https://alice.example.com/profile/card#me"/>
        </label>
        <input type="submit" value="Add" />
      </form>
    );
  }
}