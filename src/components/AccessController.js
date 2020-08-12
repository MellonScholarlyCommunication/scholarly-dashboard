import React from 'react'
import solid from 'solid-auth-client'

import CommunicationManager from 'util/CommunicationManager';
import AccessControlTable from './AccessControlTable'
import { MODES } from '../util/PermissionManager'

import "./AccessController.css"

export class AccessController extends React.Component {

  constructor(props) {
		super(props);

		this.cm = props.cm || new CommunicationManager(solid);
		let documentURI = Object.keys(props.selection)[0];
		let contacts = [];
		let permissions = [];

    this.state = {
			documentURI,
      contacts,
      permissions,
			tableData: [],
			key: 0
		};
	}

	// fetch data after creation
	async componentDidMount() {
		this.fetchData(this.state.documentURI)
	}

	async componentDidUpdate(prevProps) {
		// Re-fetch if other document was selected
		let documentURI = Object.keys(this.props.selection)[0];
		if (Object.keys(prevProps.selection)[0] !== documentURI) {
			this.fetchData(documentURI)
		}
	}

	async fetchData(documentURI) {
		let contacts = await this.cm.getContacts();
		let permissions = await this.cm.pm.getPermissions(documentURI);
		let tableData = this.createTableData(permissions, contacts);

		this.setState(state => {
			return {
				documentURI,
				contacts,
				permissions,
				tableData,
				key: state.key+1
			}
		});
	}

  createTableData(permissions, contacts) {
		let tableData = []
		let agentIndexes = {}
		let newRow = {
			read: false,
			write: false,
			comment: false,
			control: false
		}
    for (let permission of permissions) {
			if (permission.agents === null) {
				permission.agents = [null];
			}
			for (let agent of permission.agents) {
				let index = agentIndexes[agent];
				if (index === undefined) {
					index = tableData.length;
					agentIndexes[agent] = index
					// Set because you can have a permission only once
					tableData.push({
						...newRow,
						agent
					});
				}
				for (let mode of permission.modes) {
					tableData[index][mode.toLowerCase()] = true;
				}
			}
    }
    // Contacs that don't have permission should also be displayed
    for (let contact of contacts) {
			if (agentIndexes[contact] === undefined) {
				agentIndexes[contact] = tableData.length;
				tableData.push({
					...newRow,
					contact
				});
		  }
		}
    return tableData;
	}

	submitValues(rows) {
		let permissions = [];
		// Comment is APPEND permission on metafile.
		let commentPermissions = [{ agents: [], modes: [MODES.APPEND] }];
		for (let row of rows) {
			let values = row.values;  // like { agent: 'bob', read: true, write: false ... }
			let agent = values.agent;
			if (values.comment) {
				if (agent === null) {  // Special case for Everyone
					commentPermissions.push({ agents: null, modes: [MODES.APPEND]});
				} else {
					commentPermissions[0].agents.push(agent);  // Add this agent to the APPEND mode
				}
			}
			let modes = [];
			for (let [mode, access] of [[MODES.READ, values.read], [MODES.WRITE, values.write], [MODES.CONTROL, values.control]]) {
				if (access) { modes.push(mode) };
			}
			modes.sort()
			let assigned = false;
			if (agent === null) {  // Special case for Everyone
				permissions.push({ agents: null, modes: modes });
				return;
			}
			// If the same combination of modes already exists, add agent to that
			for (let permission of permissions) {
				if (permission.modes.join('') === modes.join('') && permission.agents !== null) {
					permission.agents.push(agent);
					assigned = true;
				}
			}
			if (!assigned) {
				permissions.push({
					agents: [agent],
					modes: modes
				});
			}
		}
		console.log(permissions)
		console.log(commentPermissions)
		// this.cm.pm.reCreateACL(this.state.documentURI, permissions);
		// this.cm.pm.reCreateACL(this.cm.getMetadataURI(this.state.documentURI), commentPermissions);
	}

	render() {
    return (
			<>
        <p>Permissions for this file</p>
				{<AccessControlTable tableData={this.state.tableData} setTableData={tableData =>
					{ console.log(tableData)
						this.setState({ tableData }) }
						} />}
      </>
    );
  }
}