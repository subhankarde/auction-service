import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware'
import { getAuctionById } from './getAuction'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
async function placeBid(event, context) {

    const { id } = event.pathParameters
    const { amount } = event.body
    const auction = await getAuctionById(id)
    let updatedAuction

    if (amount <= auction.highestBid.amount){
        throw new createHttpError.Forbidden(`You bid must be higher than ${auction.highestBid.amount}`)
    }

    const params = {
        TableName: process.env.AUCTION_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount
        },
        ReturnValues: 'ALL_NEW'
    }
   
    try {

        const result = await dynamoDBClient.update(params).promise()
        updatedAuction = result.Attributes
    } catch (error) {
        console.error(error.message)
        throw new createHttpError.InternalServerError(error.message)
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction)
    }

}

export const handler = commonMiddleware(placeBid)