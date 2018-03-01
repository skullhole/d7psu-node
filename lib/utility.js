var configManager = require("config");
var fetchURL = require("fetch").fetchUrl;
var xml = require("xml");

/**
 * Asyncronously gets contents by given URL and passes it to a callback.
 *
 * @param url
 * @param done
 */
function httpGet(url, done) {
  fetchURL(url, function (error, meta, body) {
    if (error) {
      console.log("Error loading: ", url);
    }
    else {
      var content = JSON.parse(body.toString());

      // Error.
      if (!content || content.message) {
        console.log("Error: ", url, content);
        return;
      }

      if (content) {
        done(content);
      }
    }
  })
}

/**
 * Callback to construct the XML.
 *
 * @param user
 * @param repo
 * @param done
 */
var d7psuStatusXMLGet = function (user, repo, done) {
  var config = {
    user: user,
    repo: repo,
    atok: configManager.get("atok")
  };

  d7psuGithubAPI("https://api.github.com/repos/%USER%/%REPO%/releases?access_token=%ATOK%", config, function (content, config) {
    d7psuStatusXMLBuild(content, config, done);
  });
};

/**
 * Asyncronously accesses Github API and processes it using a callback.
 *
 * @param url
 * @param config
 * @param done
 */
function d7psuGithubAPI(url, config, done) {
  var urlPrepared = d7psuGithubAPIURLClean(url, config);

  // Request.
  httpGet(urlPrepared, function (content) {
    done(content, config);
  });
}

/**
 * Replaces tokens in string.
 *
 * @param string
 * @param config
 * @returns {XML}
 */
function d7psuGithubAPIURLPrepare(string, config) {
  return string
    .replace("%USER%", config.user)
    .replace("%REPO%", config.repo)
    .replace("%ATOK%", config.atok);
}

/**
 * Prepares Github API URL.
 *
 * @param url
 * @param config
 * @returns {XML}
 */
function d7psuGithubAPIURLClean(url, config) {
  var urlPrepared = d7psuGithubAPIURLPrepare(url, config);
  if (!config.atok) {
    urlPrepared = urlPrepared
      .replace("access_token=", "")
      .replace("&&", "&")
      .replace(/\?$/, "");
  }
  return urlPrepared;
}

/**
 * Processes Github API output and builds an xml for a callback.
 *
 * @param content
 * @param config
 * @param done
 */
function d7psuStatusXMLBuild(content, config, done) {
  var major = "1";
  var releases = [], filepath, fileinfo;
  for (var index in content) {
    if (content.hasOwnProperty(index)) {
      var release_github = content[index],
        release = [];

      // Tag Name should be in format 7.x-N.N
      var regexp = /^7\.x-(\d+)\.(\d+)$/;
      if (!regexp.test(release_github.tag_name)) {
        continue;
      }

      // Reuseable info.
      var match = release_github.tag_name.match(regexp);
      var date = new Date(release_github.published_at).getTime() / 1000;

      // Set major as last version.
      major = Math.max(parseInt(match[1]), major);

      release.push({"name": d7psuGithubAPIURLPrepare("%REPO% %VERSION%", config).replace("%VERSION%", release_github.tag_name)});
      release.push({"version": d7psuGithubAPIURLPrepare("%VERSION%", config).replace("%VERSION%", release_github.tag_name)});
      release.push({"tag": d7psuGithubAPIURLPrepare("%VERSION%", config).replace("%VERSION%", release_github.tag_name)});
      release.push({"version_major": match[1]});
      release.push({"version_patch": match[2]});
      release.push({"status": "published"});
      release.push({"release_link": release_github.html_url});
      release.push({"download_link": d7psuGithubAPIURLClean(release_github.tarball_url + "?access_token=%ATOK%", config)});
      release.push({"date": date});
      // release.push({ "mdhash" : "" });
      // release.push({ "filesize" : "" });
      release.push({"terms": []});

      var files = [];

      // ZIP.
      filepath = d7psuGithubAPIURLClean(release_github.zipball_url + "?access_token=%ATOK%", config);
      fileinfo = d7psuFileStat(filepath);
      files.push({
        "file": [
          {"url": filepath},
          {"archive_type": "zip"},
          {"md5": fileinfo.md5},
          {"size": fileinfo.size},
          {"filedate": date}
        ]
      });

      // TAR.GZ.
      filepath = d7psuGithubAPIURLClean(release_github.tarball_url + "?access_token=%ATOK%", config);
      fileinfo = d7psuFileStat(filepath);
      files.push({
        "file": [
          {"url": filepath},
          {"archive_type": "tar.gz"},
          {"md5": fileinfo.md5},
          {"size": fileinfo.size},
          {"filedate": date}
        ]
      });

      release.push({"files": files});

      releases.push({"release": release});
    }
  }

  var project = [
    {
      project: [
        {_attr: {"xmlns:dc": "http://purl.org/dc/elements/1.1/"}},
        {"title": d7psuGithubAPIURLPrepare("%USER%/%REPO%", config)},
        {"short_name": d7psuGithubAPIURLPrepare("%REPO%", config)},
        {"dc:creator": d7psuGithubAPIURLPrepare("%USER%", config)},
        {"type": "project_module"},
        {"api_version": "7.x"},
        {"recommended_major": major},
        {"supported_majors": major},
        {"default_major": major},
        {"project_status": "published"},
        {
          "terms": [
            {
              "term": [
                {"name": "Projects"},
                {"value": "Modules"}
              ]
            },
            {
              "term": [
                {"name": "Maintenance status"},
                {"value": "Actively maintained"}
              ]
            },
            {
              "term": [
                {"name": "Development status"},
                {"value": "Under active development"}
              ]
            }
          ]
        },
        {
          "releases": releases
        }
      ]
    }
  ];

  // XML.
  var output = xml(project, true);

  // Callback.
  done(output);
}

/**
 * Retrieves the file and gets its md5 hash and filesize.
 *
 * @param filepath
 */
function d7psuFileStat(filepath) {
  var fileinfo = {md5: "", size: ""};

  // todo

  return fileinfo;
}

module.exports = {
  status: d7psuStatusXMLGet
};