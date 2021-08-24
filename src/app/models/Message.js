import Sequelize, { Model } from 'sequelize';

class Message extends Model {
    static init(sequelize) {
        super.init(
            {
                autor: Sequelize.INTEGER,
                receptor: Sequelize.INTEGER,
                message: Sequelize.TEXT,
            },
            { sequelize }
        );
        return this;
    }
}

export default Message;
