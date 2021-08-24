import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import Message from '../app/models/Message';
import User from '../app/models/User';

const models = [Message, User];

class DatabaseConnection {
    constructor() {
        this.init();
    }

    init() {
        this.connection = new Sequelize(databaseConfig);

        models.map((model) => model.init(this.connection));
    }
}

export default new DatabaseConnection();
