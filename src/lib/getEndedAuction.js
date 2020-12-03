import AWS from 'aws-sdk'
const dynamodb = new AWS.DynamoDB.DocumentClient();
export async function getAuctions() {
    const now = new Date();
    const parama = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= now',
        ExpressionAttributeValues:{
            ':status': 'OPEN',
            ':now' : now.toISOString()
        },
        ExpressionAttributeNames:{
            '#status': 'status'
        }
    }

    const result = await dynamodb.query(params).promise();
    return result.Items;
}
