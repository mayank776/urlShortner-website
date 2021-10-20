const express = require("express");

const router = express.Router();

const {  urlController202 } = require("../controllers");

//WITHOUT PACKAGE

//postUrl
router.post("/url/shorten", urlController202.postUrl);

//getUrl
router.get("/shortUrl", urlController202.getUrl);
module.exports = router;
