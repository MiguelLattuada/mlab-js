var mLab_client = function(mlab) {
    // 'use strict';
    
    if (!mlab || !mlab.api_key) throw Error('Api key needed to create an instance of mLab_client');
    
    // Http request methods, private
    var request;
    
    (function(request) {
        
        // Create promise for an XMLHttpRequest
        var getPromiseFor = function(xhr) {
            
            var promise = new Promise(function(resolve, reject) {
                xhr.onload = function(event) {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(this.response);
                    } else {
                        reject(this.statusText);
                    }
                };
                xhr.onerror = function(event) {
                    reject(this.statusText);
                };
            });
            
            return promise;
        };
        
        // Format URL parameters from js object to url style
        request.formatParameters = function(params) {
            return Object.keys(params)
                .map(function(key) {
                    if(typeof params[key] != 'string') params[key] = JSON.stringify(params[key]) 
                    return key.concat('=').concat(params[key]);
                }).join('&');
        };
        
        // Get request
        request.get = function(url, params) {
            var xhr = new XMLHttpRequest();

            if (params) url = url.concat(request.formatParameters(params));
            
            xhr.open('GET', url, true);
            xhr.send();

            return getPromiseFor(xhr);
        };
        
        // Post request
        request.post = function(url, options) {
            var xhr = new XMLHttpRequest();
            
            if (options.params) url = url.concat(request.formatParameters(options.params));
            if (options.performPut) type = 'PUT';
            
            xhr.open(type || 'POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(options.body));
            
            return getPromiseFor(xhr);
        };

    })(request || (request = {}));

    // Base url
    mlab.base_url = mlab.base_url || 'https://api.mlab.com/api/1';

    // All databases _path
    mlab.database_path = mlab.database_path || '/databases';

    // All databases for a given cluster-id _path
    mlab.cluster_path = mlab.cluster_path || '/clusters/{cluster-id}/databases';

    // All collections for a given database-id _path
    mlab.collection_path = mlab.collection_path || mlab.database_path.concat('/{database-id}/collections');
    
    // All documents for a given collection-id _path
    mlab.documents_path = mlab.documents_path || mlab.collection_path.concat('/{collection-id}');
    
    // Set db, and collection to work with
    mlab.use = function(properties) {
        mlab.config = mlab.config || {};
        mlab.config.db = properties.db || mlab.config.db;
        mlab.config.collection = properties.collection || mlab.config.collection;
        mlab.config.cluster = properties.cluster || mlab.config.cluster;
    };
    
    // Database submodule
    (function(database) {
        
        // GET (Private): list all databases by cluster id
        var getDbsFromCluster = function(cluster_id) {
            return request.get(
                mlab.base_url.concat(mlab.config.cluster_path, '?')
                    .replace(/{cluster-id}/gi, cluster_id || mlab.config.cluster),
                {
                    apiKey: mlab.api_key
                }
            );
        };
        
        // GET: list all databases from default cluster or given cluster
        database.list = function(cluster_id) {
            if (cluster_id) return getDbsFromCluster(cluster_id);
            
            return request.get(
                mlab.base_url.concat(mlab.database_path, '?'),
                {
                    apiKey: mlab.api_key
                }
            );
        };
        
    })(mlab.database || (mlab.database = {}));
    
    // Collection submodule
    (function(collection) {
        
        // GET: List of collections for a given database
        collection.list = function(db_id) {
            return request.get(
                mlab.base_url.concat(mlab.collection_path, '?')
                    .replace(/{database-id}/gi, db_id || mlab.config.db),
                {
                    apiKey: mlab.api_key
                }
            );
        };
        
        // POST: create collection, this is just a convention
        collection.create = function(collection_id, db_id) {
            return request.post(
                mlab.base_url.concat(mlab.documents_path, '?')
                    .replace(/{database-id}/gi, db_id || mlab.config.db)
                    .replace(/{collection-id}/gi, collection_id),
                {
                    params: {
                        apiKey: mlab.api_key
                    },
                    body: {
                        x: 1
                    }
                }
            );
        };
        
        
    })(mlab.collection || (mlab.collection = {}));
    
    // Documents submodule
    (function(document) {
        
        // GET: list of documents for a given db and collection
        document.list = function(collection_id, db_id) {
            return request.get(
                mlab.base_url.concat(mlab.documents_path, '?')
                    .replace(/{database-id}/gi, db_id || mlab.config.db)
                    .replace(/{collection-id}/gi, collection_id || mlab.config.collection),
                {
                    apiKey: mlab.api_key
                }
            );
        };
        
        // GET: list documents for a given query
        document.query = function(query_options, collection_id, db_id) {
            query_options.apiKey = mlab.api_key;
            
            return request.get(
                mlab.base_url.concat(mlab.documents_path, '?')
                    .replace(/{database-id}/gi, db_id || mlab.config.db)
                    .replace(/{collection-id}/gi, collection_id || mlab.config.collection),
                query_options
            );
        };
        
        // POST: insert document/s into collection
        document.create = function(doc_body, collection_id, db_id) {
            return request.post(
                mlab.base_url.concat(mlab.documents_path, '?')
                    .replace(/{database-id}/gi, db_id || mlab.config.db)
                    .replace(/{collection-id}/gi, collection_id || mlab.config.collection),
                {
                    params: {
                        apiKey: mlab.api_key
                    },
                    body: doc_body
                }
            );
        };
        
        // PUT: update document/s that match query
        document.update = function(query_options, doc_body, collection_id, db_id) {
            query_options.apiKey = mlab.api_key;
            
            return request.post(
                mlab.base_url.concat(mlab.documents_path, '?')
                    .replace(/{database-id}/gi, db_id || mlab.config.db)
                    .replace(/{collection-id}/gi, collection_id || mlab.config.collection),
                {
                    params: query_options,
                    body: {
                        $set: doc_body
                    },
                    performPut: true
                }
            );  
        };
        
        // PUT: replace document/s that match query
        document.replace = function(query_options, doc_body, collection, db_id) {
            query_options.apiKey = mlab.api_key;
            if(!(doc_body instanceof Array)) return; //Check this!
            
            return request.post(
                mlab.base_url.concat(mlab.documents_path, '?')
                    .replace(/{database-id}/gi, db_id || mlab.config.db)
                    .replace(/{collection-id}/gi, collection_id || mlab.config.collection),
                {
                    params: query_options,
                    body: doc_body,
                    performPut: true
                }
            );
        };
        
        // GET: list one document by id 
        document.get = function(id, collection_id, db_id) {
            return request.get(
                mlab.base_url.concat(mlab.documents_path, '/', id, '?')
                    .replace(/{database-id}/gi, db_id || mlab.config.db)
                    .replace(/{collection-id}/gi, collection_id || mlab.config.collection),
                {
                    apiKey: mlab.api_key
                }
            );
        };
    
    })(mlab.document || (mlab.document = {}));
    
    return mlab;
};