const irc = require('@inrupt/solid-react-components');
// Use the Read, Write, Append and Control modes from solid-react-components
const MODES = irc.AccessControlList.MODES
MODES.COMMENT = "Comment"
export { MODES }; // MODES.READ, MODES.WRITE, MODES.APPEND, MODES.CONTROL

/**
 * Create a permission-object, to pass to createACL or addToACL
 * @param object[]: modes A list of modes,
 * @param string[] | null: people A list of webID's, null for everyone
 * @returns object
 */
const createPermission = (modes, people = null) => {
  return {
    agents: people,
    modes: modes
  };
}

/**
 * Create an ACL file for a document
 *    default permissions for creator: Read, Write, Control
 * @param docURI The document URI on which the permissions apply
 * @param permissions Permissions, like created by `createPermission`
 */
const createACL = async (webId, docURI, permissions) => {
  const ACL = new irc.AccessControlList(
    webId,
    docURI,
    docURI + '.acl'
  );
  console.log(permissions)
  await ACL.createACL(permissions);
}

/**
 * Dalete the ACL file for a document, then make a new one
 *    default permissions for creator: Read, Write, Control
 * @param string: docURI The document URI on which the permissions apply
 * @param object[]: permissions Permissions, like created by `createPermission`
 */
const reCreateACL = async (webId, docURI, permissions) => {
  const ACL = new irc.AccessControlList(
    webId,
    docURI,
    docURI + '.acl'
  );
  // If the file inherits it's ACL from a parent container, this will generate a 404
  // Aside from the error in the console, this is wanted behaviour though
  await ACL.deleteACL();
  await ACL.createACL(permissions);
}

/**
 * Adds given permissions to the ACL file for a document
 * @param string: docURI The document URI on which the permissions apply
 * @param object[]: permissions Permissions, like created by `createPermission`
 */
const addToACL = async (webId, docURI, permissions) => {
  const ACL = new irc.AccessControlList(
    webId,
    docURI,
    docURI + '.acl'
  );
  await ACL.assignPermissions(permissions);
}

/**
 * 
 * @param {string} docURI 
 */
const deleteACL = async (webId, docURI) => {
  const ACL = new irc.AccessControlList(
    webId,
    docURI,
    docURI + '.acl'
  );
  await ACL.deleteACL();
}

/**
 * 
 * @param {string} docURI 
 */
const getPermissions = async (webId, docURI) => {
  const ACL = new irc.AccessControlList(
    webId,
    docURI,
    docURI + '.acl'
  );
  return ACL.getPermissions();
}


export { createPermission, createACL, reCreateACL, addToACL, deleteACL, getPermissions }