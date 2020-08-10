import React from 'react'

import { MODES } from '../util/PermissionManager'

import "./AccessController.css"

export class AccessController extends React.Component {

  constructor(props) {
		super(props)

		this.cm = props.cm;
		let documentURI = Object.keys(props.selection)[0];

		let contacts = [];
		let permissions = [];

    this.state = {
			documentURI,
      contacts,
      permissions,
			agentsToPermissions: {},
			notifications: new Set()  // notification to all contacts
		};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
	}

	// fetch data after creation
	async componentDidMount() {
		let contacts = await this.cm.getContacts();
		let permissions = await this.cm.pm.getPermissions(this.state.documentURI);

		this.setState({
			contacts,
			permissions,
			agentsToPermissions: this.calculateAgentsToPermissions(permissions, contacts),
			notifications: new Set(contacts)
		});
	}

	async componentDidUpdate(prevProps) {
		// Re-fetch if other document was selected
		let documentURI = Object.keys(this.props.selection)[0];
		if (Object.keys(prevProps.selection)[0] !== documentURI) {
			let contacts = await this.cm.getContacts();
			let permissions = await this.cm.pm.getPermissions(documentURI);

			this.setState({
				documentURI,
				contacts,
				permissions,
				agentsToPermissions: this.calculateAgentsToPermissions(permissions, contacts),
				notifications: new Set(contacts)
			});
		}
	}

  calculateAgentsToPermissions(permissions, contacts) {
    var agentsToPermissions = {};
    for (let permission of permissions) {
			if (permission.agents === null) {
				permission.agents = [null];
			}
			for (let agent of permission.agents) {
				if (!agentsToPermissions[agent]) {
					// Set because you can have a permission only once
					agentsToPermissions[agent] = new Set();
				}
				for (let mode of permission.modes) {
					agentsToPermissions[agent].add(mode);
				}
			}
    }
    // Contacs that don't have permission should also be displayed
    for (let contact of contacts) {
      if (!agentsToPermissions[contact]) {
        agentsToPermissions[contact] = new Set();
      }
    }
    return agentsToPermissions;
	}

	handleChange(event) {
		let isChecked = event.target.checked;
		// value is in the form of "agentURI mode"
		let value = event.target.value.split(" ");
		let mode = value.pop();
		let agent = value.join(' ');
		this.setState(oldState => {
				if (isChecked) {
					oldState.agentsToPermissions[agent].add(mode);
				} else {
					oldState.agentsToPermissions[agent].delete(mode);
				}
				return oldState;
		})
	}

	// TODO: still buggy
	handleSubmit(event) {
		event.preventDefault();
		let permissions = []
		Object.keys(this.state.agentsToPermissions)
			.map(([agent, modes]) => {
				permissions.push({
					agents: [agent],
					modes: permissions
				});
			});
		this.cm.pm.reCreateAcl(this.state.documentURI, permissions);
	}

  render() {
    let list = Object.entries(this.state.agentsToPermissions)
      .map(([agent, permissions]) => (
				<tr>
					<td><input type="text" value={agent === "null" ? "Everyone" : agent} readOnly /></td>
					<td><input type="checkbox" onChange={this.handleChange}
						value={`${agent} ${MODES.READ}`}
						defaultChecked={permissions.has(MODES.READ)} /></td>
					<td><input type="checkbox" onChange={this.handleChange}
						value={`${agent} ${MODES.WRITE}`}
						defaultChecked={permissions.has(MODES.WRITE)} /></td>
					<td><input type="checkbox" onChange={this.handleChange}
						value={`${agent} ${MODES.COMMENT}`}
						defaultChecked={permissions.has(MODES.COMMENT)} /></td>
					<td><input type="checkbox" onChange={this.handleChange}
						value={`${agent} ${MODES.CONTROL}`}
						defaultChecked={permissions.has(MODES.CONTROL)} /></td>
				</tr>
        )
      );

    return (
      <form>
        <p>Permissions for this file</p>
        <table className="access-control-table">
					<tr>
						<th>Person</th>
						<th>Read</th>
						<th>Write</th>
						<th>Comment</th>
						<th>Control</th>
					</tr>
          {list}
        </table>
				<input type="submit" value="Save permissions" />
      </form>
    )
  }
}