import AWS from 'aws-sdk';

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
async function processAuction(event, context) {

  console.log('Processing auctions')
 
}

export const handler = processAuction
