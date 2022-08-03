# Job API

## Overview
This is a short assessment that will help us to understand your current skill set and approach to problem solving. You are free to complete the assessment in your own time and using your preferred development environment. Whilst we don't mandate a maximum time limit, we would advise that approx 3-4 hours should suffice.

## Submission
A link to a private Git repository will be provided to you via email. Please add the repository as a remote and push your commit(s) accordingly.

## Requirements
To build a HTTP API in Node.js using [hapi](https://hapi.dev/) that will simulate working with 'Job' entities, whilst validating certain business rules/requirements. 

Job entities can be persisted in memory for the purposes of this exercise - no underlying data store is required.

Aside from the specific requirement to use `hapi` for the API, you are free to use any other NPM packages to help build and/or test your implementation.

## Job Entity

A Job entity is comprised of the following attributes:

```
id: required, string. must be a valid UUID (v4).
type: required, string. must be one of 'ON_DEMAND', 'SHIFT' or 'SCHEDULED'.
priceInPence: required, integer. can be zero, but cannot be negative.
contactEmail: optional, string. must be a valid email if provided.
status: required, string. must be one of 'AVAILABLE', 'ASSIGNED' or 'COMPLETED'.
createdAt: required, string. must be a valid date in ISO 8601 format. automatically set when a Job entity is created.
updatedAt: optional, string. must be a valid date in ISO 8601 format. defaults to null, automatically set whenever a Job entity is updated.
```

## API

The API should have the following endpoints:

### List Jobs

**Endpoint**: `/jobs - GET`

This endpoint should return a list of Job entities, ordered by the date that they were created (descending, newest first). 

A successful response should return data as per the Job model definition.

### Create a New Job

**Endpoint**: `/jobs - POST`

This endpoint should parse incoming JSON data and create a new Job entity, returning it in the response.

The incoming JSON payload should be as follows:

```
type: required, string. must be one of 'ON_DEMAND', 'SHIFT' or 'SCHEDULED'.
priceInPence: required, integer. can be zero, but cannot be negative.
contactEmail: optional, string. must be a valid email if provided.
status: required, string. must be one of 'AVAILABLE', 'ASSIGNED' or 'COMPLETED'.
```

If the incoming payload is valid, the `createdAt` attribute should be set to the current date/time automatically.

Invalid payloads should return an error code, preferably with a message explaining the error.

### Get Job by ID

**Endpoint**: `/jobs/{id} - GET`

This endpoint should return a single Job, matching by the ID specified as a route parameter.

### Update Job by ID

**Endpoint**: `/jobs/{id} - PATCH`

This endpoint should parse incoming JSON data and update an existing Job entity, returning it in the response.

The incoming JSON payload should be as follows:

```
contactEmail: optional, string. must be a valid email if provided.
status: required, string. must be one of 'AVAILABLE', 'ASSIGNED' or 'COMPLETED'.
```

Only the `contactEmail` and `status` attributes can be updated. The `updatedAt` should be updated if an update takes place.


### Delete Job by ID

**Endpoint**: `/jobs/{id} - DELETE`

This endpoint should delete a Job from the in-memory store, matching by the ID specified as a route parameter.

## Tips

Some things we're looking for in your code:

- Clean, readable code
- Good commit messages
- Appropriate use of HTTP status codes
- Tests