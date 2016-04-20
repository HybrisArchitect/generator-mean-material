/**
 * Module for handling user requests.
 * Initializing the [UserController]{@link user:controller~UserController}
 * and configuring the express router to handle the user api
 * for /api/users routes. Authentication middleware is added to
 * all requests except the '/' route - where everyone can POST to.
 * Export the configured express router for the user api routes
 * @module {express.Router}
 * @requires {request-context}
 * @requires {@link user:controller}
 * @requires {@link auth:service}
 */
'use strict';

var router = require('express').Router();
var contextService = require('request-context');
var UserController = require('./user.controller');
var auth = require('../../lib/auth/auth.service');

// Export the configured express router for the user api routes
module.exports = router;

/**
 * The api controller
 * @type {user:controller~UserController}
 */
var controller = new UserController(router);

// add context for auth sensitive resources
var addRequestContext = contextService.middleware('request');

// add the authenticated user to the created request context
var addUserContext = auth.addAuthContext('request:acl.user');

// check if the used is authenticated at all
var isAuthenticated = auth.isAuthenticated();

// check if the authenticated user has at least the 'admin' role
var isAdmin = auth.hasRole('admin');

// wrap in domain, check authentication and attach userInfo object, set user request context
router.route('*')
	.all(addRequestContext, isAuthenticated, addUserContext);

// register user routes
router.route('/')
	.get(isAdmin, controller.index.bind(controller))
	.post(isAdmin, controller.create.bind(controller));

// fetch authenticated user info
router.route('/me')
	.get(controller.me.bind(controller));

// user crud routes
router.route('/' + controller.paramString)
	.get(isAdmin, controller.show.bind(controller))
	.delete(isAdmin, controller.destroy.bind(controller))
	.put(isAdmin, controller.update.bind(controller))
	.patch(isAdmin, controller.update.bind(controller));

// set the password for a user
router.route('/' + controller.paramString +  '/password')
	.put(controller.changePassword.bind(controller))
	.patch(controller.changePassword.bind(controller));

// admin only - administrative tasks for a user resource (force set password)
router.route('/' + controller.paramString + '/admin')
	.put(isAdmin, controller.setPassword.bind(controller))
	.patch(isAdmin, controller.setPassword.bind(controller));
