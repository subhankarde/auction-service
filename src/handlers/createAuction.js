import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import httpErrors from 'http-errors'
import commonMiddleware from '../lib/commonMiddleware'
import createAuctionSchema from '../lib/schemas/createAuctionSchema'
import validator from '@middy/validator';

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
async function createAuction(event, context) {

  const { email } = event.requestContext.authorizer
  const endDate = new Date()
  const { title } = event.body
  
  console.log('Title ', title);

  const now = new Date()
  endDate.setHours(now.getHours() + 1)
  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    endingAt: endDate.toISOString(),
    createdAt: now.toISOString(),
    highestBid:{
      amount: 0
    },
    seller: email
  }

  try {
    await dynamoDBClient.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    }).promise()
  } catch (error) {
    console.error(error)
    throw new httpErrors.InternalServerError(error)
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction)
  }
}

export const handler = commonMiddleware(createAuction)
.use(validator({ inputSchema: createAuctionSchema }))