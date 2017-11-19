var router = require('express').Router();

/**
 * Status XML.
 */
router.get('/status/:user/:repo', function (req, res) {
  utility.status(req.params.user, req.params.repo, function (output) {
    res.set('Content-Type', 'text/xml');
    res.send(output);
  })
});

module.exports = router;