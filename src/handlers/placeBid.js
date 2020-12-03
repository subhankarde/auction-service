import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware'
import { getAuctionById } from './getAuction'
import placeBidSchema from '../lib/schemas/placeBidSchema'
import validator from '@middy/validator';

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
async function placeBid(event, context) {

    const { email } = event.requestContext.authorizer
    const { id } = event.pathParameters
    const { amount } = event.body
    const auction = await getAuctionById(id)
    let updatedAuction
    
    if (auction.seller === email){
        throw new createHttpError.Forbidden('You cannot bid on your own auctions!')
    }
    
    if (auction.highestBid.bidder === email){
        throw new createHttpError.Forbidden('You are alread the highest bidder!')
    }
    
    if(auction.status !== 'OPEN'){
        throw new createHttpError.Forbidden('You cannot bid on closed auctions!')
    }
    
    if (amount <= auction.highestBid.amount){
        throw new createHttpError.Forbidden(`You bid must be higher than ${auction.highestBid.amount}`)
    }

    const params = {
        TableName: process.env.AUCTION_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': eamil
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

export const handler = commonMiddleware(placeBid).use(validator({ inputSchema: placeBidSchema }))