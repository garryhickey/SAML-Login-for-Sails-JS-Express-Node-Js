/**
 * SamlController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var saml2 = require('saml2-js');
var fs = require('fs');
var bodyParser = require('body-parser');

var sp_options = {
    entity_id: "<hostname><port>",
    //include these yourself or generate via puttygen
    private_key: fs.readFileSync("new_private.pem").toString(),
    certificate: fs.readFileSync("public.crt").toString(),
    assert_endpoint: "http://<hostname>:<port>/saml/assert"
  };


  var idp_options = {
    sso_login_url: "https://idp.ssocircle.com:443/sso/SSOPOST/metaAlias/publicidp",
    sso_logout_url: "https://idp.ssocircle.com:443/sso/IDPSloPost/metaAlias/publicidp",
    certificates: fs.readFileSync("ssocirclecert.crt").toString(),
  };

  var sp = new saml2.ServiceProvider(sp_options);

  var idp = new saml2.IdentityProvider(idp_options);

module.exports = {


    
    login : function(req, res) {

        sp.create_login_request_url(idp, {}, function(err, login_url, request_id) {
            if (err != null)
              return res.sendStatus(500);
              res.redirect(login_url);
          });

    },

    assert : function(req, res) {

        var options = {request_body: req.body, allow_unencrypted_assertion: true};
        sp.post_assert(idp, options, function(err, saml_response) {
             
            if (err != null)
                 console.log(err);
                   
 
    // Save name_id and session_index for logout
    // Note:  In practice these should be saved in the user session, not globally.
        var  name_id = saml_response.user.name_id;
        var session_index = saml_response.user.session_index;
         
         console.log(saml_response);
         console.log(name_id);

    res.view('success', {
        username : name_id
        
    });
  });

    },

    metadata : function (req, res) {

        var metadataFile = sp.create_metadata();

        fs.writeFileSync("../metadata.xml", metadataFile, function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log("The file was saved!");
        }); 

        res.type('application/xml');
    
        //res.send(sp.create_metadata());
        res.send(metadataFile);
    }
  

};

