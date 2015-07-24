var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var { ToggleButton } = require("sdk/ui/button/toggle");
var clipboard = require("sdk/clipboard");
var trans = require("sdk/l10n").get;
var notify = require("sdk/notifications");
var conWorker;

pageMod.PageMod({
    include: ['*'],
    contentScriptFile: data.url("scripts/lib.js"),
    onAttach: function(worker) {
        conWorker = worker;
        conWorker.port.on("copyLinkUrl", function(linkUrl) {
            clipboard.set(linkUrl);
            notify.notify({
                title: trans("copypastfinishtitle_id"),
                text: trans("copypastfinishtext_id")
            });
        });
        conWorker.port.on("windowReload", function() {
            // deactivate tab button when activated
            checkForActivation();
        });
    }
});

var button = ToggleButton({
  id: "startRefButton",
  label: trans("titlestart_id"),
  icon: {
    "16": "./icons/icon-16.png",
    "32": "./icons/icon-32.png",
    "64": "./icons/icon-64.png"
  },
  onChange: function(state){
     if(state.checked){
         conWorker.port.emit("activate",JSON.stringify({
             translations: {
                 clickLink: trans("copypastlink_id")
             }
         }));
         conWorker.port.on("support",function(){
             notify.notify({
                 title: trans("titleactivated_id"),
                 text: trans("textactivated_id")
             });
         });
         conWorker.port.on("noSupport",function(){
             noSupportHandler();
         });
     }
     else{
         conWorker.port.emit("deactivate");
     }
  }
});

function noSupportHandler(){

    var alert = require("sdk/panel").Panel({
        height: 80,
        width: 450,
        contentURL: data.url("popup/alert.html"),
        contentScript: "document.getElementById('button').addEventListener('click', function(event) {" +
        "    self.port.emit('close-popup');" +
        "}, false);"
    });

    alert.on('hide',function(){
        alert.destroy();
        checkForActivation();
    });

    alert.port.on('close-popup',function(){
        alert.destroy();
        checkForActivation();
    });

    alert.show();

}

function checkForActivation(){
    if(button.state("window").checked){
        button.click();
    }
}