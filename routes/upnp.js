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
java.classpath.push("./jars/cling-core-2.1.0.jar");
java.classpath.push("./jars/seamless-http-1.1.1.jar");
java.classpath.push("./jars/seamless-util-1.1.1.jar");
java.classpath.push("./jars/seamless-xml-1.1.1.jar");
java.classpath.push("./jars/cling-support-2.1.0.jar");

/**
 * start Java UPNP task
 */
var Main = java.import('mctrl.Main');
var theMain = null;

var dirs = null;
var files = null;
var restTime = 0;
var currFile = "";
var status = null;
var currPath = null;
var timer = null;




java.callStaticMethod('mctrl.Main', 'startIt()Lmctrl/DLNACtrl;', function(err, results) {
    if(err) { console.error(err); return; }
    // results from doSomething
    theMain = results;
//    setInterval(fetchStatus, 1000);
});

function getArray(a){
    var r = new Array();
    if(a){
        if (a.length == 1 && a[0] == null) {
            return r;
        }

        var c = 0;
        for(var i = 0; i < a.length; i++){
            r[c++] = {
                "id": a[i].getIdSync(),
                "title": a[i].getTitleSync(),
                "icon": a[i].getFirstResourceSync().getValueSync()
            };
        }
    }

    return r;
}

function entry(dirCont, i ) {
    this.id = i;
    this.title = t;
    this.playlist = false;

    this.dirs = getArray(dirCont.getDirsSync());
    this.files = getArray(dirCont.getItemsSync());
//    dirCont.printDirsSync();
//    dirCont.printItemsSync();
}

function entry(dirCont, i, t ){
    this.id = i;
    this.title = t;
    this.playlist = false;

    this.dirs = getArray(dirCont.getDirsSync());
    this.files = getArray(dirCont.getItemsSync());
//    dirCont.printDirsSync();
//    dirCont.printItemsSync();
}

function traverse(werte, id){
    var r = new Array();
    var e = werte.dTree[id];

    var idx = 0;
    if(e){
        for(var i=0; i < e.dirs.length; i++){
            var dt = e.dirs[i].title;
            var dk = e.dirs[i].id;
            var di = e.dirs[i].icon;
            r[idx++] = {
                "title": dt,
                "key": dk,
                "folder":true,
                "lazy":true,
                "children":traverse(werte, dk),
                "playlist": e.playList,
                "icon": di
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
function fetchStatus() {
    var res = {};
    if(theMain){
        status = theMain.getJobSync();
        restTime = status.getRestSync();
        currFile = status.getItemTitleSync();
        currPath = status.getItemPathSync();
        console.info("STATUS: "+status+" Resttime:"+restTime+" File:"+currFile + " Path:" + currPath);
        res = {
            "status": status,
            "restTime": restTime,
            "currFile": currFile,
            "currPath": currPath
        };
    }
    return res;
}

/* GET upnp page. */
router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Home' });

    if(req.query.op == 'search') {
        theMain.searchUDAServiceTypeSync(null);
        res.redirect('/upnp');
        return;
    }

    var serverNames = theMain.getServerArraySync();
    var rendererNames = theMain.getRendererArraySync();
    var werte = req.session.werte;
    if (!werte) {
        werte = req.session.werte = {}
    }

    if(req.query.r)werte.rend = req.query.r;
    if(req.query.s)werte.serv = req.query.s;

//    fetchStatus();

    if(req.query.op == 'getdir'){
        var srv = theMain.findVaultSync(werte.serv);
        var dirCont = theMain.browseToSync(srv, req.query.id);
        if(dirCont){
            werte.dTree[req.query.id] = new entry(dirCont, req.query.id );
        }
    }
    else if( req.query.op == 'play') {
        werte.playKey = req.query.id;
//        werte.playTitle = werte.dTree[werte.playKey].title;

        if( werte.rend && werte.serv && werte.playKey ) {
            theMain.play(werte.rend, werte.serv, werte.playKey, 100 * 1000, function (err, result) {
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
                var srv = theMain.findVaultSync(werte.serv);
                var dirCont = theMain.browseToSync(srv, req.query.id);
                if(dirCont){
                    werte.dTree[req.query.id] = new entry(dirCont, req.query.id );
                }
                ans = traverse(werte,key);
            }
        }

        res.json(ans);
        return;
    }
    else if( req.query.op == 'back'){
        theMain.jumpBack();
    }
    else if( req.query.op == 'forward'){
        theMain.jumpForward();
    }
    else if( req.query.op == 'stop'){
        theMain.stop();
    }
    else if( req.query.op == 'play'){
        theMain.play();
    }
    else if(werte.serv){
        var srv = theMain.findVaultSync(werte.serv);
        var dirCont = theMain.browseToSync(srv, "0");
        if(dirCont){
            werte.dTree = new Array();
            werte.dTree["0"] = new entry(dirCont, "0", werte.serv);
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
        'currPath':currPath,
        'currFile':currFile,
        'restTime':restTime,
        'path':["."],
//        'dtree':werte.dTree,
        'title':'UPnP-Browser'
    });
//  next();
});


module.exports = router;
