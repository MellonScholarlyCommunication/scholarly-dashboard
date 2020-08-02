// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileClient = require("solid-file-client");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const irc = require('@inrupt/solid-react-components');

const ORIGIN = "http://localhost:8080";
const DEFAULT_ACCEPT = "application/ld+json;q=0.9,text/turtle;q=0.8";

export class FileUtil {
  fc: any;
  auth: any;
  constructor(auth: any) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.fc = new FileClient(auth);
    this.auth = auth;
  }

  async getFile(fileURL: string) {
    const data = await this.auth.fetch(fileURL, {
      method: "GET",
      headers: {
        Accept: DEFAULT_ACCEPT,
        Origin: ORIGIN
      }
    });
    return await data.text();
  }

  async patchFile(fileURL: string, content: string) {
    return await this.auth.fetch(fileURL, {
      method: "PATCH",
      headers: {
        Origin: ORIGIN,
        "Content-Type": "application/sparql-update"
      },
      body: content
    });
  }

  // Post file from string
  async postFile(fileURL: string, content: string, contentType: string) {
    const session = await this.auth.currentSession()
    if(!session) {throw new Error("no session")}
    const webId = session.webId;
    if(!webId) {throw new Error("no webId")}
    const post = await this.fc.postFile(fileURL, content, contentType);
    // const permissions = [
    //   {
    //     agents: null,
    //     modes: [irc.AccessControlList.MODES.READ, irc.AccessControlList.MODES.APPEND]
    //   }
    // ];
    // console.log("CREATING ACL FILE", webId, fileURL)
    // const ACLFile = new irc.AccessControlList(webId, fileURL);
    // await ACLFile.createACL(permissions);

    return post;
  }

  async postAndPatchFile(fileURL: string, content: string){
    const post = await this.postFile(fileURL, content, "text/turtle")
    return post
  }

  // Post file from file
  async uploadFile(file: File, remoteFilePath: string) {
    return await this.fc.putFile(remoteFilePath, file, file.type);
  }

  async fileExists(fileURL: string) {
    return this.fc.itemExists(fileURL);
  }
}
