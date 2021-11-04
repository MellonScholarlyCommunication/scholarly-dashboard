/* eslint-disable prettier/prettier */
/**
 *
 * @param {object} options - The options to generate the landing page for.
 * @param {string} options.baseURL - The baseURL of the landing page (should be the container where the landing page is stored).
 * @param {string} options.title - The artefact title.
 * @param {object} options.abstract - The artefact abstract.
 * @param {object} options.aggregation - The info of the aggregation file indexed by this landing page.
 * @param {string} options.aggregation.uri - The URI of the aggregation file.
 * @param {string} options.aggregation.contentType - The content type of the aggregation file.
 * @param {object} options.profile - The publisher profile information.
 * @param {string} options.profile.name - The publisher full name.
 * @param {string} options.profile.webId - The publisher webId.
 * @param {string} options.profile.image - The publisher profile image URI.
 * @param {object} options.authors[] - The authors of the artefact.
 * @param {string} options.authors[].webId - The webId of the author.
 * @param {string} options.authors[].name - The full name of the author.
 * @param {object} options.organizations[] - The organizations of the authors.
 * @param {string} options.organizations[].uri - The organization URI.
 * @param {string} options.organizations[].name - The organization name.
 * @param {object} options.keywords[] - The artefact keywords.
 * @param {string} options.keywords[].uri - The keyword URI.
 * @param {string} options.keywords[].label - The keyword label.
 * @param {object} options.aggregated[] - The available aggregated items in the aggregation.
 * @param {string} options.aggregated[].uri - The item uri.
 * @param {string} options.aggregated[].title - The item title.
 * @param {string} options.aggregated[].format - The item format.
 * @returns
 */
export default function generateLandingPageHTML(options) {
  const {
    baseURL = "",
    title = "",
    aggregation = { uri: "", contentType: "" },
    aggregated = [],
    profile = {
      webId: "",
      name: "Unknown",
      image: "", // name of the current datapod owner
    },
    abstract = "No abstract provided",
    keywords = [],
    authors = [],
    organizations = [],
  } = options;

  function createDownloadsDropdown(aggregated) {
    return `
    <div class="dropdown inline-block mleft-small mright-small">
      <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
          Download
          <span class="caret"></span>
      </button>
      <ul class="dropdown-menu dropdown-menu-right list-unstyled">
          ${aggregated
            .map((entry) => {
              const splitURI = entry.uri.split("/");
              const fileName = splitURI[splitURI.length - 1];
              return `
          <li>
              <a href="${entry.uri}" title="Download &quot;${fileName}&quot;"  target="_blank" rel="noopener noreferrer">
                  <span class="glyphicon glyphicon-download-alt text-success"></span>
                  Download &quot;${entry.title}&quot;
              </a>
          </li>
          `;
            })
            .join(" \n")}
          
        <li role="separator" class="divider"></li>
      </ul>
    </div>
    `;
  }
  return `
<!doctype html>
<html lang="nl">
    <head>
        <base href="${baseURL}"/>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link rel="describes" href="${aggregation.uri}" type="${
    aggregation.contentType
  }">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://biblio.ugent.be/static/css/ugent.css">
        <link rel="stylesheet" media="all" href="https://biblio.ugent.be/assets/css/prettify.css">
        <link rel="stylesheet" href="https://biblio.ugent.be/static/css/biblio.css">
        <link rel="icon" sizes="16x16 32x32" href="https://biblio.ugent.be/static/icons/favicon.ico">
        <link rel="manifest" href="https://biblio.ugent.be/static/icons/manifest.json">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="https://biblio.ugent.be/static/icons/ms-icon-144x144.png">
        <meta name="theme-color" content="#ffffff">
        <script>
            document.createElement("picture")
        </script>
        <script src="https://biblio.ugent.be/static/js/vendor/modernizr-custom.min.js" async=""></script>
        <script src="https://biblio.ugent.be/static/js/vendor/picturefill.min.js" async=""></script>
        <script src="https://biblio.ugent.be/static/js/vendor/jquery.min.js"></script>

    </head>

    <body>
        <div class="fluid-container">
            <div class="row">
                <header class="pageheader col-xs-12 ">
                    <nav class="navbar navbar-default">
                        <div class="row">
                            <div class="navbar-header col-xs-12 col-sm-2">
                                <div class="page-logo">
                                    <a href="https://biblio.ugent.be" class="link">
                                        <img src="https://biblio.ugent.be/static/images/logo_ugent_nl.svg" alt="Organization logo">
                                    </a>
                                </div>
                                <a href="#" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar" role="button">
                                    <span class="">MENU</span>
                                    <div class="block">
                                        <span class="icon-bar"></span>
                                        <span class="icon-bar"></span>
                                        <span class="icon-bar"></span>
                                    </div>
                                </a>
                            </div>
                            <div id="navbar" class="collapse navbar-collapse col-sm-10" role="navigation">
                                <div class="row menu">
                                    <div class="col-xs-12">
                                        <div class="bg-primary spacer">
                                            <div class="row">
                                                <div class="col-xs-12">
                                                    <ul class="nav-tertiary nav navbar-nav navbar-right">
                                                        
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6 col-sm-offset-2 branding-container faculty-1">
                            <a href="${profile.webId}"  target="_blank" rel="noopener noreferrer">
                              <h1>${profile.name}'s Publications</h1>
                            </a>
                        </div>
                    </div>
                </header>
            </div>
        </div>

        <div class="fluid-container">
            <div class="pull-right">
                
    ${createDownloadsDropdown(aggregated)}
            </div>
            <ol class="breadcrumb mbottom-medium">
                
                
            </ol>
        </div>

        <div class="fluid-container">
            <div class="row">
                <div class="col-xs-12" id="messages">

                </div>
            </div>
            <div class="row pbottom-large">
                

<article class="col-sm-9">
    <div class="clearfix pbottom-default">
      <div class="pull-left pbottom-default pright-default">
        <img src="${
          profile.img ||
          "https://biblio.ugent.be/static/images/publication-blank.png"
        }">
      </div>
        <h1 class="title long" itemprop="name">${title}</h1>
        <div class="mbottom-tiny">
          <span class="authors">
          <span class="contributor vcard">
          <a class="url plain">
            ${authors.map(
              (author) =>
                `<a class="url plain" href="${author.webId}"  target="_blank" rel="noopener noreferrer"><span class="fn">${author.name}</span></a>`
            )}
          </a>
        </div>
        <div class="text-muted">
      </div>
    </div>

    <dl class="subtle roomy pbottom-default mbottom-default border-bottom">
      <dt>Organization</dt>
      <dd>
      <ul class="list-unstyled">
      ${organizations
        .map(
          (organization) => `
      <li itemprop="sourceOrganization" itemscope itemtype="http://schema.org/Organization">
        <a class="plain" href="${organization.uri}" itemprop="uri"  target="_blank" rel="noopener noreferrer">
          <span itemprop="name">
            ${organization.name}
          </span>
        </a>
      </li>
      `
        )
        .join(" \n")}
      </ul>
      </dd>
      <dt>Abstract</dt>
        <dd itemprop="description">
          ${abstract}
        </dd>
      <dt>Keywords</dt>
      <dd itemprop="keywords">
      ${
        // eslint-disable-next-line prettier/prettier
        keywords.map(
            (keyword) =>
              `<a class="plain" href="${keyword.uri}"  target="_blank" rel="noopener noreferrer">${keyword.label}</a>, `
          )
          .join(", ")
      }
      </dd>
    </dl>

    <div class="mbottom-default">
    </div>

     </div>
    </div>
</article>
            </div>
        </div>

        <script type="text/javascript" src="https://biblio.ugent.be/static/js/vendor/bootstrap.min.js"></script>
        <script type="text/javascript" src="https://biblio.ugent.be/static/js/vendor/bootstrap-select.min.js"></script>
        <script type="text/javascript" src="https://biblio.ugent.be/static/js/vendor/smooth-scroll.min.js"></script>
        <script type="text/javascript" src="https://biblio.ugent.be/static/js/vendor/bootstrap-confirm-button.min.js"></script>
        <script type="text/javascript" src="https://biblio.ugent.be/static/js/biblio.js"></script>
        
    </body>
</html>
`;
}