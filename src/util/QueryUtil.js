import { DataFactory, Writer, Quad } from "n3";
import ns from "../util/NameSpaces"

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

  const deleteClauseString = deleteClause.length ? `DELETE { ${await quadListToTTL(deleteClause)} }` : ''
  const insertClauseString = insertClause.length ? `INSERT { ${await quadListToTTL(insertClause)} }` : ''
  const whereClauseString = deleteClause.length ? `WHERE { ${await quadListToTTL(deleteClause)} }` : ''


  return(`
    ${deleteClauseString}
    ${insertClauseString}
    ${whereClauseString}
  `)
}


export async function quadListToTTL(quadList) { 
  return new Promise((resolve, reject) => {
    const writer = new Writer();
    writer.addQuads(quadList)
    writer.end((error, result) => {
      if (error || !result) reject(error || "Could not generate ttl file from quads")
      resolve(result)
    });
  })
}