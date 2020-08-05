const irc = require('@inrupt/solid-react-components');

export default class PermissionManager{
  auth: any;

  constructor(auth: any) {
    this.auth = auth;
  }

  /**
   * Set permission to read for certain people
   * @param docURI The document URI on which the permissions apply
   * @param people A list of webID's, null for everyone
   */
  async setRead(docURI: string, people: string[] | null = null) {
    const permissions = [
      {
        agents: people,  // if null: everyone
        modes: [irc.AccessControlList.MODES.READ]
      }
    ];
    console.log(`Setting READ access for ${people === null ? "everyone" : people} on`, docURI);
    await this.createACL(docURI, permissions);
  }

  /**
   * Set given permissions on a document
   * @param docURI The document URI on which the permissions apply
   * @param permissions The permissions, in the format specified by solid-react-components
   */
  async createACL(docURI: string, permissions: object[]) {
    let session = await this.auth.currentSession();
    if (!(session && session.webId)) {
      throw new Error("No valid session or webId");
    }
    const webId = session.webId;
    const ACL = new irc.AccessControlList(
      webId,
      docURI,
      docURI + '.acl'
    );
    await ACL.createACL(permissions);
  }
}