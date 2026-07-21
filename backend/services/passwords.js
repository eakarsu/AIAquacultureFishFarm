const {pbkdf2Sync,timingSafeEqual,randomBytes}=require('node:crypto');const iterations=210000;
function hashPassword(password){if(typeof password!=='string'||password.length<12)throw new Error('Password must be at least 12 characters');const salt=randomBytes(16).toString('hex');const hash=pbkdf2Sync(password,salt,iterations,32,'sha256').toString('hex');return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;}
function verifyPassword(password,encoded){try{const [algorithm,count,salt,expected]=encoded.split('$');if(algorithm!=='pbkdf2_sha256')return false;const actual=pbkdf2Sync(password,salt,Number(count),32,'sha256');return timingSafeEqual(actual,Buffer.from(expected,'hex'));}catch{return false;}}
module.exports={hashPassword,verifyPassword};
