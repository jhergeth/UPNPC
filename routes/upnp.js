/**
 * Created by joachim on 29.06.2015.
 */
var express = require('express');
var router = express.Router();

/**
 * initialize Java and connections to cling library
 * */
var java = require("java");
java.classpath.push("commons-lang3-3.1.jar");
java.classpath.push("commons-io.jar");
java.classpath.push("jars/mctrl.jar");
java.classpath.push("jars/cling-core-2.0.1.jar");
java.classpath.push("jars/seamless-http-1.1.0.jar");
java.classpath.push("jars/seamless-util-1.1.0.jar");
java.classpath.push("jars/seamless-xml-1.1.0.jar");
java.classpath.push("jars/cling-support-2.0.1.jar");

/**
 * start Java UPNP task
 */
var Main = java.import('mctrl.Main');
var theMain = null;
java.callStaticMethod('mctrl.Main', 'startIt()Lmctrl/Main;', function(err, results) {
    if(err) { console.error(err); return; }
    // results from doSomething
    theMain = results;
});


/* GET upnp page. */
router.get('/upnp', function(req, res, next) {
//  res.render('index', { title: 'Home' });

    if(req.query.op == 'search') {
        theMain.searchUDAServiceTypeSync(null);
        res.redirect('/upnp');
        return;
    }

    var serverNames = theMain.getDeviceNamesSync("ContentDirectory");
    var rendererNames = theMain.getDeviceNamesSync("AVTransport");
    var werte = req.session.werte;
    if (!werte) {
        werte = req.session.werte = {}
    }

    if(req.query.r)werte.rend = req.query.r;
    if(req.query.s)werte.serv = req.query.s;

    var dirs = null;
    var files = null;
    if(req.query.op == 'getdir'){
        var srv = theMain.getDeviceSync(werte.serv, "ContentDirectory");
        var dirCont = theMain.getDirContentSync(srv, req.query.id);
        if(dirCont){
            dirs = dirCont.getDirsSync();
            files = dirCont.getItemsSync();
            dirCont.printDirsSync();
            dirCont.printItemsSync();
        }
    }
    else if(werte.serv){
        var srv = theMain.getDeviceSync(werte.serv, "ContentDirectory");
        var dirCont = theMain.getDirContentSync(srv, "0");
        if(dirCont){
            dirs = dirCont.getDirsSync();
            files = dirCont.getItemsSync();
            dirCont.printDirsSync();
            dirCont.printItemsSync();
        }
    }
    if(dirs && dirs.length == 1 && dirs[0] == null){
        dirs = null;
    }
    if(files && files.length == 1 && files[0] == null){
        files = null;
    }



//    var dir = dirs.dirs;
    res.render('upnp', {
        'serv':werte.serv,
        'rend':werte.rend,
        'storage':serverNames,
        'renderer':rendererNames,
        'conts':dirs,
        'items':files,
        'path': ["."],
        'title':'UPnP-Browser'
    });
//  next();
});

/* GET json. */
router.get('/json', function(req, res, next) {
//  res.render('index', { title: 'Home' });

    res.render('upnp', {
        'serv':werte.serv,
        'rend':werte.rend,
        'storage':serverNames,
        'renderer':rendererNames,
        'conts':dirs,
        'items':files,
        'path': ["."],
        'title':'UPnP-Browser'
    });
//  next();
});

module.exports = router;
