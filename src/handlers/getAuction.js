import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()

export async function getAuctionById(id){
    let auction
    try {

        const result = await dynamoDBClient.get({
            TableName: process.env.AUCTION_TABLE_NAME,
            Key: { id }
        }).promise()
        auction = result.Item
    } catch (error) {
        console.error(error.message)
        throw new createHttpError.InternalServerError(error.message)
    }

    if (!auction) {
        throw new createHttpError.NotFound(`Auction with id "${id}" not found`)
    }

    return auction;
}

async function getAuction(event, context) {

 const { id } = event.pathParameters
 const auction = await getAuctionById(id)
 return {
    statusCode: 200,
    body: JSON.stringify(auction)
  }

}

export const handler = commonMiddleware(getAuction)