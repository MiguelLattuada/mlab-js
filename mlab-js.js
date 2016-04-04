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
            
            xhr.open('POST', url, true);
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
        mlab.db = properties.db || mlab.db;
        mlab.collection = properties.collection || mlab.collection;
        mlab.cluster = properties.cluster || mlab.cluster;
    };
    
    // GET: List all databases
    mlab.list_databases = function() {
        return request.get(
            mlab.base_url.concat(mlab.database_path, '?'),
            {
                apiKey: mlab.api_key
            }
        );
    };
    
    // GET: list all databases by cluster id
    mlab.list_databases_by_cluster = function(cluster_id) {
        return request.get(
            mlab.base_url.concat(mlab.cluster_path, '?')
                .replace(/{cluster-id}/gi, cluster_id || mlab.cluster),
            {
                apiKey: mlab.api_key
            }
        )  
    };
    
    // GET: List of collections for a given database
    mlab.list_collections = function(db_id) {
        return request.get(
            mlab.base_url.concat(mlab.collection_path, '?')
                .replace(/{database-id}/gi, db_id || mlab.db),
            {
                apiKey: mlab.api_key
            }
        );
    };
    
    // GET: list of documents for a given db and collection
    mlab.list_documents = function(db_id, collection_id) {
        return request.get(
            mlab.base_url.concat(mlab.documents_path, '?')
                .replace(/{database-id}/gi, db_id || mlab.db)
                .replace(/{collection-id}/gi, collection_id || mlab.collection),
            {
                apiKey: mlab.api_key
            }
        );
    };
    
    // GET: list documents for a given query
    mlab.query_documents = function(query_options, db_id, collection_id) {
        query_options.apiKey = mlab.api_key;
        
        return request.get(
            mlab.base_url.concat(mlab.documents_path, '?')
                .replace(/{database-id}/gi, db_id || mlab.db)
                .replace(/{collection-id}/gi, collection_id || mlab.collection),
            query_options
        );
    };
    
    // POST: create collection, this is just a convention
    mlab.create_collection = function(db_id, collection_id) {
        return request.post(
            mlab.base_url.concat(mlab.documents_path, '?')
                .replace(/{database-id}/gi, db_id || mlab.db)
                .replace(/{collection-id}/gi, collection_id || mlab.collection),
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
    
    // POST: insert document into collection
    mlab.insert_document = function(doc_body, db_id, collection_id) {
        return request.post(
            mlab.base_url.concat(mlab.documents_path, '?')
                .replace(/{database-id}/gi, db_id || mlab.db)
                .replace(/{collection-id}/gi, collection_id || mlab.collection),
            {
                params: {
                    apiKey: mlab.api_key
                },
                body: doc_body
            }
        );
    };
    
    return mlab;
};