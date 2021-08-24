import { Op } from 'sequelize';

import User from '../models/User';

class UserController {
    async store(req, res, next) {
        const isUser = await User.findOne({
            where: {
                nick: req.body.nick,
            },
        });
        if (isUser) {
            return res.status(400).json({ error: 'Nick já cadastrado' });
        }
        const user = await User.create(req.body);
        req.user = user;
        return next();
    }

    async index(req, res, next) {
        const users = await User.findAll({
            where: {
                id: {
                    [Op.ne]: req.userId,
                },
            },
            attributes: ['id', 'name', 'nick'],
        });

        res.json(users);
    }
}

export default new UserController();
