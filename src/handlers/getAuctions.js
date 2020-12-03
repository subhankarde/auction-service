import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware'
import validator from '@middy/validator'
import getAuctionsSchema from '../lib/schemas/getAuctionSchema'


const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
async function getAuctions(event, context) {
const { status } = event.queryStringParameters
    let auctions
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
            ':status': status
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }
    try {
        const result = dynamoDBClient.query(params).promise();
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

export const handler = commonMiddleware(getAuctions).use(validator({ inputSchema: getAuctionsSchema, useDefaults: true }))