# Database setup

## Useful mongosh commands
Show all databases `show dbs`
Switch to the database we are using `use carbonator_data`
List collections `db.getCollectionNames()`
Drop database `use <database_name>; db.dropDatabase()`
Delete the development collection `db.collectionName.drop()`
Show data in collection `db.collectionName.find()`

### Install mongosh
https://www.mongodb.com/docs/mongodb-shell/install/

### Set up r2 user for writing records to the database
Start the `ra_database` container:
`./scripts/run_containers.sh -d`

Then log into the database and set up the databases and users
```
mongosh --port 27017
use ra_data
db.createUser({user:"r2",pwd:"password",roles:[{role:"dbAdmin",db:"ra_data"}, { role: 'readWrite', db: 'ra_data' }],mechanisms:[ 'SCRAM-SHA-1', 'SCRAM-SHA-256' ]})
```

## Accessing Data using the mongo UI
After the mongo UI container has been started, navigate to `<hostname>:5001`, where `<hostname>` is the IP or hostname of the machine running the container. Use the connection string `mongodb://r2:password@ra_database:27017/ra_data`. Selecting the `ra_data` database on the left will open the collections where data can be viewed. Note that nothing will be in the database until the backend starts and the lines to commit data in `ra_interface.py` are run.