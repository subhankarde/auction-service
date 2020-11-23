import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import httpErrors from 'http-errors'
import commonMiddleware from '../lib/commonMiddleware'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
async function createAuction(event, context) {

  const endDate = new Date()
  const { title } = event.body
  const now = new Date()
  endDate.setHours(now.getHours() + 1)
  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    endingAt: endDate.toISOString(),
    highestBid:{
      amount: 0
    },
    createdAt: now.toISOString()
  }

  try {
    await dynamoDBClient.put({
      TableName: process.env.AUCTION_TABLE_NAME,
      Item: auction
    }).promise()
  } catch (error) {
    console.error(error)
    throw new httpErrors.InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction)
  }
}

export const handler = commonMiddleware(createAuction)
