import { DataFactory, Writer, Quad } from "n3";
import ns from "../util/NameSpaces"
import * as f from "@dexagod/rdf-retrieval"

const { namedNode, literal, quad, variable } = DataFactory;

export async function createDeleteInsertProfileDataQuery(webId, oldprofile, newprofile) {
  const deleteClause = []
  // const insertClause = []
  
  const insertClause = [
    quad(namedNode(webId), namedNode(ns.foaf('name')), literal(newprofile.name)),
    quad(namedNode(webId), namedNode(ns.dbo('birthDate')), literal(newprofile.bdate, namedNode(ns.xsd('date')))),
    quad(namedNode(webId), namedNode(ns.dbo('location')), literal(newprofile.location)),
    // quad(namedNode(webId), namedNode(ns.demo('civilstatus')), literal(newprofile.cstatus)),
  ]

  if (oldprofile.name) {
    deleteClause.push(quad(namedNode(webId), namedNode(ns.foaf('name')), literal(oldprofile.name)))
  } if (oldprofile.bdate) {
    deleteClause.push(quad(namedNode(webId), namedNode(ns.dbo('birthDate')), literal(oldprofile.bdate, namedNode(ns.xsd('date')))))
  } if (oldprofile.location) {
    deleteClause.push(quad(namedNode(webId), namedNode(ns.dbo('location')), literal(oldprofile.location)))
  // } if (oldprofile.cstatus) {
  //   deleteClause.push(quad(namedNode(webId), namedNode(ns.demo('civilstatus')), literal(oldprofile.cstatus)))
  }

  const deleteClauseString = deleteClause.length ? `DELETE { ${await f.quadArrayToString(deleteClause, "text/turtle")} }` : ''
  const insertClauseString = insertClause.length ? `INSERT { ${await  f.quadArrayToString(insertClause, "text/turtle")} }` : ''
  const whereClauseString = deleteClause.length ? `WHERE { ${await  f.quadArrayToString(deleteClause, "text/turtle")} }` : ''


  return(`
    ${deleteClauseString}
    ${insertClauseString}
    ${whereClauseString}
  `)
}