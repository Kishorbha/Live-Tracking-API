class controller {

    constructor() {
        //
    }

    static configs(){
        return require('../config/index')
    }

    static enums(){
        return require('../config/enumVariables')
    }

    static constants(){
        return require('../constants/lang')
    }

    static dbEnums(){
        return require('../constants/db')
    }

    configs(){
        return controller.configs()
    }

    enums(){
        return controller.enums()
    }

    constants(){
        return controller.constants()
    }

    dbEnums(){
        return controller.dbEnums()
    }

    test(){
        console.log('test')
    }
}

module.exports = controller