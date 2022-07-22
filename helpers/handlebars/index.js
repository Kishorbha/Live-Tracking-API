const _ = require('lodash');

module.exports = {

    list: function (users) {
        let out = "<ul>";
        _.each(users, function (user, index) {
            out = out + "<li>" + user.email + "</li>";
        });

        return out + "</ul>";
    }

};