
## Features
- Add one or multiple files to a postgres database
- set image(s) as private; only accessible through an access code (which is hashed then stored)
- add tags and search by tags
- search by date

<br />

## Instructions 
1. download files
2. npm install for parent folder and also in client and server folders
3. add .env files; using the .env_samples as guide, add the details for the postgres installation on your machine
4. create table in your specified database using the following command in psql shell: `CREATE TABLE yourTableNameHere(id TEXT NOT NULL, name TEXT NOT NULL, folder TEXT NOT NULL, file TEXT NOT NULL, tags TEXT[], private BOOLEAN NOT NULL, accesscode TEXT, timestamp TIMESTAMP NOT NULL default CURRENT_TIMESTAMP, PRIMARY KEY(id) );` 
5. in the 'server' folder, create the folder to contain the images
6. `npm run dev` will start both client and server; Can use the sample client to perform all the functionalities of the api; or can also use something like Postman on the following end points



## Routes
- localhost/3000/add
  - this accepts a POST request of type form-data; it should contain key value pairs (or forms with input with names of) imageOrigin (type is a image file), imageTags, isPrivate (checkbox), accessCode. The only required one is imageOrigin.
- localhost/3000/get/byname/meta?targetName=&accessCode= 
  - this accepts a Get request with query string of targetName (name of image(s) that want to get) and accessCode (optional)
  - returns meta data for image (name, tag, and timestamp)
- localhost/3000/get/byname/img?targetName=&accessCode=
  - this accepts a Get request with query string of targetName (name of image(s) that want to get) and accessCode (optional)
  - returns img as base64 (can easily convert to image on frontend or try for yourself with https://codebeautify.org/base64-to-image-converter)
- localhost/3000/get/bytag/img?targetTag=&accessCode
  - this accepts a Get request with query string of tags separated by one single space and accessCode (optional)
  - returns the img(s) as base64
- localhost/3000/get/bytime/img?targetDate=yyyy-mm-dd&accessCode=
  - this accepts a Get request with query string of targetDate (uses postgres to parse date string into date data type; can accept string in format yyyy-mm-dd, or full ISO standard or UTC standard timestamps)
    - returns images as base64

<br />

## Dependencies 
1. express
2. multer
3. bcrypt
4. pg
5. cors
6. uuid
7. dotenv
8. concurrently
