import njwt from 'njwt';
import repository from '../repositories/repository';
const bcrypt = require('bcrypt');

const {
  APP_SECRET = 'secret' } = process.env;

const encodeToken = (tokenData) => {
  return njwt.create(tokenData, APP_SECRET).compact();
}

const decodeToken = (token) => {
  return njwt.verify(token, APP_SECRET).setExpiration(new Date().getTime() + 86400000).body; //24 hrs
}

export const authMiddleware = async (req, res, next) => {
  const token = req.header('Access-Token');
  if (!token) {
    return next();
  }

  try {
    const decoded = decodeToken(token);
    const { userId } = decoded;
    const user = await repository.getUserById(userId)
    if (user) {
      console.log('found user!');
      req.userId = userId;
    }
  } catch (e) {
    return next();
  }
  next();
};

export const authenticated = (req, res, next) => {
  if (req.userId) {
    return next();
  }

  res.status(401);
  res.json({ error: 'User not authenticated' });
}

const returnInvalidCredentials = (res) => {
  res.status(401);
  return res.json({ error: 'Invalid username or password' });

}

export const login = async (req, res) => {
  const { username, password } = req.body;


  const user = await repository.getUserByUsername(username)

  if (!user) {
    returnInvalidCredentials(res)
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      const accessToken = encodeToken({ userId: user.id });
      return res.json({ accessToken });
    } else {
      return returnInvalidCredentials(res);
    }
  });
}