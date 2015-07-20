var Referencer = (function(){

    var liveCreatedPanelsNum = 0;
    var panelRefPreId = 'referer';
    var summarizePanel;
    var sumPanelOpts = {
        'border-top':'1px solid #FFFFFF',
        'background-color':'#000000',
        'line-height':'20px',
        'position':'fixed',
        'top':0,
        'left':0,
        'z-index':10000,
        'font-size': '12px',
        'width:':'260px',
        'padding-left': '10px',
        'padding-right': '10px',
        'color': '#FFFFFF',
        'opacity': '0.6'
    };
    var sumPanelLinkUrl = {
        'height': '20px',
        'overflow': 'hidden',
        'width': '260px'
    };
    var sumPanelInputField = {
        'margin-top': '10px',
        'margin-bottom': '10px'
    };
    var panelOpts = {
        'background-color':'#000000',
        'text-align':'center',
        'line-height':'40px',
        'position':'fixed',
        'top':0,
        'left':0,
        'z-index':10000,
        'font-size': '12px',
        'width':'100px',
        'height':'40px',
        'color': '#FFFFFF',
        'opacity': '0.6'
    };
    var panelLinkId = {
        'display': 'inline-block',
        'width': '60px',
        'padding-left': '10px',
        'text-align': 'left',
        'color': '#FFFFFF !important'
    };
    var panelDeleteButton = {
        'border': 'none',
        'background-color': 'transparent',
        'color': '#c3c3c3',
        'width': '30px',
        'cursor': 'pointer'
    };
    var elementHightlightOps = {
        'border': '1px solid red',
        'border-radius': '10px'
    };
    var labelHightlightOps = {
        'position': 'absolute',
        'border': '1px solid red',
        'border-radius': '0 0 10px 0',
        'text-align':'center',
        'line-height':'15px',
        'width': '15px',
        'background-color':'white',
        'color': 'red',
        'top':0,
        'left':0
    };
    var activated = false;

    function getOffset( el ) {
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    }

    function moveToElement(ele){
        var pos = getOffset(ele);
        window.scrollTo(pos.left,pos.top);
    }

    function trim(str){
        return String.trim ? String.trim(str) : str.trim();
    }

    function getSerialiazedOpts(opts){
        var serPanelOpts = [];
        var optsKeys = Object.keys(opts);
        for(var k=0; k<optsKeys.length;k++){
            var key = optsKeys[k];
            serPanelOpts.push(key+':'+opts[key]+(k+1===opts.length?'':';'));
        }
        return serPanelOpts.join('');
    }

    function getElement(id){
        id = id.replace('#','');
        var type = id.match(/\w+/);
        var num = id.match(/[-]([0-9]+)$/)[1];
        var elements = document.querySelectorAll(type);
        return elements[num];
    }

    function getElementNum(ele){
        var all = document.querySelectorAll(ele.tagName);
        for(var i=0; i<all.length;i++){
            if(ele===all[i])return i;
        }
    }

    function createSummarize(){
        if(!summarizePanel){
            summarizePanel = document.createElement('div');
        }
        else{
            document.body.removeChild(summarizePanel);
        }
        sumPanelOpts['top'] = ((liveCreatedPanelsNum)*parseInt(panelOpts['height'].replace('px','')))+'px';
        summarizePanel.setAttribute('style',getSerialiazedOpts(sumPanelOpts));
        var allPanelIds = "";
        for(var e=0; e<liveCreatedPanelsNum;e++){
            var eleId = document.querySelector('#'+panelRefPreId+e+' .link').innerHTML;
            eleId = eleId.replace('#','');
            allPanelIds += eleId+(e+1===liveCreatedPanelsNum?'':'/');
        }
        var url = location.href;
        var hash = location.hash;
        summarizePanel.innerHTML = "<p id='refererLink' style='"+getSerialiazedOpts(sumPanelLinkUrl)+"'>"+url.replace(hash,'')+'#'+allPanelIds+"</p>";
        summarizePanel.innerHTML += "<p data-l10n-id='copypastlink_id'></p>";
        summarizePanel.onclick = function(){
            var content = document.getElementById('refererLink').innerHTML;
            /*var linkFieldEle = document.createElement('input');
            linkFieldEle.setAttribute('type','text');
            linkFieldEle.setAttribute('style',getSerialiazedOpts(sumPanelInputField));
            linkFieldEle.setAttribute('value',content);
            linkFieldEle.setAttribute('onclick','this.select()');
            linkFieldEle.addEventListener ("DOMNodeInserted", function(){
                linkFieldEle.focus();
                linkFieldEle.select();
            }, false);
            summarizePanel.innerHTML = "";
            summarizePanel.appendChild(linkFieldEle);
            summarizePanel.onclick = undefined;*/
            self.port.emit("copyLinkUrl", content);
        };
        document.body.appendChild(summarizePanel);
    }

    function getChildElement(ele,id){
        var linkId = null;
        for (var i = 0; i < ele.childNodes.length; i++) {
            if (ele.childNodes[i].id == id || ele.childNodes[i].className == id) {
                linkId = ele.childNodes[i].innerHTML;
                break;
            }
        }
        return linkId;
    }

    function handleCssAssignment(eleStyle,defaultStyle,omitDefault){
        var assignedStyle = "";
        eleStyle = eleStyle.split(';');
        for(var st=0; st<eleStyle.length;st++){
            var style = eleStyle[st].split(':');
            if(style.length==2){
                var styleName = trim(style[0]);
                var styleVal = trim(style[1]);
                if(!defaultStyle[styleName]){
                    assignedStyle += styleName+':'+styleVal+';';
                }
            }
        }
        return assignedStyle+(omitDefault?"":getSerialiazedOpts(defaultStyle));
    }

    function createPanelWithElement(ele,labelNumber){

        var linkId = '#'+ele.tagName+"-"+getElementNum(ele);
        var panel = document.createElement('div');

        panel.setAttribute('id',panelRefPreId+liveCreatedPanelsNum);
        panel.setAttribute('class',"refererPanel");
        panel.setAttribute('style',getSerialiazedOpts(panelOpts));
        panel.innerHTML = "<span class='linkLabel' style='"+getSerialiazedOpts(panelLinkId)+"'>"+
                             labelNumber +
                          "</span>"+
                          "<span class='link' style='display: none'>"+linkId+"</span>";

        panel.addEventListener('mouseenter',function(){
            var linkId = getChildElement(this,'link');
            var ele = getElement(linkId);
            moveToElement(ele);
            ele.focus();
            var eleStyle = ele.getAttribute('style');
            ele.setAttribute('style',handleCssAssignment(eleStyle,elementHightlightOps));
        },false);

        panel.addEventListener('mouseleave',function(){
            var linkId = getChildElement(this,'link');
            var ele = getElement(linkId);
            var eleStyle = ele.getAttribute('style');
            eleStyle = eleStyle.replace(getSerialiazedOpts(elementHightlightOps),'');
            ele.setAttribute('style',eleStyle);
        },false);

        var deleteButton = document.createElement('input');
        deleteButton.setAttribute('class','deleteButton');
        deleteButton.setAttribute('type','button');
        deleteButton.setAttribute('style',getSerialiazedOpts(panelDeleteButton));
        deleteButton.setAttribute('value',"X");

        panel.appendChild(deleteButton);
        document.body.appendChild(panel);


        deleteButton = document.querySelector('#'+panel.getAttribute('id')+' .deleteButton');
        deleteButton.addEventListener('click',function(e){

            var remIds = [];
            var linkIdToDelete = getChildElement(e.currentTarget.parentNode,'link');

            var allPanelLinks = document.querySelectorAll('.refererPanel .link');
            var allLabels = document.querySelectorAll('.refererLabel');

            for(var e=0;e<allPanelLinks.length;e++){

                var label= allLabels[e];
                label.parentNode.removeChild(label);

                var link = allPanelLinks[e];
                var panel = link.parentNode;

                if(linkIdToDelete!=link.innerHTML){
                    remIds.push(link.innerHTML);
                }

                var refElement = getElement(link.innerHTML);
                var elementStyle = refElement.getAttribute('style');
                refElement.setAttribute('style',handleCssAssignment(elementStyle,elementHightlightOps,true));

                document.body.removeChild(panel);

            }

            liveCreatedPanelsNum = 0;
            panelOpts['top'] = 0;
            sumPanelOpts['top'] = 0;

            for(var e=0;e<remIds.length;e++){

                var linkId = remIds[e];

                var ele = getElement(linkId);
                var eleStyle = ele.getAttribute('style');
                ele.setAttribute('style',eleStyle+';'+getSerialiazedOpts(elementHightlightOps));

                createPanelWithElement(ele,e+1);
                createNumberLabelWithElement(e+1,ele);

            }

            if(remIds.length)createSummarize();
            else if(summarizePanel){
                document.body.removeChild(summarizePanel);
                summarizePanel = null;
            }

        },false);

        panelOpts['top'] = (++liveCreatedPanelsNum*parseInt(panelOpts['height'].replace('px','')))+'px';
    }

    function createNumberLabelWithElement(number,ele){
        var label = document.createElement('div');
        label.setAttribute('class',"refererLabel");
        label.setAttribute('style',getSerialiazedOpts(labelHightlightOps));
        label.innerHTML = number;
        var parent = ele;
        while(parent&&parent.tagName&&parent.tagName.toLowerCase()=='img'){
            parent = parent.parentNode;
        }
        if(parent){
            parent.setAttribute('style',parent.getAttribute('style')+';position:relative');
            parent.appendChild(label);
        }
        else{
            ele.setAttribute('style',ele.getAttribute('style')+';position:relative');
            ele.appendChild(label);
        }
    }

    function createReferencPanels(e){

        var ele = e.currentTarget;

        createPanelWithElement(ele,liveCreatedPanelsNum+1);

        createNumberLabelWithElement(liveCreatedPanelsNum,ele);
        createSummarize();

        e.stopPropagation();
        e.preventDefault();

    }

    function addReferencePanelClickHandler(){
        var all = document.body.querySelectorAll("*");
        for(var i=0; i<all.length;i++){
            all[i].addEventListener('click',createReferencPanels,false);
        }
    }

    function removeClickHandler(){
        var all = document.querySelectorAll("*");
        for(var i=0; i<all.length;i++){
            all[i].removeEventListener('click',createReferencPanels);
        }
    }

    function referencer(){}

    referencer.prototype.activate = function(){

        if(!activated){

            addReferencePanelClickHandler();

            var hasHashVal = location.hash;

            if(hasHashVal){
                var elementIds = hasHashVal.split('/');
                for(var e=0;e<elementIds.length;e++){

                    var elementId = elementIds[e];

                    var ele = getElement(elementId);
                    var eleStyle = ele.getAttribute('style');
                    ele.setAttribute('style',eleStyle+';'+getSerialiazedOpts(elementHightlightOps));

                    createPanelWithElement(ele,e+1);
                    createNumberLabelWithElement(e+1,ele);

                }

                if(elementIds.length){
                    createSummarize();
                }

            }

            activated = true;
        }
    };

    referencer.prototype.deactivate = function(){
        removeClickHandler();
        activated = false;

        if(summarizePanel){

            summarizePanel.parentNode.removeChild(summarizePanel);
            summarizePanel = null;

            var allPanelLinks = document.querySelectorAll('.refererPanel .link');
            var allLabels = document.querySelectorAll('.refererLabel');

            for(var e=0;e<allPanelLinks.length;e++){

                var label= allLabels[e];
                label.parentNode.removeChild(label);

                var link = allPanelLinks[e];
                var panel = link.parentNode;

                var refElement = getElement(link.innerHTML);
                var elementStyle = refElement.getAttribute('style');
                refElement.setAttribute('style',handleCssAssignment(elementStyle,elementHightlightOps,true));

                panel.parentNode.removeChild(panel);

            }

            liveCreatedPanelsNum = 0;
            panelOpts['top'] = 0;
            sumPanelOpts['top'] = 0;
        }
    };

    return referencer;

})();

var instance = new Referencer();

self.port.on("activate", function(tag) {
    instance.activate();
});

self.port.on("deactivate", function(tag) {
    instance.deactivate();
});

/* deactivate tab button */
window.addEventListener('beforeunload', function(e) {
    self.port.emit("windowReload");
});