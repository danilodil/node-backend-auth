const request = require('request-promise');
const Boom = require('boom');

const { apiURL } = require('../constants/appConstant').wealthBox;


async function authentication(email, password) {
  try {
    const options = {
      method: 'POST',
      url: `${apiURL}v1/authentication`,
      body: {
        email,
        password,
      },
      json: true,
    };

    const response = await request(options);
    return response.token;
  } catch (error) {
    return error;
  }
}

module.exports = {
  createContact: async function createContact(req, res, next) {
    try {
      const { username, password } = req.body.decoded_vendor;
      const { wealthboxId, clientData } = req.body;

      const token = await authentication(username, password);
      if (!token) {
        return next(Boom.notFound('Wealthbox token not found'));
      }

      const options = {
        method: 'POST',
        body: clientData,
        json: true,
        headers: {
          'access-token': token,
        },
      };

      if (wealthboxId) {
        options.url = `${apiURL}v1/contacts/${wealthboxId}`;
        options.method = 'PUT';
        delete options.body.email_addresses;
        delete options.body.street_addresses;
      } else {
        options.url = `${apiURL}v1/contacts`;
      }

      const response = await request(options);

      req.session.data = response;
      return next();
    } catch (error) {
      return next(error);
    }
  },
  createTask: async function createTask(req, res, next) {
    try {
      const { username, password } = req.body.decoded_vendor;
      const { taskData } = req.body;

      const token = await authentication(username, password);
      if (!token) {
        return next(Boom.notFound('Wealthbox token not found'));
      }

      const options = {
        method: 'POST',
        url: `${apiURL}v1/tasks`,
        body: taskData,
        json: true,
        headers: {
          'access-token': token,
        },
      };

      const response = await request(options);

      req.session.data = response;
      return next();
    } catch (error) {
      return next(Boom.badRequest(error));
    }
  },
  createEvent: async function createEvent(req, res, next) {
    try {
      const { username, password } = req.body.decoded_vendor;
      const { eventData } = req.body;

      const token = await authentication(username, password);
      if (!token) {
        return next(Boom.notFound('Wealthbox token not found'));
      }

      const options = {
        method: 'POST',
        url: `${apiURL}v1/events`,
        body: eventData,
        json: true,
        headers: {
          'access-token': token,
        },
      };

      const response = await request(options);

      req.session.data = response;
      return next();
    } catch (error) {
      return next(Boom.badRequest(error));
    }
  },
  createProject: async function createProject(req, res, next) {
    try {
      const { username, password } = req.body.decoded_vendor;
      const { projectData } = req.body;

      const token = await authentication(username, password);
      if (!token) {
        return next(Boom.notFound('Wealthbox token not found'));
      }

      const options = {
        method: 'POST',
        url: `${apiURL}v1/projects`,
        body: projectData,
        json: true,
        headers: {
          'access-token': token,
        },
      };

      const response = await request(options);

      req.session.data = response;
      return next();
    } catch (error) {
      return next(Boom.badRequest(error));
    }
  },
  createNote: async function createNote(req, res, next) {
    try {
      const { username, password } = req.body.decoded_vendor;
      const { noteData } = req.body;

      const token = await authentication(username, password);
      if (!token) {
        return next(Boom.notFound('Wealthbox token not found'));
      }

      const options = {
        method: 'POST',
        url: `${apiURL}v1/notes`,
        body: noteData,
        json: true,
        headers: {
          'access-token': token,
        },
      };

      const response = await request(options);

      req.session.data = response;
      return next();
    } catch (error) {
      return next(Boom.badRequest(error));
    }
  },
  createOpportunity: async function createOpportunity(req, res, next) {
    try {
      const { username, password } = req.body.decoded_vendor;
      const { opportunityData } = req.body;

      const token = await authentication(username, password);
      if (!token) {
        return next(Boom.notFound('Wealthbox token not found'));
      }

      const options = {
        method: 'POST',
        url: `${apiURL}v1/opportunities`,
        body: opportunityData,
        json: true,
        headers: {
          'access-token': token,
        },
      };

      const response = await request(options);

      req.session.data = response;
      return next();
    } catch (error) {
      return next(Boom.badRequest(error));
    }
  },
  createWorkflow: async function createWorkflow(req, res, next) {
    try {
      const { username, password } = req.body.decoded_vendor;
      const { workFlowData } = req.body;

      const token = await authentication(username, password);
      if (!token) {
        return next(Boom.notFound('Wealthbox token not found'));
      }

      const options = {
        method: 'POST',
        url: `${apiURL}v1/workflows`,
        body: workFlowData,
        json: true,
        headers: {
          'access-token': token,
        },
      };

      const response = await request(options);

      req.session.data = response;
      return next();
    } catch (error) {
      return next(Boom.badRequest(error));
    }
  },
};
