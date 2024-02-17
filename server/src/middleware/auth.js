const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const {
    forBidden,
    unauthorized,
    internalServerError,
} = require('../utils/handleResp');
import { log } from 'console';
import * as userInChatroomServices from '../services/userInChatroom';
class Auth {
    origin(req, res, next) {
        const token = req.headers.token;
        if (!token) {
            return unauthorized(`You're not authenticated`, res);
        }
        const accessToken = token.split(' ')[1];
        jwt.verify(
            accessToken,
            fs.readFileSync(path.join(__dirname, '..', 'key', 'publickey.crt')),
            { algorithm: 'RS256' },
            (err, user) => {
                if (err) {
                    return forBidden('Token is not valid', res);
                }
                req.user = user;
                next();
            }
        );
    }
    isSeftUser(req, res, next) {
        new Auth().origin(req, res, () => {
            if (
                req.user.id == req.params.userId ||
                req.user.roleValue == 'Admin'
            )
                next();
            else return forBidden('You are not allowed to access', res);
        });
    }
    isInChatroom(req, res, next) {
        new Auth().origin(req, res, async () => {
            try {
                const isInChatroom =
                    await userInChatroomServices.isExistUserInChatroom(
                        req.user.id,
                        req.params.chatroomId
                    );
                if (isInChatroom) next();
                else return forBidden('You are not allowed to access', res);
            } catch (error) {
                console.log(error);
                return internalServerError(res);
            }
        });
    }
    isAdmin(req, res, next) {
        new Auth().origin(req, res, () => {
            console.log(req.user);
            if (req.user.roleValue != 'Admin') {
                return forBidden('You are not allowed to access', res);
            }
            next();
        });
    }
    isModerator(req, res, next) {
        new Auth().origin(req, res, () => {
            if (req.user.roleValue != 'Moderator') {
                return forBidden('You are not allowed to access', res);
            }
            next();
        });
    }
}
export default new Auth();
