Download the github modules to the Drupal project with ease.

1. Install *d7psu-node* to a server (e.g. http://username:password@example.com:3000).
2. Update the project using drush command:

```
  drush @SITEALIAS dl -y PROJECT \
  --no-md5=1 \
  --destination=DIRECTORY \
  --source=SCHEME://USER:PASS@HOST:PORT/status/OWNER/PROJECT\?nocache=NOCACHE#
```

* SITEALIAS - Drush alias
* OWNER - Project owner (github user or org name)
* PROJECT - Project name (repo name)
* SCHEME / USER / PASS / HOST / PORT - The server where you installed *d7psu-node*, e.g. http://username:password@example.com:3000 (the link here includes the basic authentication with USER and PASS)
* NOCACHE - (optional) Unique string, e.g. timestamp to prevent caching. 
* DIRECTORY - The directory where module will be downloaded, e.g. if DIRECTORY=sites/all/modules/custom then your project will be in sites/all/modules/custom/PROJECT

