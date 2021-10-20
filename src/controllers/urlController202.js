const { urlModel } = require("../models");

const shortid = require("shortid");

const validUrl = require("valid-url");

const { validator } = require("../utils");

// redis initialization 

const redis = require("redis");

const { promisify } = require("util");

const redisClient = redis.createClient(
  10337,
  "redis-10337.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("6L8SXmAlBLG8Z55VsrQtoTd1ugZZ6Qci", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const SETEX_ASYNC = promisify(redisClient.SETEX).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

// redis done

const postUrl = async function (req, res, next) {
  try {
    requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        msg: "please enter a valid request body",
      });
      return;
    }

    let { longUrl } = requestBody;

    if (!validator.isValid(longUrl)) {
      res.status(400).send({
        status: false,
        msg: "please enter an url",
      });
      return;
    }

    if (!validator.validateUrl(longUrl)) {
      res.status(400).send({
        status: false,
        msg: "please enter a valid url",
      });
      return;
    }

    if (!validUrl.isUri(longUrl)) {
      res.status(400).send({
        status: false,
        msg: "please enter a valid url",
      });
      return;
    }

    let urlData = await GET_ASYNC(longUrl);

    if (urlData) {
      res.status(200).send({
        status: true,
        msg: "present in cache memory",
        data: JSON.parse(urlData),
      });
      return;
    } else {
      let url = await urlModel.findOne(
        {
          longUrl: longUrl,
        },
        { __v: 0, _id: 0 }
      );
      if (url) {
        await SETEX_ASYNC(longUrl, 60 * 60, JSON.stringify(url));
        res.status(200).send({
          status: true,
          msg: "oops url is already present!!",
          Data: url,
        });

        return;
      }
    }

    const urlCode = shortid.generate();

    let baseUrl = "https://";

    let splitArr = longUrl.split("/");

    baseUrl = baseUrl + splitArr[2];

    let shortUrl = baseUrl + "/" + urlCode;

    let newUrl = {
      longUrl,
      shortUrl,
      urlCode,
    };

    await urlModel.create(newUrl);

    await SETEX_ASYNC(longUrl, 60 * 60, JSON.stringify(newUrl));

    await SETEX_ASYNC(shortUrl, 60 * 60, longUrl);

    res.status(201).send({
      status: true,
      msg: "url created",
      data: newUrl,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

const getUrl = async function (req, res) {
  try {
    if (!req.query && Object.keys(req.query).length == 0) {
      res.status(400).send({ status: false, msg: "Requires query params" });
      return;
    }

    let shortUrl = req.query.shortUrl;

    if (!validator.isValid(shortUrl)) {
      res.status(400).send({
        status: false,
        msg: "please enter an url",
      });
      return;
    }

    let cacheUrl = await GET_ASYNC(shortUrl);

    if (cacheUrl) {
      res.status(302).redirect(`${cacheUrl}`);
      return;
    } else {
      let url = await urlModel.findOne({ shortUrl: shortUrl });
      if (url) {
        res.status(302).redirect(`${url.longUrl}`);
        return;
      } else {
        res.status(404).send({
          status: false,
          msg: "url not found",
        });
        return;
      }
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

module.exports = {
  postUrl,
  getUrl,
};
