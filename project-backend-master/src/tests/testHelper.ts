export function sleep(amount: number) {
    const time = (Math.floor(Date.now() / 1000) + amount)
    
    /*eslint-disable */ 
    while (Math.floor(Date.now() / 1000) < time) {
    }
    /* eslint-enable */

    return {};
}
  