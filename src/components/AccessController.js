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
			permissionsChanged: false,
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
			notifications: new Set(contacts),
			permissionsChanged: false
		});
	}

	async componentDidUpdate(prevProps) {
		// Re-fetch if other document was selected
		let documentURI = Object.keys(this.props.selection)[0];
		if (Object.keys(prevProps.selection)[0] !== documentURI) {
			let contacts = await this.cm.getContacts();
			let permissions = await this.cm.pm.getPermissions(documentURI);
			console.log(permissions)
			console.log(documentURI)

			this.setState({
				documentURI,
				contacts,
				permissions,
				agentsToPermissions: this.calculateAgentsToPermissions(permissions, contacts),
				notifications: new Set(contacts),
				permissionsChanged: false
			}, () => { console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"); console.dir(this.state) });
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
		this.setState(state => {
			if (isChecked) {
				state.agentsToPermissions[agent].add(mode);
			} else {
				state.agentsToPermissions[agent].delete(mode);
			}
			state.permissionsChanged = true;
			return state;
		})
	}

	handleSubmit(event) {
		event.preventDefault();
		if (!this.state.permissionsChanged) {
			return;
		}
		let permissions = [];
		// Comment is APPEND permission on metafile.
		let commentPermissions = [{ agents: [], modes: [MODES.APPEND] }];
		Object.entries(this.state.agentsToPermissions)
			.map(([agent, modes]) => {
				if (modes.delete(MODES.COMMENT)) {
					if (agent === "null") {  // Special case for Everyone
						commentPermissions.push({ agents: null, modes: [MODES.APPEND]});
					} else {
						commentPermissions[0].agents.push(agent)  // Add this agent to the APPEND mode
					}
				}
				// If there is something checked
				if (modes.size) {
					modes = [...modes].sort();
					let assigned = false;
					if (agent === "null") {  // Special case for Everyone
						permissions.push({ agents: null, modes: modes});
						return;
					}
					for (let permission of permissions) {
						if (permission.modes.join('') === modes.join('') && permission.agents !== null) {
							permission.agents.push(agent);
							assigned = true;
						}
					}
					if (!assigned) {
						permissions.push({
							agents: [agent],
							modes: [...modes].sort()
						});
					}
				}
			});
		if (!permissions) {
			this.cm.pm.deleteACL(this.state.documentURI);
			alert("No one is assigned permission, but you will still have it.");
		} else {
			this.cm.pm.reCreateACL(this.state.documentURI, permissions);
		}
		if (commentPermissions.length === 1 && !commentPermissions[0].agents.length) {  // Complicated check because list is initialized with object
			// This might delete too much
			this.cm.pm.deleteACL(this.cm.getMetadataURI(this.state.documentURI));
			alert("Changing the 'comment' permission deletes the whole ACL file for the metadata file");
		} else {
			this.cm.pm.reCreateACL(this.cm.getMetadataURI(this.state.documentURI), commentPermissions);
			alert("Changing the 'comment' permission deletes the whole ACL file for the metadata file");
		}
		this.setState({ permissionsChanged: false })
	}

  render() {
		console.log(Object.entries(this.state.agentsToPermissions))
    let tableData = Object.entries(this.state.agentsToPermissions)
      .map(([agent, permissions]) => (
				<tr key={agent}>
					<td><input type="text" value={agent === "null" ? "Everyone" : agent} readOnly /></td>
					<td><input type="checkbox" onChange={this.handleChange}
						value={`${agent} ${MODES.READ}`}
						checked={permissions.has(MODES.READ)} /></td>
					<td><input type="checkbox" onChange={this.handleChange}
						value={`${agent} ${MODES.WRITE}`}
						checked={permissions.has(MODES.WRITE)} /></td>
					<td><input type="checkbox" onChange={this.handleChange}
						value={`${agent} ${MODES.COMMENT}`}
						checked={permissions.has(MODES.COMMENT)} /></td>
					<td><input type="checkbox" onChange={this.handleChange}
						value={`${agent} ${MODES.CONTROL}`}
						checked={permissions.has(MODES.CONTROL)} /></td>
				</tr>
        )
      );

    return (
      <form onSubmit={this.handleSubmit}>
        <p>Permissions for this file</p>
        <table className="access-control-table">
					<thead>
						<tr>
							<th>Person</th>
							<th>Read</th>
							<th>Write</th>
							<th>Comment</th>
							<th>Control</th>
						</tr>
					</thead>
					<tbody>
          	{tableData}
					</tbody>
        </table>
				<input type="submit" value="Save permissions" disabled={!this.state.permissionsChanged} />
      </form>
    )
  }
}