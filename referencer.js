
var Referencer =(function(){

    var liveCreatedPanelsNum = 0;
    var panelRefPreId = 'referer';
    var summarizePanel;
    var sumPanelOpts = {
        'border-top':'1px solid black',
        'background-color':'#c3c3c3',
        'text-align':'center',
        'line-height':'20px',
        'position':'fixed',
        'top':0,
        'left':0,
        'z-index':10000,
        'font-size': '12px',
        'width:':'240px'
    };
    var panelOpts = {
        'background-color':'#c3c3c3',
        'width:':'60px',
        'height':'20px',
        'text-align':'center',
        'line-height':'20px',
        'position':'fixed',
        'top':0,
        'left':0,
        'z-index':10000,
        'font-size': '12px',
        'cursor': 'pointer'
    };
    var elementHightlightOps = {
        'border': '1px solid red'
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

    function moveToElement(ele){
        var top = ele.offsetTop;
        var left = ele.offsetLeft;
        window.scrollTo(left,top);
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
        var type = id.match(/\D+/);
        var num = id.match(/\d+/);
        console.log(type,num);
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
        var created = false;
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
        console.log(hash);
        summarizePanel.innerHTML = "<p id='refererLink'>"+url.replace(hash,'')+'#'+allPanelIds+"</p>";
        summarizePanel.innerHTML += "Copy Link: Click on Link and press Ctrl+C";
        summarizePanel.onclick = function(){
            var content = document.getElementById('refererLink').innerHTML;
            var linkFieldEle = document.createElement('input');
            linkFieldEle.setAttribute('type','text');
            linkFieldEle.setAttribute('style','width:100%');
            linkFieldEle.setAttribute('value',content);
            linkFieldEle.setAttribute('onclick','this.select()');
            linkFieldEle.addEventListener ("DOMNodeInserted", function(){
                linkFieldEle.focus();
                linkFieldEle.select();
            }, false);
            summarizePanel.innerHTML = "";
            summarizePanel.appendChild(linkFieldEle);
            summarizePanel.onclick = undefined;
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

    function createPanelWithElement(ele,readMode){

        var linkId = '#'+ele.tagName+getElementNum(ele);
        var panel = document.createElement('div');

        panel.setAttribute('id',panelRefPreId+liveCreatedPanelsNum);
        panel.setAttribute('class',"refererPanel");
        panel.setAttribute('style',getSerialiazedOpts(panelOpts));
        panel.innerHTML = "<span class='link'>"+linkId+"</span>";

        panel.addEventListener('mouseenter',function(){
            var linkId = getChildElement(this,'link');
            var ele = getElement(linkId);
            moveToElement(ele);
            ele.focus();
            var eleStyle = ele.getAttribute('style');
            ele.setAttribute('style',eleStyle+';'+getSerialiazedOpts(elementHightlightOps));
        },false);

        panel.addEventListener('mouseout',function(){
            var linkId = getChildElement(this,'link');
            var ele = getElement(linkId);
            var eleStyle = ele.getAttribute('style');
            eleStyle = eleStyle.replace(getSerialiazedOpts(elementHightlightOps),'');
            ele.setAttribute('style',eleStyle);
        },false);

        var deleteButton = document.createElement('input');
        deleteButton.setAttribute('class','deleteButton');
        deleteButton.setAttribute('type','button');
        deleteButton.setAttribute('style','30px');
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
                var elementStyle = refElement.getAttribute('style').split(';');
                var nextPanelStyle = "";
                for(var st=0; st<elementStyle.length;st++){
                    var style = elementStyle[st].split(':');
                    if(style.length==2){
                        var styleName = String.trim(style[0]);
                        var styleVal = String.trim(style[1]);
                        if(!elementHightlightOps[styleName]){
                            nextPanelStyle += styleName+':'+styleVal+(st+1==elementStyle.length?'':';');
                        }
                    }
                }

                refElement.setAttribute('style',nextPanelStyle);

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

                createPanelWithElement(ele,true);
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

        createPanelWithElement(ele);

        createNumberLabelWithElement(liveCreatedPanelsNum,ele);
        createSummarize();

        e.stopPropagation();
        e.preventDefault();

    }

    function addReferencePanelClickHandler(){
        var all = document.body.querySelectorAll("*");
        console.log(all);
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
                console.log(hasHashVal);
                var elementIds = hasHashVal.split('/');
                for(var e=0;e<elementIds.length;e++){

                    var elementId = elementIds[e];
                    console.log(elementId);

                    var ele = getElement(elementId);
                    var eleStyle = ele.getAttribute('style');
                    ele.setAttribute('style',eleStyle+';'+getSerialiazedOpts(elementHightlightOps));

                    createPanelWithElement(ele,true);
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
    };

    return referencer;

})();


var ref = new Referencer();
ref.activate();