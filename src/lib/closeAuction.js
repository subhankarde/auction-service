import AWS from 'aws-sdk'

export async function closeAuction(auction){
    const sqs = new AWS.SQS();
    const dynamodbClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: process.env.AUCTION_TABLE_NAME,
        Key: {id: auction.id},
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues:{
            ':status':'CLOSED'
        },
        ExpressionAttributeNames:{
            '#status':'status'
        }
    }

    await dynamodbClient.update(params).promise();
    const { title, seller, highestBid } = auction;
    const { amount, bidder } = highestBid;

    if (amount === 0) {
        await sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: 'No bids on your auction item :(',
                recipient: seller,
                body: `Oh no! Your item "${title}" didn't get any bids. Better luck next time!`,
            }),
        }).promise();
        return;
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'Your item has been sold!',
            recipient: seller,
            body: `Woohoo! Your itme "${title}" has been sold for $${amount}.`,
        }),
    }).promise();

    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'You won an auction!',
            recipient: bidder,
            body: `What a great deal! You got yourself a "${title}" for $${amount}.`,
        }),
    }).promise();

    return Promise.all([notifySeller, notifyBidder]);
}