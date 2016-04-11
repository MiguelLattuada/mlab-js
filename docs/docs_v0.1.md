##Documentation

###Table of contents
- [Create mLab_client instance](#mlab_clientobject)
- [Use database submodule](#new-mlab_clientobjectdatabase)

###mLab\_client({Object})
_Constructor function_, creates a new instance of mLab_client that returns an object with all accessible methods.

__Parameters:__

name | state/type | description
--- | --- | ---
api_key | `[Required]{String}` | mLab api key
base_url | `[Optional]{String}`|  mLab REST API endpoint
database_path | `[Optional]{String}` | mLab database endpoint url path
cluster_path | `[Optional]{String}` | mLab cluster endpoint url path
collection_path | `[Optional]{String}` | mLab collection endpoint url path
documents_path | `[Optional]{String}` | mLab documents endpoint url path
config | `[Optional]{Object}` | base initialization config
config.db | `[Optional]{String}` | default selected database
config.cluster | `[Optional]{String}` | default selected cluster
config.collection | `[Optional]{String}` | default selected collection
database | `[Optional]{Object}` | object with extra data/functionality for database submodule. Avoid use `list` as a property
collection | `[Optional]{Object}` | object with extra data/functionality for collection submodule. Avoid use `list`, `create` as a property
document | `[Optional]{Object}` | object with extra data/functionality for document submodule. Avoid use `list`, `query`, `create`, `update`, `replace` as a property

__Returns: {Object}__

Every property added to the _parameters_ object, is returned, as well as new members are added to `parameters.database`, `parameters.collection`, `parameters.document`. Added method _use_.

name | type | parameters | description
--- | --- | --- | ---
use | `{Function}`| `[Config]{Object}` | set or change your current config object. `{ db: 'evs', collection: 'testing' }`  

__Usage__:

```javascript
var client = new mLab_client({ api_key: 'YOUR_API_KEY' });

//Set to work with db: my_db, and collection: my_collection.
client.use({
    db: 'my_db',
    collection: 'my_collection'
});
```

###new mLab_client({object}).database
_Object_, database submodule, provides methods to work with mLab database REST API endpoint.

__Methods:__ 

name | parameters | description | return
--- | --- | --- | ---
list | `[Cluster ID]{String}` | list all databases from default cluster or given cluster | `{Promise}`

__Usage:__

```javascript
var client = new mLab_client({ api_key: 'YOUR_API_KEY' });

//List all databases at default cluster
client.database.list().then(function(result){
    //[result]{Array}
    console.log(result);
});
```