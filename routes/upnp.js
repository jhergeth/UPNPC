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
java.classpath.push("./jars/mctrl.jar");
java.classpath.push("./jars/cling-core-2.0.1.jar");
java.classpath.push("./jars/seamless-http-1.1.0.jar");
java.classpath.push("./jars/seamless-util-1.1.0.jar");
java.classpath.push("./jars/seamless-xml-1.1.0.jar");
java.classpath.push("./jars/cling-support-2.0.1.jar");

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

function getArray(a){
    var r = new Array();
    if(a){
        var c = 0;
        for(var i = 0; i < a.length; i++){
            r[c++] = {"id": a[i].getIdSync(), "title": a[i].getTitleSync()};
        }
    }

    return r;
}
function entry(d, f, i, t ){
    this.dirs = getArray(d);
    this.files = getArray(f);
    this.id = i;
    this.title = t;
    this.playlist = false;
}

function traverse(werte, id){
    var r = new Array();
    var e = werte.dTree[id];

    var idx = 0;
    if(e){
        for(var i=0; i < e.dirs.length; i++){
            var dt = e.dirs[i].title;
            var dk = e.dirs[i].id;
            r[idx++] = {
                "title": dt,
                "key": dk,
                "folder":true,
                "lazy":true,
                "children":traverse(werte, dk),
                "playlist": e.playList
            };
        }
        for(var i = 0; i < e.files.length; i++){
            r[idx++] = {
                "title": e.files[i].title,
                "key": e.files[i].id
            };
        }
        if(e.dirs.length == 0 && e.files.length != 0 ) {
            e.playlist = true;
        }
    }
    return r;
}

/* GET upnp page. */
router.get('/', function(req, res, next) {
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

    function getDirContent() {
        dirs = dirCont.getDirsSync();
        files = dirCont.getItemsSync();
        dirCont.printDirsSync();
        dirCont.printItemsSync();
        if (dirs && dirs.length == 1 && dirs[0] == null) {
            dirs = null;
        }
        if (files && files.length == 1 && files[0] == null) {
            files = null;
        }
    }

    if(req.query.op == 'getdir'){
        var srv = theMain.getDeviceSync(werte.serv, "ContentDirectory");
        var dirCont = theMain.getDirContentSync(srv, req.query.id);
        if(dirCont){
            getDirContent(dirCont);
            werte.dTree[req.query.id] = new entry(dirs, files, req.query.id, dirCont.title);
        }
    }
    else if( req.query.op == 'play') {
        werte.playKey = req.query.id;
//        werte.playTitle = werte.dTree[werte.playKey].title;

        if( werte.rend && werte.serv && werte.playKey ) {
            theMain.play(werte.rend, werte.serv, werte.playKey, 30 * 1000, function (err, result) {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        }
        else{
            console.error("No renderer or no server or no item (" + werte.rend + "|" + werte.serv + "|" + werte.playKey +")");
        }

    }
    else if( req.query.op == 'getTreeData'){
            var key = req.query.id;
        var ans = new Array();

        if( werte.serv && key){
            if(key == "0"){
                ans[0] = {
                    "title": werte.serv,
                    "key": "0",
                    "folder":true,
                    "children":traverse(werte, "0")
                };
            }
            else{
                var srv = theMain.getDeviceSync(werte.serv, "ContentDirectory");
                var dirCont = theMain.getDirContentSync(srv, req.query.id);
                if(dirCont){
                    getDirContent(dirCont);
                    werte.dTree[req.query.id] = new entry(dirs, files, req.query.id, dirCont.title);
                }
                ans = traverse(werte,key);
            }
        }

        res.json(ans);
        return;
    }
    else if(werte.serv){
        var srv = theMain.getDeviceSync(werte.serv, "ContentDirectory");
        var dirCont = theMain.getDirContentSync(srv, "0");
        if(dirCont){
            getDirContent(dirCont);
            werte.dTree = new Array();
            werte.dTree["0"] = new entry(dirs, files, "0", werte.serv);
        }
    }



//    var dir = dirs.dirs;
    res.render('upnp', {
        'serv':werte.serv,
        'rend':werte.rend,
        'storage':serverNames,
        'renderer':rendererNames,
        'conts':dirs,
        'items':files,
        'path':["."],
//        'dtree':werte.dTree,
        'title':'UPnP-Browser'
    });
//  next();
});


module.exports = router;
