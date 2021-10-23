const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("user")
            .populate("campsites")
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id }).then((favorite) => {
            if (favorite) {
                req.body.forEach((campsite) => {
                    if (!favorite.campsites.includes(campsite._id)) {
                        favorite.campsites.push(campsite._id)
                    }
                })
                favorite.save().then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/jason')
                    res.json(favorite)
                }).catch(err => next(err))
            } else {
                Favorite.create({ user: req.user._id, campsites: req.body })
                    .then(favorite => {
                        console.log('Favorite created');
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/jason')
                        res.json(favorite)
                    }).catch(err => next(err))
            }
        })
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                } else {
                    res.status = 404;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You have no favorites to delete')
                }
            }).catch(err => next(err))
    })

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/:campsiteId`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id }).then((favorite) => {
            if (favorite) {
                if (favorite.campsites.indexOf(req.params.campsiteId) === -1) {
                    favorite.push(req.params.campsiteId)
                }
                favorite.save().then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/jason')
                    res.json(favorite)
                }).catch(err => next(err))
            } else {
                Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                    .then(favorite => {
                        console.log('Favorite created', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/jason')
                        res.json(favorite)
                    }).catch(err => next(err))
            }
        })
            .catch(err => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/:campsiteId`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    let campsites = favorite.campsites.filter(campsite => {
                        return campsite === req.params.campsiteId;
                    });
                    favorite.campsites = campsites;

                    favorite.save()
                        .then(favorite => {
                            console.log('Campsite removed from favorites');
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }).catch(err => next(err))
                } else {
                    res.status = 404;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('There are no favorites to delete')
                }
            }).catch(err => next(err))
    });
    
module.exports = favoriteRouter;