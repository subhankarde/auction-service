import httpErrors from 'http-errors'
import getEndedAuctions from '../lib/getEndedAuction'
import closeAuctions from '../lib/closeAuction'

async function processAuction(event, context) {

  try{
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map(auction => closeAuctions(auction));
    await Promise.all(closePromises);
    return { closed: closePromises.length}
  }catch(error){
    console.error(error)
    throw new httpErrors.InternalServerError(error)
  }

  console.log('Auctions to close ', auctionsToClose);
}

export const handler = processAuction;