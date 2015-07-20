var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var { ToggleButton } = require("sdk/ui/button/toggle");
var clipboard = require("sdk/clipboard");
var notify = require("sdk/notifications");

var button = ToggleButton({
  id: "referencerStartButton",
  label: "localized-titlestart",
  icon: {
    "16": "./icons/icon-16.png",
    "32": "./icons/icon-32.png",
    "64": "./icons/icon-64.png"
  },
  onChange: function(state){
     if(state.checked){
         notify.notify({
             title: "Localized titleactivated",
             text: "Localized textactivated"
         });
         conWorker.port.emit("activate");
     }
     else{
         conWorker.port.emit("deactivate");
     }
  }
});

pageMod.PageMod({
    include: ['*'],
    contentScriptFile: data.url("scripts/lib.js"),
    onAttach: function(worker) {
        conWorker = worker;
        conWorker.port.on("copyLinkUrl", function(linkUrl) {
            clipboard.set(linkUrl);
            notify.notify({
                title: "Clipboard",
                text: "Link passed to clipboard"
            });
        });
        conWorker.port.on("windowReload", function() {
            // deactivate tab button when activated
            if(button.state("window").checked){
                button.click();
            }
        });
    }
});