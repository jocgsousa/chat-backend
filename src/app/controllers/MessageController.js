import Message from '../models/Message';

class MessageController {
    async store(req, res, next) {
        const message = await Message.create(req.body);
        req.msg = await message;
        return next();
    }
    async index(req, res) {
        const messages = await Message.findAll();
        return res.json(messages);
    }
}

export default new MessageController();
