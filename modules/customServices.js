const mongoose = require('mongoose');
const configurations = require('../config');
const axios = require('axios');
const https = require('https');
const { URL } = require('url');
const querystring = require('querystring');
const zipcodes = require('zipcodes');
/** use only when ssl integration required use axios directly otherwise
 * make http request like curl
 */
const request = async (url = '', options = {}, data = {}) => {
    let { protocol, hostname, port, pathname } = new URL(url);
    if (port === '' && protocol === 'https:') {
        port = 443;
    } else if (port === '') {
        port = 80;
    }

    data = querystring.stringify(data);
    const settings = {
        hostname,
        port,
        path: pathname,
        method: options.method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': typeof data === 'string' ? data.length : 0,
            ...options.headers || {},
        }
    };

    return new Promise((resolve, reject) => {
        let responseBuffer = '';
        const req = https.request(settings, (res) => {
            if (res.statusCode === 200) {
                res.on('data', (buffer) => {
                    responseBuffer += buffer
                });
                res.on('end', function () {
                    resolve(JSON.parse(responseBuffer.toString()))
                });
            } else {
                res.on('data', (buffer) => {
                    responseBuffer += buffer
                });
                res.on('end', function () {
                    let Err = new Error(responseBuffer || 'Unknown error');
                    Err.status = res.statusCode;
                    reject(Err);
                });
            }
        });
        req.on('error', error => {
            let Err = new Error(error.message || 'Unknown error');
            Err.status = 500;
            reject(Err);
        });
        req.write(data);
        req.end();
    })
};


const zipCodeRecords = async (records) => {
    for (var i in records) {
        records[i].distance = zipcodes.distance(90210, 62959)
    }
    return records
}

const paginateProviderWhenZipCodeProvided = async (dataObj) => {
    let pageData;
    let records = dataObj.docs;

    if (records.length > 0) {

        let pagination = {
            totalRecords: dataObj.totalDocs,
            limit: dataObj.limit,
            hasPrevPage: dataObj.hasPrevPage,
            hasNextPage: dataObj.hasNextPage,
            currentPage: dataObj.page,
            totalPage: dataObj.totalPages,
            pagingCounter: dataObj.pagingCounter,
            prevPage: dataObj.prevPage,
            nextPage: dataObj.nextPage
        };

        pageData = {
            data: await zipCodeRecords(records),
            pagination: pagination
        };

        return pageData;

    } else {
        pageData = {
            data: await zipCodeRecords(records),
            pagination: {
                totalRecords: 0,
                limit: 0,
                hasPrevPage: false,
                hasNextPage: false,
                currentPage: 1,
                totalPage: 1,
                pagingCounter: 1,
                prevPage: null,
                nextPage: null
            }

        }

    }
    return pageData;
};
/**
 * api pagination data formatter for aggregate paginate
 */
const paginateProvider = async (dataObj) => {
    let pageData;
    let records = dataObj.docs;

    if (records.length > 0) {

        let pagination = {
            totalRecords: dataObj.totalDocs,
            limit: dataObj.limit,
            hasPrevPage: dataObj.hasPrevPage,
            hasNextPage: dataObj.hasNextPage,
            currentPage: dataObj.page,
            totalPage: dataObj.totalPages,
            pagingCounter: dataObj.pagingCounter,
            prevPage: dataObj.prevPage,
            nextPage: dataObj.nextPage
        };

        pageData = {
            data: records,
            pagination: pagination
        };

        return pageData;


    } else {

        pageData = {
            data: records,
            pagination: {
                totalRecords: 0,
                limit: 0,
                hasPrevPage: false,
                hasNextPage: false,
                currentPage: 1,
                totalPage: 1,
                pagingCounter: 1,
                prevPage: null,
                nextPage: null
            }

        }

    }
    return pageData;
};

/**
 * validate if given page number is valid for pagination
 */
const isValidPage = async (page) => {
    page = parseInt(page);
    if (isNaN(page) || typeof (page) == 'undefined') {
        return 1;
    }
    return page <= 0 ? 1 : page
};

/**
 * validate if given string is mongodb object id
 */
const isValidObject = async (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
};

/**
 * api per page limit
 */
const perPageLimit = () => parseInt(configurations.apiPerPageLimit || 20);

/**
 * Data table feeder for jquery datatable
 */
const ajaxDataProvider = async (req, aggregateQuery, documentModel, options = {}) => {
    let { start, length } = req.query;

    if (start === undefined) {
        start = 0;
    }

    if (length === undefined) {
        length = 10;
    }

    length = parseInt(length);
    start = parseInt(start) || 0;
    start = (start + length) / length;
    options.page = parseInt(start);
    options.limit = parseInt(length);

    let getPagination;
    if (length < 1) {
        let data = await aggregateQuery;
        getPagination = {
            data: data,
            pagination: {
                totalRecords: data.length
            }
        };
    } else {
        let documents = await documentModel.aggregatePaginate(aggregateQuery, options);
        getPagination = await paginateProvider(documents);
    }

    return {
        iTotalRecords: getPagination.pagination.totalRecords,
        iTotalDisplayRecords: getPagination.pagination.totalRecords,
        aaData: getPagination.data
    };
};

// Valid longitude values are between -180 and 180, both inclusive.
//Valid latitude values are between -90 and 90 (both inclusive).
const validateCoordinates = coordinates => {
    if (Array.isArray(coordinates) && coordinates.length === 2) {
        coordinates[0] = parseFloat(coordinates[0]);
        coordinates[1] = parseFloat(coordinates[1]);
        return (coordinates[0] >= -180 && coordinates[0] <= 180) && (coordinates[1] >= -90 && coordinates[1] <= 90);
    } else if (!isNaN(coordinates.lat) && !isNaN(coordinates.lng)) {
        coordinates.lat = parseFloat(coordinates.lat);
        coordinates.lng = parseFloat(coordinates.lng);
        return (coordinates.lng >= -180 && coordinates.lng <= 180) && (coordinates.lat >= -90 && coordinates.lat <= 90);
    } else if (!isNaN(coordinates.lat) && !isNaN(coordinates.long)) {
        coordinates.lat = parseFloat(coordinates.lat);
        coordinates.long = parseFloat(coordinates.long);
        return (coordinates.long >= -180 && coordinates.long <= 180) && (coordinates.lat >= -90 && coordinates.lat <= 90);
    } else if (!isNaN(coordinates.latitude) && !isNaN(coordinates.longitude)) {
        coordinates.latitude = parseFloat(coordinates.latitude);
        coordinates.longitude = parseFloat(coordinates.longitude);
        return (coordinates.longitude >= -180 && coordinates.longitude <= 180) && (coordinates.latitude >= -90 && coordinates.latitude <= 90);
    } else {
        return false;
    }
};

const zipCodeDistance = (zipCode, zipCodeParam) => {
    return zipcodes.distance(zipCode, zipCodeParam)
}


module.exports = {
    paginateProvider,
    ajaxDataProvider,
    isValidPage,
    perPageLimit,
    isValidObject,
    validateCoordinates,
    request,
    zipCodeDistance,
    paginateProviderWhenZipCodeProvided
};
