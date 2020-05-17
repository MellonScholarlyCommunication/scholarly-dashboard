// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileClient = require("solid-file-client");
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
    console.log("Patching file", fileURL, content);
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
    console.log("Posting file", fileURL, content);
    return await this.fc.postFile(fileURL, content, contentType);
  }

  async postAndPatchFile(fileURL: string, content: string){
    const post = await this.postFile(fileURL, content, "text/turtle")
    console.log("postResult", post)
    return post
    // const patch = await this.patchFile(fileURL, content)
    // console.log("patchresult", patch)
    // return Promise.all([post, patch])
  }

  // Post file from file
  async uploadFile(file: File, remoteFilePath: string) {
    return await this.fc.putFile(remoteFilePath, file, file.type);
  }

  async fileExists(fileURL: string) {
    return this.fc.itemExists(fileURL);
  }
}
