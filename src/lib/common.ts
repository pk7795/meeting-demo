export const generateRandomString = (length: number) => {
  const date = Date.now().toString()

  let charset = ''
  charset += '1234567890'
  charset += 'abcdefghijklmnopqrstuvwxyz'
  charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  charset += date

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}
