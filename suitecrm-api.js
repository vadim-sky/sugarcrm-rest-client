/**
 * Created by user on 28/01/2016.
 */
"use strict";

/* SugarCRM REST API module in node.js */
var request = require('request');
var Q = require('q');

/* Global */

var apiURL  = "";
var login   = "";
var passwd  = "";
var sessionID  = "";


/* Config Initialisation */
var init = function (initArray) {
    apiURL = initArray.apiURL;
    login =  initArray.login;
    passwd = initArray.passwd;
};
exports.init = init;


/* Show Config Info */
var configInfo = function (initArray) {

    return {
        apiURL: apiURL
        ,login : login
        ,passwd : passwd
    }
};
exports.configInfo = configInfo;


/* get a session ID */
exports.login = function () {
    var deferred = Q.defer();
    var subargs = {
        user_auth: {
            "user_name" : login,
            "password"  : passwd,
            encryption:'PLAIN'
        },
        application: "SugarCRM-API"
    };

    var subargsInString = JSON.stringify(subargs);

    var data = {
        method: "login",
        input_type: "JSON",
        response_type: "JSON",
        rest_data: subargsInString
    };

    request.post(apiURL, { form: data }, function(e,r,body){
        var responseData = JSON.parse(body);
        sessionID = responseData.id;
        deferred.resolve(responseData);
    });

    return deferred.promise;
}



/* pure POST call function */
function call (method, parameters) {
    var deferred = Q.defer();
    var data = {
        method: method,
        input_type: "JSON",
        response_type: "JSON",
        rest_data: JSON.stringify(parameters)
    };

    request.post(apiURL, { form: data }, function(e,r,body){
        try {
            var res = JSON.parse(body);
            deferred.resolve(res);
        } catch (e) {
            deferred.reject(body);
        }
    })

    return deferred.promise;
}

var getLeadFields = function  () {
    var deferred = Q.defer();
    var parameters = {
        session: sessionID,
        module_name: "Leads",
        select_fields: [
            "name",
        ]
    };

    call("get_module_fields", parameters).then(
            function(result) {
                deferred.resolve(result);
            },
            function(result) {
                deferred.reject(result);
            }
        );
    return deferred.promise;
};


var appendLead = function  (email) {
    var deferred = Q.defer();
    var parameters = {
        session: sessionID,
        module_name: "Leads",
        name_value_list: [
            {name: "last_name", value: "REST-API"},
            {name: "email1", value: email},
            {name: "lead_source", value: "blog"},
            {name: "lead_source_description", value: "Blog: Weekly"},
            //{name: "email_addresses",
            //    //Example: 'link_name_to_fields_array' => array(array('name' => 'email_addresses', 'value' => array('id', 'email_address', 'opt_out', 'primary_address')))
            //    value: [
            //            {name: "email_address", value: email},
            //            {name: "opt_out", value: 1},
            //            {name: "primary_address", value: 1}
            //     ]
            //},
            {name: "description", value: "The lead was created from BLOG"},
        ]
    };

    call("set_entry", parameters).then(
        function(result) {
            deferred.resolve(result);
        },
        function(result) {
            deferred.reject(result);
        }
    );
    return deferred.promise;
};

var leads = function  () {
    var deferred = Q.defer();
    var parameters = {
        session: sessionID,
        module_name: "Leads",
        query: "",
        order_by : '',
        offset : '0',
        max_results: -1,
        link_name_to_fields_array: [
            {name: "email_addresses", value: ['email_address','opt_out','primary_address']
            }
        ],

        select_fields : [ 'id' ,'name', 'description'],
        Favorites: false
        //select_fields : [ 'id' ,'name'],
        //deleted : '0'
    };
    //Favorites: false,
    //    //link_name_to_fields_array: [
    //    //    {name: "email_addresses",
    //    //     value: ['email_address','opt_out','primary_address']
    //    //    }
    //    //],
    //    select_fields : [ 'id' ,'name'],
    //    deleted : '0'
    call("get_entry_list", parameters).then(
        function(result) {
            deferred.resolve(result);
        },
        function(result) {
            deferred.reject(result);
        }
    );
    return deferred.promise;
};



exports.leads = leads;
exports.appendLead = appendLead;
exports.getLeadFields = getLeadFields;
exports.call = call;














