try{
    require('dotenv').config();
    if( process.env.CLEARDB ) {
        const mongoose = require('mongoose');
        const config = require('./config');
        const {truncateDatabase} = require('./modules/truncateDatabase');
        mongoose.connect(config.dbConfig.uri, config.dbConfig.options).then(async () => {
            try {
                console.log('Clear database is ready !');
                await truncateDatabase();
                console.log('Database has been cleared !');
            } catch (e) {
                console.log('error while clearing database', e.message);
            } finally {
                process.exit();
            }
        }).catch((error) => {
            console.log('Unable to prepare for clear database', error.message);
            process.exit();
        });
    } else {
        console.log('this command is not allowed, please enable this command before you begin !!');
    }
} catch( e ){
    console.log('error while clearing database', e.message);
}
