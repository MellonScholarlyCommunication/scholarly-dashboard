import MetadataFileGenerator from "./MetadataFileGenerator";
import { FileUtil } from "./FileUtil";
import * as N3 from "n3"
import { PermissionManager, createPermission, MODES } from "./PermissionManager";
import SelectInput from "@material-ui/core/Select/SelectInput";

const FOAF = "http://xmlns.com/foaf/0.1/";
const DCTERMS = "http://purl.org/dc/terms/";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const TREE = "https://w3id.org/tree#";
const HYDRA = "http://www.w3.org/ns/hydra/core#";
const RESEARCH_PAPER_CLASS = "http://example.com/ResearchPaper";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const SIOC = "http://rdfs.org/sioc/ns#"
const AS = "https://www.w3.org/ns/activitystreams#"


const DEFAULTPAPERSDIRECTORY = "papers/";
const PAPERSCOLLECTIONFILE = "papers_collectionview.ttl";
const PARERSCOLLECTIONNAME = "researchPaperCollection";

const DEFAULTCOMMENTSDIRECTORY = "comments/";

export default class CommunicationManager {
  fu: FileUtil;
  auth: any;
  pm: PermissionManager;
  constructor(auth: any) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.fu = new FileUtil(auth);
    this.auth = auth;
    this.pm = new PermissionManager(auth)
  }

  async loadProfile(
    webidprofile: string
  ): Promise<N3.Store | null> {
    if (!webidprofile) return null;
    return await this.getDataStore(
      await this.fu.getFile(webidprofile),
      this.getCleanedIRI(webidprofile)
    );
  }

  async getDataStoreFromFile(
    fileURI: string
  ): Promise<N3.Store> {
    const store = await this.getDataStore(
      await this.fu.getFile(fileURI),
      this.getCleanedIRI(fileURI)
    );
    if (!store)
      throw new Error(
        "User not logged in, or something went wrong while fetching user profile data."
      );
    return store;
  }

  async getDataStore(
    data: any,
    baseIRI: string
  ): Promise<N3.Store | null> {
    if (!data) return null;
    const store = new N3.Store();
    let parsed: N3.Quad[];
    try {
      parsed = await new N3.Parser({
        baseIRI: baseIRI,
      }).parse(data);
    } catch (e) {
      console.error(e);
      parsed = [];
    }
    await store.addQuads(parsed);
    return store;
  }

  getCleanedIRI(IRI: string) {
    return IRI.split("#")[0];
  }

  getBaseIRI(IRI: string) {
    let path = IRI;
    path = path.replace(/(^\w+:|^)\/\//, "");
    path = path.split("/").slice(1).join("/");
    path =
      IRI.substring(0, IRI.indexOf(path)).replace(/\/$/, "") +
      "/";
    return path;
  }

  async getFullNameFromProfile(
    profileId: string
  ): Promise<string> {
    let store = await this.getDataStoreFromFile(profileId);
    if (store) {
      return await this.getFullNameFromStore(store);
    }
    return "";
  }

  async getFullNameFromStore(
    store: N3.Store
  ): Promise<string> {
    let names = [];
    names = await store.getQuads(
      null,
      "http://www.w3.org/2006/vcard/ns#fn",
      null,
      null
    );
    if (names.length === 0)
      names = await store.getQuads(
        null,
        FOAF + "name",
        null,
        null
      );
    if (names.length === 0) return "";
    return names[0].object.id;
  }

  async getContacts(webId: string | null = null) {
    if (webId === null) {  // webId === null => webId of user logged in
      let session = await this.auth.currentSession();
      if (!(session && session.webId)) {
        throw new Error("No valid session or webId");
      }
      webId = session.webId;
    }
    let datastore = await this.getDataStoreFromFile(webId!);
    if (!datastore) return null;
    return this.getFriendsFromStore(datastore);
  }

  async getFriendsFromStore(
    store: N3.Store
  ): Promise<Array<any>> {
    try {
      return await store
        .getQuads(null, FOAF + "knows", null, null)
        .map((e) => e.object.id);
    } catch {
      return [];
    }
  }

  async initializeResearchPaperStorage(
    profileURI: string,
    papersDirectoryURI?: string | undefined
  ) {
    const store = await this.getDataStoreFromFile(profileURI);
    if (!store) return null;
    let collection = await this.getResearchPaperCollectionFromStore(
      store
    );
    if (!papersDirectoryURI) {
      papersDirectoryURI =
        this.getBaseIRI(profileURI) + "papers/";
    }
    if (!collection) {
      if (!papersDirectoryURI.endsWith("/"))
        papersDirectoryURI = papersDirectoryURI + "/";
      this.patchProfileWithPaperCollection(
        profileURI,
        papersDirectoryURI
      );
    }
    let newProfileStore = await this.getDataStoreFromFile(
      profileURI
    );
    if (!newProfileStore) return null;
    collection = await this.getResearchPaperCollectionFromStore(
      newProfileStore
    );

    if (
      collection &&
      collection["viewid"] &&
      !(await this.fu.fileExists(collection["viewid"]))
    ) {
      return await this.addPaperCollectionFile(
        collection["viewid"],
        papersDirectoryURI
      );
    }
    return null;
  }

  async getResearchPaperCollectionFromFile(
    fileId: string
  ): Promise<{
    collectionid: string;
    viewid?: string | null;
  } | null> {
    let store = await this.getDataStoreFromFile(fileId);
    if (!store) return null;
    return await this.getResearchPaperCollectionFromStore(store);
  }

  async getResearchPaperCollectionFromStore(
    store: N3.Store
  ): Promise<{
    collectionid: string;
    viewid?: string | null;
  } | null> {
    const collectionIds: Array<string> = [];
    // Extract the ids of collections containing RESEARCH PAPERS as their subjects
    for (const collectionTriple of store.getQuads(
      null,
      RDF + "type",
      HYDRA + "Collection",
      null
    )) {
      if (
        store.getQuads(
          collectionTriple.subject.id,
          DCTERMS + "subject",
          RESEARCH_PAPER_CLASS,
          null
        ).length > 0
      ) {
        collectionIds.push(collectionTriple.subject.id);
      }
    }
    if (collectionIds.length === 0) return null;
    for (let id of collectionIds) {
      const quads = store.getQuads(
        id,
        HYDRA + "view",
        null,
        null
      );
      if (quads.length > 0) {
        return {
          collectionid: id,
          viewid: quads[0].object.id,
        };
      }
    }
    return {
      collectionid: collectionIds[0],
    };
  }

  async getResearchPapers(
    profileURI: string
  ): Promise<Array<PaperMetadata>> {
    const collection = await this.getResearchPaperCollectionFromFile(
      profileURI
    );
    if (!collection) return [];
    // TODO: USE COMUNICA FOR THIS TO AUTOMATICALLY FOLLOW RELATIONS IN THE DATA.
    const collectionViewURIs = collection.viewid
      ? [collection.collectionid, collection.viewid]
      : [collection.collectionid];
    let researchPapers: Array<PaperMetadata> = [];
    for (let collectionView of collectionViewURIs) {
      researchPapers = researchPapers.concat(
        await this.getResearchPapersFromFile(collectionView)
      );
    }
    return researchPapers;
  }

  async getResearchPapersFromFile(
    fileURI: string
  ): Promise<Array<PaperMetadata>> {
    const store = await this.getDataStoreFromFile(fileURI);
    let paperIds = store
      .getQuads(null, RDF + "type", RESEARCH_PAPER_CLASS, null)
      .map((quad: N3.Quad) => quad.subject.id);
    return paperIds.map((paperId: string) => {
      const titleQuad = store.getQuads(
        paperId,
        DCTERMS + "title",
        null,
        null
      )[0];
      const locationQuad = store.getQuads(
        paperId,
        RDFS + "seeAlso",
        null,
        null
      )[0];
      const publisherQuad = store.getQuads(
        paperId,
        DCTERMS + "publisher",
        null,
        null
      )[0];
      return {
        id: paperId,
        title:
          titleQuad &&
          (titleQuad.object.value || titleQuad.object.id),
        metadatalocation:
          locationQuad &&
          (locationQuad.object.value || locationQuad.object.id),
        publisher:
          publisherQuad &&
          (publisherQuad.object.value ||
            publisherQuad.object.id),
      };
    });
  }

  async patchProfileWithPaperCollection(
    profileURI: string,
    papersDirectoryURI?: string
  ) {
    papersDirectoryURI =
      papersDirectoryURI || "/" + DEFAULTPAPERSDIRECTORY;
    const profileURIhashtag = profileURI.split("#")[0] + "#";
    const paperCollectionURI =
      profileURIhashtag + PARERSCOLLECTIONNAME;
    const partialCollectionViewId =
      papersDirectoryURI + PAPERSCOLLECTIONFILE;
    const contents =
      "INSERT DATA {  \
        <" +
      paperCollectionURI +
      "> <" +
      RDF +
      "type> <" +
      HYDRA +
      "Collection> ; \n \
      <" +
      DCTERMS +
      'description> "Collection of research papers" ; \n \
      <' +
      DCTERMS +
      "subject> <" +
      RESEARCH_PAPER_CLASS +
      "> ; \n \
      <" +
      HYDRA +
      "view> <" +
      partialCollectionViewId +
      "> . \
      <" +
      partialCollectionViewId +
      "> <" +
      RDF +
      "type> <" +
      HYDRA +
      "PartialCollectionView> }";
    let patch = this.fu.patchFile(profileURI, contents);
    return patch;
  }

  async addPaperCollectionFile(
    collectionURI: string,
    papersDirectoryURI?: string
  ) {
    papersDirectoryURI =
      (papersDirectoryURI || DEFAULTPAPERSDIRECTORY) +
      PAPERSCOLLECTIONFILE;

    const contents: string = MetadataFileGenerator.generatePaperCollection(
      collectionURI,
      papersDirectoryURI
    );
    if (!(await this.fu.fileExists(papersDirectoryURI))) {
      return await this.fu.postAndPatchFile(
        papersDirectoryURI,
        contents
      );
    }
  }

  /**
   * Add a paper to the solid pod of profileURI parameter.
   * The papersdirectory indicates the path in the pod where the paper should be stored.
   * This method will add the paper to that path, and add the metadata for the paper to the papers metadata file.
   * @param {File} file
   * @param {string} profileURI
   * @param {string} papersDirectoryURI
   */
  async addPaper(file: File, metadata: PaperMetadata) {
    const store = await this.getDataStoreFromFile(
      metadata.publisher
    );
    const collection = await this.getResearchPaperCollectionFromStore(
      store
    );
    if (!collection)
      throw new Error(
        "User not logged in or could not access user profile"
      );

    // Upload the file to the solid pod.
    const paperURI =
      metadata.id ||
      DEFAULTPAPERSDIRECTORY + PAPERSCOLLECTIONFILE;
    const fileUploadResponse = await this.fu.uploadFile(
      file,
      paperURI
    );
    if (fileUploadResponse.status === 201) {
      // The resource has succesfully been created
      const uploadURL = fileUploadResponse.url;
      // The paper can be read by friends/contacts
      // Current session should always be active since upload just succeeded
      const contacts = await this.getContacts();
      console.log("Setting READ for all contacts/friends");
      this.pm.createACL(uploadURL,
        [createPermission([MODES.READ], contacts)]
      );

      let metadataURI: any = paperURI.split(".");
      metadataURI =
        metadataURI
          .slice(0, Math.max(1, metadataURI.length - 1))
          .join(".") + "_meta.ttl";
      metadata.metadatalocation = metadataURI;
      const metadataPatch = MetadataFileGenerator.generatePaperEntry(
        collection.collectionid,
        uploadURL,
        metadata
      );
      let payload = "INSERT DATA {" + metadataPatch + "}";
      await this.fu.patchFile(
        collection.viewid || collection.collectionid,
        payload
      );

      await this.createMetadataFile(
        uploadURL,
        metadataURI,
        metadata
      );
    } else {
      throw new Error("Paper not uploaded succesfully");
    }
    return fileUploadResponse;
  }

  async createMetadataFile(
    paperURI: string,
    metadataURI: string,
    metadata: PaperMetadata
  ) {
    // const content = MetadataFileGenerator.initializeMetadataFile(metadataURI, paperURI, metadata)
    const content = MetadataFileGenerator.initializeMetadataFile(
      metadataURI,
      paperURI,
      metadata
    );
    const post = await this.fu.postAndPatchFile(metadataURI, content);
    // this.fu.postFile(metadataURI, "", "text/turtle")
    // this.fu.patchFile(metadataURI, content)
    console.log(post);
    if (post.ok) {
      // Everyone can read the metadata file
      this.pm.createACL(metadataURI,
        [createPermission([MODES.READ], null)] // null for everyone
      );
    }
    return post.ok
  }

  async addComment(
    commentMetadata: CommentMetadata,
    paperMetadata: PaperMetadata,
    inboxes?: string[]
  ) {
    const directory =
      commentMetadata.commentLocation ||
      DEFAULTCOMMENTSDIRECTORY;
    const extension = ".ttl";
    const fileName = await this.getRandomizedFileName(
      directory,
      extension,
      "comment"
    );
    const commentURI = directory + fileName + extension;
    const comment = MetadataFileGenerator.createComment(
      commentURI,
      commentMetadata.documentId,
      commentMetadata.publisherId,
      commentMetadata.text
    );

    await this.fu.postFile(
      commentURI,
      comment.payload,
      "text/turtle"
    );

    const metadataLocation =
      paperMetadata.metadatalocation ||
      paperMetadata.id + ".meta";
    const patchMetadata = "INSERT {" + comment.metadata + "}";
    try {
      this.fu.patchFile(metadataLocation, patchMetadata);
    } catch (e) {
      console.error(
        "Could not update metadata of paper with comment at location " +
        metadataLocation
      );
    }
    return comment.notification;
  }

  async getRandomizedFileName(
    directory: string,
    extension = ".ttl",
    prefix?: string
  ) {
    let id =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    let fileid = directory + id + extension;
    while (await this.fu.fileExists(fileid)) {
      id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      fileid = directory + prefix || "" + id + extension;
    }
    return id;
  }

  async getPaperCommentIds(paperMetadata: PaperMetadata) {
    const metadaLocationURI = paperMetadata.metadatalocation;
    if (!metadaLocationURI) {
      console.error(
        "Paper does not have metadata location ",
        paperMetadata
      );
      return;
    }
    const store = await this.getDataStoreFromFile(
      metadaLocationURI
    );
    return (
      await store.getQuads(null, SIOC + "reply_of", null, null)
    ).map((quad) => quad.subject.id || quad.subject.value);
  }

  async getCommentData(commentId: string) {
    const store = await this.getDataStoreFromFile(commentId);
    const commentQuads = await store.getQuads(
      commentId,
      null,
      null,
      null
    );
    let comment: Comment = {
      id: commentId,
    };
    for (let quad of commentQuads) {
      switch (quad.predicate.id) {
        case "http://rdfs.org/sioc/ns#reply_of":
          comment.replyOf = quad.object.id || quad.object.value;
          break;
        case "http://rdfs.org/sioc/ns#has_creator":
          comment.creator = quad.object.id || quad.object.value;
          break;
        case "http://rdfs.org/sioc/ns#content":
          comment.content = quad.object.id || quad.object.value;
          break;
        case "http://rdfs.org/sioc/ns#created_at":
          if (quad.object.id || quad.object.value) {
            comment.createdAt = new Date(
              (quad.object.id || quad.object.value)
                .split("^^")[0]
                .replace(/"/g, "")
            );
          }
          break;
        case "http://rdfs.org/sioc/ns#note":
          comment.note = quad.object.id || quad.object.value;
          break;
      }
    }
    return comment;
  }

  async getNotificationFromId(
    notificationId: string
  ): Promise<Notification> {
    let store = await this.getDataStoreFromFile(notificationId);
    const typeQuad = await store.getQuads(
      notificationId,
      RDF + "type",
      null,
      null
    )[0];
    const type =
      typeQuad && (typeQuad.object.id || typeQuad.object.value);

    const commentQuad = await store.getQuads(
      notificationId,
      RDFS + "comment",
      null,
      null
    )[0];
    const comment =
      commentQuad &&
      (commentQuad.object.id || commentQuad.object.value);

    const actorQuad = await store.getQuads(
      notificationId,
      AS + "actor",
      null,
      null
    )[0];
    const actor =
      actorQuad &&
      (actorQuad.object.id || actorQuad.object.value);

    const objectQuad = await store.getQuads(
      notificationId,
      AS + "object",
      null,
      null
    )[0];
    const objectId =
      objectQuad &&
      (objectQuad.object.id || objectQuad.object.value);

    const objectTypeQuad = await store.getQuads(
      objectId,
      RDF + "type",
      null,
      null
    )[0];
    const objectType =
      objectTypeQuad &&
      (objectTypeQuad.object.id || objectTypeQuad.object.value);

    const objectReplyOfQuad = await store.getQuads(
      objectId,
      SIOC + "reply_of",
      null,
      null
    )[0];
    const objectReplyOf =
      objectReplyOfQuad &&
      (objectReplyOfQuad.object.id ||
        objectReplyOfQuad.object.value);

    const objectCreatedAtQuad = await store.getQuads(
      objectId,
      SIOC + "created_at",
      null,
      null
    )[0];
    const objectCreatedAt =
      objectCreatedAtQuad &&
      (objectCreatedAtQuad.object.id ||
        objectCreatedAtQuad.object.value);

    const objectCreatorQuad = await store.getQuads(
      objectId,
      SIOC + "has_creator",
      null,
      null
    )[0];
    const objectCreator =
      objectCreatorQuad &&
      (objectCreatorQuad.object.id ||
        objectCreatorQuad.object.value);

    const notification: Notification = {
      id: notificationId,
      type: type,
      comment: comment,
      actor: actor,
      object: {
        id: objectId,
        type: objectType,
        replyOf: objectReplyOf,
        createdAt: objectCreatedAt,
        hasCreator: objectCreator,
      },
    };
    return notification;
  }
}

export interface Comment {
  id: string,
  replyOf?: string,
  createdAt?: Date,
  creator?: string,
  content?: string,
  note?: string
}

// TODO: Add Metadata for the paper
export interface PaperMetadata {
  id: string;
  title?: string;
  metadatalocation?: string;
  publisher: string;
}

export interface CommentMetadata {
  text: string,
  publisherId: string,
  documentId: string,
  commentLocation?: string;
}

export interface Notification {
  id: string,
  type: string,
  comment: string,
  actor: string,
  object: {
    id: string,
    type: string
    replyOf?: string,
    createdAt?: string,
    hasCreator?: string
  }
}


//https://www.webmasterworld.com/devshed/javascript-development-115/regexp-to-match-url-pattern-493764.html
export function validURL(str: string): boolean {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
}