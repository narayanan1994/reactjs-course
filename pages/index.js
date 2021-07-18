import Head from "next/head";
import { Fragment } from "react";
import MeetupList from "../components/meetups/MeetupList";
// below import we are only using for getStaticProps method, which is server side code,
// so nextjs will bundle the below import with the client side bundle
import { MongoClient } from "mongodb";

function HomePage(props) {
  return (
    <Fragment>
      <Head>
        <title>React Meetups</title>
        <meta
          name="description"
          content="Browse a huge list of highly active React meetups!"
        />
      </Head>
      <MeetupList meetups={props.meetups} />
    </Fragment>
  );
}

// // this executes before the component function
// // using only getStaticProps() with props - is SSG(Static Site Generation)
// export async function getStaticProps() {
//   // fetch data from an API
//   return {
//     props: {
//       meetups: DUMMY_MEETUPS
//     }
//   }
// }

// // this executes before the component function
// // using getStaticProps() with props, revalidate - is ISR(Incremental Static Regeneration)
export async function getStaticProps() {
  // fetch data from an API
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
  const meetups = await meetupsCollection.find().toArray(); // will get all the documents
  // console.log(meetups); // these are server side logs, printed in terminal
  client.close();
  return {
    props: {
      meetups: meetups.map((meetup) => ({
        title: meetup.title,
        image: meetup.image,
        address: meetup.address,
        id: meetup._id.toString(),
      })),
    },
    revalidate: 1, // here the props will be regenerated for every 1sec, on the server and generates pre-rendered page
  };
}

// this executes before the component function
// this prepares the props for every incoming server request
// drawback is we have to wait for the page to be generated in server and then only it is served to client
// export async function getServerSideProps(context) {
//   const req = context.req; // access to request object
//   const res = context.res; // access to response object

//   return {
//     props: {
//       meetups: DUMMY_MEETUPS
//     }
//   }
// }

// comparison - getStaticProps() vs getServerSideProps()
// getStaticProps() is faster compared to getServerSideProps()
// getStaticProps() - page is pre-rendered and can also be cached
// getServerSideProps() can be used in below scenarios
//  - when we want access to request obj
//  - data is always dynamic to be regenerated for every req
// both getStaticProps() and getServerSideProps(), will have context as arg, the difference is that
//  - the getStaticProps(), context will have params as context property
//  - the getServerSideProps(), context will have req,res as context property
export default HomePage;
