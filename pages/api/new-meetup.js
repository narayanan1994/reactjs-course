// /api/new-meetup
// req - request obj
// res - response obj
// POST /api/new-meetup
import { MongoClient } from "mongodb";

// nextjs will trigger below func, when request reaches this path /api/new-meetup
async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;

    // here in below connection string we name/point to our db 'meetups', if it is not present it will create on the fly
    const client = await MongoClient.connect(
      "mongodb+srv://narayanan:narayanan@cluster0.wu82z.mongodb.net/meetups?retryWrites=true&w=majority"
    );
    const db = client.db();
    // mongodb is a nosql database, that works with collections full of documents
    // collection is equivalent to tables in sql
    // documents is equivalent to entries in table
    // here we try to get meetups collection under meetups database
    // if collection not present it will create on the fly
    const meetupsCollection = db.collection("meetups");
    // the document is just one javascript object
    const result = await meetupsCollection.insertOne(data); // to insert one document
    // console.log(result); // these are server side logs, printed in terminal
    client.close();

    res.status(201).json({ message: "Meetup inserted!" });
  }
}

export default handler;
