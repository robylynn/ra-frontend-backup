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
db.createUser({user:"r2",pwd:"password",roles:[{role:"dbAdmin",db:"carbonator_data"}, { role: 'readWrite', db: 'carbonator_data' }],mechanisms:[ 'SCRAM-SHA-1', 'SCRAM-SHA-256' ]})
```

Another example connection string
`mongodb://r2:password@ra_database:27017/ra_data`

## Websockets in Next.JS
Use the NEXT ws patch: https://github.com/apteryxxyz/next-ws