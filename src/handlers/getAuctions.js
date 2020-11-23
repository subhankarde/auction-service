import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
async function getAuctions(event, context) {

    let auctions
    try {
        const result = await dynamoDBClient.scan({
            TableName: process.env.AUCTION_TABLE_NAME
        }).promise()
        auctions = result.Items
    } catch (error) {
        console.error(error.message)
        throw new createHttpError.InternalServerError(error.message)
    }

    return {
        statusCode: 200,
        body: JSON.stringify(auctions)
    }

}

export const handler = commonMiddleware(getAuctions)