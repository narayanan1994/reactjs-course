import Head from "next/head";
import { Fragment } from "react";
import MeetupDetail from "../../components/meetups/MeetupDetail";
// below import we are only using for getStaticProps method, which is server side code,
// so nextjs will bundle the below import with the client side bundle
import { MongoClient, ObjectId } from "mongodb";

function MeetupDetails(props) {
  return (
    <Fragment>
      <Head>
        <title>{props.meetupData.title}</title>
        <meta name="description" content={props.meetupData.description} />
      </Head>
      <MeetupDetail
        title={props.meetupData.title}
        image={props.meetupData.image}
        address={props.meetupData.address}
        description={props.meetupData.description}
      />
    </Fragment>
  );
}

// getStaticPaths() must be included if we are using dynamic page like [query].js and also getStaticProps()
// its not required if we use getServerSideProps()
// its not required if we dont use neither getStaticProps() nor getServerSideProps()
// this func is used to pre-generate page for the multiple combo of paths with meetupId
// and during run time if user enters any meetupId that is not from below combo, user is redirected to 404 page
// fallback: false - it indicates all combo of paths, this tells react that if user enters any meetupId/any-value other than combo then redirected to 404page
// fallback: true - this allows react to try to get the page, dynamically with params, on the fly when getting request
export async function getStaticPaths() {
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
  const meetups = await meetupsCollection.find({}, { _id: 1 }).toArray(); // here first arg is empty obj to indicate we need all document,
  //   console.log(meetups); // these are server side logs, printed in terminal
  client.close();

  // fallback: false - it indicates all combo of paths, this tells react that if user enters any meetupId/any-value other than combo then redirected to 404page
  // fallback: true - this allows react to try to get the page, dynamically with params, on the fly when getting request
  // when fallback: true - and new set of route request comes which is not present in combo, it will prerender page first with empty content and then after generated it will load
  // when fallback: 'blocking' - it will not pre-render immediately, it will wait for page to be generated and then it will cache and render 
  // in both cases, fallback:true or fallback:'blocking' - it will not throw 404page
  return {
    fallback: 'blocking',
    paths: meetups.map((meetup) => ({
      params: { meetupId: meetup._id.toString() },
    })),
  };
}

// // this executes before the component function
// // using getStaticProps() with props, revalidate - is ISR(Incremental Static Regeneration)
export async function getStaticProps(context) {
  // fetch data from a single meetup
  const meetupId = context.params.meetupId;
  // console.log(meetupId);

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
  const selectedMeetup = await meetupsCollection.findOne({
    _id: ObjectId(meetupId),
  });
  //   console.log(selectedMeetup); // these are server side logs, printed in terminal
  client.close();

  return {
    props: {
      meetupData: {
        id: selectedMeetup._id.toString(),
        title: selectedMeetup.title,
        image: selectedMeetup.image,
        address: selectedMeetup.address,
        description: selectedMeetup.description,
      },
    },
    revalidate: 1, // here the props will be regenerated for every 1sec, on the server and generates pre-rendered page
  };
}

export default MeetupDetails;
