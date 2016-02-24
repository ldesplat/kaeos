'use strict';

const Hoek = require('hoek');
const Joi = require('joi');
const Agents = require('./agents');
const Reporters = require('./reporters');


const internals = {};


internals.schema = {
    monitors: Joi.array().items({
        reporter: Joi.object({
            name: Joi.string().required(),
            settings: Joi.object()
        }).required(),
        agent: Joi.object({
            name: Joi.string().required(),
            settings: Joi.object()
        }).required()
    })
};


module.exports = internals.Kaeos = function (settings) {

    const validation = Joi.validate(settings, internals.schema);
    Hoek.assert(validation.error === null, 'Invalid settings ' + (validation.error && validation.error.annotate()));

    this.settings = validation.value;
    this.monitors = [];

    const monitorConfigs = this.settings.monitors;
    monitorConfigs.map((config) => {

        Hoek.assert(Reporters[config.reporter.name], 'Undefined reporter specified, ' + config.reporter.name);
        Hoek.assert(Agents[config.agent.name], 'Undefined agent specified, ' + config.agent.name);

        config.agent.settings.reporter = new Reporters[config.reporter.name](config.reporter.settings);
        const monitor = new Agents[config.agent.name](config.agent.settings);

        this.monitors.push(monitor);
    });
};


internals.Kaeos.prototype.start = function () {

    this.monitors.map((monitor) => {

        monitor.start();
    });
};


internals.Kaeos.prototype.stop = function () {

    this.monitors.map((monitor) => {

        monitor.stop();
    });
};