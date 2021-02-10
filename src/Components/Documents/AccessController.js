import React, { useEffect, useState } from 'react'
import AccessControlTable from './AccessControlTable'
// import "./AccessController.css"
import { fetchProfile } from '../../util/MellonUtils/profile';
import { getPermissions, MODES, reCreateACL } from '../../util/PermissionManager';
import { getDocumentMetadataId } from '../../util/MellonUtils/documents';

const SUBMISSIONTIMEOUT = 3500

const AccessController = (props) => {

	const [state, setstate] = useState({
		contacts: [],
		permissions: [], 
		commentPermissions: [],
		tableData: []
	})

	const [submissionMessage, setSubmissionMessage] = useState(false)

	useEffect(() => {
		let mounted = true;
		if(!props.webId || !props.documentId) return;
		fetchData(props.documentId).then(newState => {
			if (mounted) setstate(newState)
		})
		return () => {
			mounted = false;
		}
	}, [props.webId, props.documentId])



	const fetchData = async () => {
		const profile = await fetchProfile(props.webId) || null
		let contacts = (profile && profile.contacts) || [];
		const newState = {...state}
		try {
			newState.permissions = await getPermissions(props.webId, props.documentId);
		} catch {}
		try {
			newState.commentPermissions = await getPermissions(props.webId, await getDocumentMetadataId(props.webId, props.documentId));
		} catch {}
		newState.tableData = createTableData(newState.permissions, newState.commentPermissions, contacts);
		return newState
	}

  const createTableData = (permissions, commentPermissions, contacts) => {
		contacts = contacts || []
		let tableData = []
		let agentIndexes = {}
		let newRow = {
			read: false,
			write: false,
			comment: false,
			control: false
		}

		function processPermission(permission) {
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
    	for (let permission of permissions) {
			processPermission(permission)
		}
		// comment permissions
		for (let permission of commentPermissions) {
			if (permission.modes.includes(MODES.APPEND) || permission.modes.includes(MODES.WRITE)) {
				permission.modes = [MODES.COMMENT];
				processPermission(permission);
			}
		}
		// Contacs that don't have permission should also be displayed
		for (let contact of contacts) {
			if (agentIndexes[contact] === undefined) {
				agentIndexes[contact] = tableData.length;
				tableData.push({
					...newRow,
					agent: contact
				});
			}
		}
    	return tableData;
	}

	// // TODO: check valid webId's, groups, weird permissions (only write, owner no control, ...)
	const submitValues = async (data) => {
		console.log('submitValues', data)
		let permissions = [];
		// Comment is APPEND permission on metafile.
		let commentPermissions = [];

		function addPermission(permissions, agent, modes) {
			if (!modes.length) { return permissions; }
			modes.sort()
			// Always add new if the mode is for everyone
			if (agent === null) {
				permissions.push({ agents: null, modes: modes});
				return permissions;
			}
			for (let permission of permissions) {
				// Assumes permission.modes is sorted
				if (permission.modes.join('') === modes.join('') && permission.agents !== null) {
					permission.agents.push(agent);
					return permissions;
				}
			}
			// Mode does not yet exist
			permissions.push({ agents: [agent], modes: modes });
			return permissions;
		}

		for (let row of state.tableData) {  // 'row' is like { agent: 'bob', read: true, write: false ... }
			if (row.comment) {
				commentPermissions = addPermission(commentPermissions, row.agent, [MODES.APPEND]);  // comment is APPEND on metadata file
			}
			let modes = [];
			for (let [mode, access] of [[MODES.READ, row.read], [MODES.WRITE, row.write], [MODES.CONTROL, row.control]]) {
				if (access) { modes.push(mode); }
			}
			permissions = addPermission(permissions, row.agent, modes);
		}
		// webId, docURI, permissions
		console.log('permissions', permissions, commentPermissions)
		const recreateAcl = await reCreateACL(props.webId, props.documentId, permissions);
		const recreateMetadataAcl = await reCreateACL(props.webId, await getDocumentMetadataId(props.webId, props.documentId), commentPermissions);

		// Set submission message
		setSubmissionMessage(true)
		setTimeout(() => setSubmissionMessage(false), SUBMISSIONTIMEOUT)
	}

	return (
		<>
			<p>Permissions for this file</p>
			<AccessControlTable tableData={state.tableData} submitValues={submitValues} />
			{submissionMessage && <p>The submission was successfull</p>}
		</>
	);


}

export default AccessController