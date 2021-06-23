export default async function handler({ query: { ts } }, res) {
    // Format - https://api.coinbase.com/v2/prices/ETH-USD/spot?date=YYYY-MM-DD
    const then = await fetch(`https://api.coinbase.com/v2/prices/ETH-USD/spot?date=${ts}`).then(res => res.json())
    const d = new Date();
    const offset = d.getTimezoneOffset()
    const actualDate = new Date(d.getTime() - (offset*60*1000))
    const newTs = (actualDate.toISOString().split('T')[0])
    const today = await fetch(`https://api.coinbase.com/v2/prices/ETH-USD/spot?date=${newTs}`).then(res => res.json())
    res.status(200).json({ then: then.data, today: today.data })
  }