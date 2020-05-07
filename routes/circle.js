// Express - Router
const router = require('express').Router();

// Password + JWT
const passport = require('passport');

// Express - Validation (https://www.npmjs.com/package/express-validator)
const { check } = require('express-validator');

// JWT Strategy
const jwtStrategy = require('../core/jwtStrategy');

passport.use(jwtStrategy);

// Check if Express-Validtor returned an error
const {
  checkErrors,
  formatError500Json,
  formatError404Json,
} = require('../core/express/errors');

// Business Logic related to the Circle
const CircleService = require('../services/circleService');

// Transportation Class
const Transport = require('../models/transport/transport');

/**
 * @api {post} /circle/create Create a new User Circle
 * @apiDescription Allow an authenticated user to create a new Circle providing a name
 * @apiName /circle/create
 * @apiGroup Circle
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} authorization bearer + 'Authorization token'
 * @apiHeader {String} content-type application/json
 *
 * @apiHeaderExample Header-Example:
 * Authorization: bearer eyJhbGc...token
 * content-type: application/json
 *
 * @apiParam {string} Name Name of the Circle
 * @apiParamExample {json} Request-Example:
 * {
 *  "name": "Soccer team"
 * }
 *
 * @apiSuccess {int} Id The Circle id
 * @apiSuccessExample {json} Example
 * HTTP/1.1 200 OK
 * {
 *  "status": {
 *    "id": 200,
 *    "errors": null
 *  },
 *  "data": {
 *    "id": 1
 *  }
 * }
 *
 * @apiError {401} UNAUTHORIZED Authentication is required and has failed or has not yet been provided.
 * @apiError {422} UNPROCESSABLE_ENTITY The request was well-formed but was unable to be followed due to semantic errors.
 * @apiError (Error 5xx) {500} INTERNAL_SERVER_ERROR A generic error message, given when an unexpected condition was encountered and no more specific message is suitable
 * @apiErrorExample {json} Example
 * HTTP/1.1 401 Unauthorized
 * {
 *   "status": {
 *     "errors": [
 *       "Unauthorized",
 *     ],
 *     "id": 401
 *   }
 * }
 *
 * -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 *
 * HTTP/1.1 422 Unprocessable Entity
 * {
 *   "status": {
 *     "errors": [
 *       "The name must have a minimum of 3 characters and a maximum of 56 characters",
 *     ],
 *     "id": 422
 *   }
 * }
 *
 * -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 *
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "status": {
 *     "errors": [
 *       "Internal Server Error"
 *     ],
 *     "id": 500
 *   }
 * }
 */
router.post(
  '/create',
  passport.authenticate('jwt', { session: false }),
  [
    check(
      'name',
      'The name must have a minimum of 3 characters and a maximum of 56 characters'
    ).isLength({ min: 3, max: 56 }),
  ],
  checkErrors(),
  (req, res) => {
    // Get the values from the body
    const { name } = req.body;

    // Service Layer
    const sCircle = new CircleService();

    //  Authenticated user
    const authUser = req.user;

    // Create a new Circle
    sCircle
      .getNumberCirclesByOwner(authUser.id)
      .then((result) => {
        // The user can only create 2 Circle in the free version;
        if (result < 2) {
          return result;
        } else {
          throw new Error('You reached the free account limit.');
        }
      })
      .then(() => sCircle.addNewCircle(authUser.id, authUser.email, name))
      .then((circleId) => {
        return res.json(new Transport(200, null, { circleId }));
      })
      .catch((error) => {
        if (error.message === 'You reached the free account limit.') {
          // Is a Endpoint
          const transport = new Transport(422, [error.message], null);

          // Remove the property data
          delete transport.data;

          // Return the error
          return res.status(422).json(transport);
        } else {
          return formatError500Json(res, error);
        }
      });
  }
);

/**
 * @api {get} /circle/byUser List of Circles by User
 * @apiDescription Return the list of all Circles that the user belongs (invited or owner)
 * @apiName /circle/byUser
 * @apiGroup Circle
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} authorization bearer + 'Authorization token'
 * @apiHeader {String} content-type application/json
 *
 * @apiHeaderExample Header-Example:
 * Authorization: bearer eyJhbGc...token
 * content-type: application/json
 *
 * @apiSuccess {array} circles List of Circles
 * @apiSuccessExample {json} Example
 * HTTP/1.1 200 OK
 * {
 *   "status": {
 *     "id": 200,
 *     "errors": null
 *   },
 *   "data": {
 *     "circles": [
 *       {
 *         "id": 1,
 *         "name": "Circle 1",
 *         "isOwner": 1,
 *         "joinedAt": "2020-05-07T17:20:15.000Z"
 *       },
 *       {
 *         "id": 2,
 *         "name": "Circle 2",
 *         "isOwner": 0,
 *         "joinedAt": null
 *       }
 *     ]
 *   }
 * }
 *
 * @apiError {401} UNAUTHORIZED Authentication is required and has failed or has not yet been provided.
 * @apiError {404} NOT_FOUND The requested resource could not be found but may be available in the future.
 * @apiError {422} UNPROCESSABLE_ENTITY The request was well-formed but was unable to be followed due to semantic errors.
 * @apiError (Error 5xx) {500} INTERNAL_SERVER_ERROR A generic error message, given when an unexpected condition was encountered and no more specific message is suitable
 * @apiErrorExample {json} Example
 * HTTP/1.1 401 Unauthorized
 * {
 *   "status": {
 *     "errors": [
 *       "Unauthorized",
 *     ],
 *     "id": 401
 *   }
 * }
 *
 * -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 *
 * HTTP/1.1 404 Not Found
 * {
 *   "status": {
 *     "id": 404,
 *     "errors": [
 *       "Not Found"
 *     ]
 *   }
 * }
 *
 * -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 *
 * HTTP/1.1 422 Unprocessable Entity
 * {
 *   "status": {
 *     "errors": [
 *       "The name must have a minimum of 3 characters and a maximum of 56 characters",
 *     ],
 *     "id": 422
 *   }
 * }
 *
 * -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 *
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "status": {
 *     "errors": [
 *       "Internal Server Error"
 *     ],
 *     "id": 500
 *   }
 * }
 */
router.get(
  '/byUser',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Service Layer
    const sCircle = new CircleService();

    //  Authenticated user
    const authUser = req.user;

    // Create a new Circle
    sCircle
      .GetCircleByUser(authUser.id)
      .then((result) => {
        if (result === null) {
          return formatError404Json(res);
        } else {
          return res.json(new Transport(200, null, { circles: result }));
        }
      })
      .catch((error) => {
        return formatError500Json(res, error);
      });
  }
);

// Export this router
module.exports = router;
