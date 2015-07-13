
var Referencer =(function(){

    var createdPanels = 0;
    var panelRefPreId = 'referer';
    var summarizePanel;
    var sumPanelOpts = {
      'border-top':'1px solid black',
      'background-color':'#c3c3c3',
      'width:':'150px',
      'height':'50px',
      'text-align':'center',
      'line-height':'50px',
      'position':'fixed',
      'top':0,
      'left':0
    };
    var panelOpts = {
      'background-color':'#c3c3c3',
      'width:':'150px',
      'height':'50px',
      'text-align':'center',
      'line-height':'50px',
      'position':'fixed',
      'top':0,
      'left':0
    };
    var elementHightlightOps = {
      'border': '1px solid red'
    };

    var activated = false;

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
        created = true;
      }
      else{
        document.body.removeChild(summarizePanel);
      }
      sumPanelOpts['top'] = ((createdPanels)*parseInt(sumPanelOpts['height'].replace('px','')))+'px';
      summarizePanel.setAttribute('style',getSerialiazedOpts(sumPanelOpts));
      var allPanelIds = "";
      for(var e=0; e<createdPanels;e++){
          var eleId = document.querySelector('#'+panelRefPreId+e).innerHTML;
          eleId = eleId.replace('#','');
          allPanelIds += eleId+(e+1===createdPanels?'':'/');
      }
      var url = location.href;
      var hash = location.hash;
      console.log(hash);
      summarizePanel.innerHTML = url.replace(hash,'')+'#'+allPanelIds;
      summarizePanel.onclick = function(){
        var content = summarizePanel.innerHTML;
        summarizePanel.innerHTML = "<input type='text' style='width:100%' value='"+content+"' onclick='this.select()'/>";
        summarizePanel.onclick = undefined;
      };
      document.body.appendChild(summarizePanel);
    }

    function clickElementHandler(e){
      var ele = e.currentTarget;
      var id = '#'+ele.tagName+getElementNum(ele);
      var panel = document.createElement('div');
      panel.setAttribute('id',panelRefPreId+createdPanels);
      panel.setAttribute('style',getSerialiazedOpts(panelOpts));
      panel.innerHTML = id;
      panel.addEventListener('mouseenter',function(){
        var id = this.innerHTML;
        var ele = getElement(id);
        ele.focus();
        var eleStyle = ele.getAttribute('style');
        ele.setAttribute('style',eleStyle+';'+getSerialiazedOpts(elementHightlightOps));
      },false);
      panel.addEventListener('mouseout',function(){
        var id = this.innerHTML;
        var ele = getElement(id);
        var eleStyle = ele.getAttribute('style');
        eleStyle = eleStyle.replace(getSerialiazedOpts(elementHightlightOps),'');
        ele.setAttribute('style',eleStyle);
      },false);
      document.body.appendChild(panel);
      panelOpts['top'] = (++createdPanels*parseInt(panelOpts['height'].replace('px','')))+'px';
      createSummarize();
      e.stopPropagation();
      e.preventDefault();
    }

    function addClickHandler(){
      var all = document.body.querySelectorAll("*");
      console.log(all);
      for(var i=0; i<all.length;i++){
        all[i].addEventListener('click',clickElementHandler,false);
      }
    }

    function removeClickHandler(){
      var all = document.querySelectorAll("*");
      for(var i=0; i<all.length;i++){
        all[i].removeEventListener('click',clickElementHandler);
      }
    }

    function referencer(){}

    referencer.prototype.activate = function(){
      if(!activated){
        addClickHandler();
        activated = true;
      }
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
        }
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