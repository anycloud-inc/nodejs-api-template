import Moralis from 'moralis/node'

export const moralisClient = {
  getEthAddress: async (sessionToken: string): Promise<string | null> => {
    const sessionQuery = new Moralis.Query('_Session')
    sessionQuery.equalTo('sessionToken', sessionToken)
    const session = await sessionQuery.first({ useMasterKey: true })
    if (session == null) return null

    const userId = session.get('user').id
    const userQuery = new Moralis.Query('_User')
    userQuery.equalTo('objectId', userId)
    const user = await userQuery.first({ useMasterKey: true })
    if (user == null) return null

    return user.get('ethAddress')
  },
}
