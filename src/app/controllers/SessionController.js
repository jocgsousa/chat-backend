import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth';
import User from '../models/User';

class SessionController {
    async store(req, res, next) {
        const isUser = await User.findOne({
            where: {
                nick: req.body.nick,
            },
        });

        if (!isUser) {
            return res.status(401).json({ error: 'Usuário não existe!' });
        }

        if (!(await isUser.checkPassword(req.body.password))) {
            return res.status(401).json({ error: 'Senha inválida' });
        }

        const { id, nick, name } = isUser;

        req.session = {
            user: {
                id,
                nick,
                name,
            },
            token: jwt.sign({ id }, authConfig.secret, {
                expiresIn: authConfig.expiresIn,
            }),
        };
        return next();
    }
}

export default new SessionController();
