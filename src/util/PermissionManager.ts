const irc = require('@inrupt/solid-react-components');
// Use the Read, Write, Append and Control modes from solid-react-components
const MODES = irc.AccessControlList.MODES
export { MODES }; // MODES.READ, MODES.WRITE, MODES.APPEND, MODES.CONTROL

/**
 * Create a permission-object, to pass to createACL or addToACL
 * @param modes A list of modes,
 * @param people A list of webID's, null for everyone
 */
export function createPermission(modes: object[], people: string[] | null = null): object {
  return {
    agents: people,
    modes: modes
  };
}

export class PermissionManager{
  auth: any;

  constructor(auth: any) {
    this.auth = auth;
  }

  async checkSession() {
    let session = await this.auth.currentSession();
    if (!(session && session.webId)) {
      throw new Error("No valid session or webId");
    }
    return session.webId;
  }

  /**
   * Create an ACL file for a document
   *    default permissions for creator: Read, Write, Control
   * @param docURI The document URI on which the permissions apply
   * @param permissions Permissions, like created by `createPermission`
   */
  async createACL(docURI: string, permissions: object[]) {
    const webId = this.checkSession();
    const ACL = new irc.AccessControlList(
      webId,
      docURI,
      docURI + '.acl'
    );
    await ACL.createACL(permissions);
  }

  /**
   * Dalete the ACL file for a document, then make a new one
   *    default permissions for creator: Read, Write, Control
   * @param docURI The document URI on which the permissions apply
   * @param permissions Permissions, like created by `createPermission`
   */
  async reCreateACL(docURI: string, permissions: object[]) {
    const webId = this.checkSession();
    const ACL = new irc.AccessControlList(
      webId,
      docURI,
      docURI + '.acl'
    );
    await ACL.deleteACL();
    await ACL.createACL(permissions);
  }

  /**
   * Adds given permissions to the ACL file for a document
   * @param docURI The document URI on which the permissions apply
   * @param permissions Permissions, like created by `createPermission`
   */
  async addToACL(docURI: string, permissions: object[]) {
    const webId = this.checkSession();
    const ACL = new irc.AccessControlList(
      webId,
      docURI,
      docURI + '.acl'
    );
    await ACL.assignPermissions(permissions);
  }

  async getPermissions(docURI: string) {
    const webId = this.checkSession();
    const ACL = new irc.AccessControlList(
      webId,
      docURI,
      docURI + '.acl'
    );
    return ACL.getPermissions();
  }
}