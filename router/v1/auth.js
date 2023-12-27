const express = require('express')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')

const router = express.Router()

const { authenticate } = require('ldap-authentication');
const opts = {
  ldapOpts: {
    url: 'ldap://10.10.0.220:389',
    connectTimeout: 5000
  },
  adminDn: 'cn=admin,dc=vnu,dc=vn',
  adminPassword: '13579',
  userSearchBase: 'ou=dhcn,ou=canbo,dc=vnu,dc=vn',
  usernameAttribute: 'uid'
  //username: 'tunghx',
  //userPassword: 'remurd118',
}

async function doAuthenticate(uid, password) {
  const options = Object.assign({username:uid, userPassword: password}, opts);
  try {
      let user = await authenticate(options);
      return !!user;
  }
  catch(e) {
      console.error(e);
      return false;
  }
}
router.post('/login', async (req, res, next) => {
    const username = req.getParam('username')
    const password = req.getParam('password')

    const A_YEAR = 24 * 60 * 60 * 30 * 365

    const admin = config.get(username)

    if (!admin || username !== admin.username) {
        return res.error('username or password mistake')
    }
    if ( admin.hashPassword) {
        const checkPass = bcrypt.compareSync(password, admin.hashPassword)

        if (!checkPass) {
            return res.error('username or password mistake')
        }
    }
    else {
        let loginSuccess = await doAuthenticate(username, password)
        if (!loginSuccess) {
            return res.error('Failed to authenticate');
        }
    }

    const token = jwt.sign({role: admin.role || 'user'}, config.get('tokenSecretKey'), {expiresIn: A_YEAR});

    res.success( { token, role: admin.role } )
})


module.exports = router
