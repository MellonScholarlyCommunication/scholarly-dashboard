// eslint-disable-next-line  @typescript-eslint/no-var-requires
const $rdf = require('rdflib')
// eslint-disable-next-line  @typescript-eslint/no-var-requires
const aclCheck = require("@solid/acl-check")
const ACL = $rdf.Namespace('http://www.w3.org/ns/auth/acl#')

const kb = $rdf.graph()
const fetcher = $rdf.fetcher(kb)

const origin = "https://localhost:8080"
const trustedOrigins = ["https://localhost:8080"]

export default class PermissionManager {

  async getPermissions(doc: string, docACL: string, dir: string, dirACL: string, userWebId: string) {

    let modesRequired = [ ACL('Read'), ACL('Write'), ACL('Control') ]
  
    await fetcher.load(docACL) // Load the ACL documents into kb
    
    let allow = await aclCheck.checkAccess(kb, doc, dir, docACL, userWebId, modesRequired, origin, trustedOrigins)
    
    // When there is no direct ACL file, find the closest container ACL file in the tree above then...
    await fetcher.load(dirACL) // Load the directory ACL documents into kb
    let allowDir = await aclCheck.checkAccess(kb, doc, dir, dirACL, userWebId, modesRequired, origin, trustedOrigins)
    
    console.log('Access allowed? ' , allow, allowDir)
    // OWTTE
  }

}