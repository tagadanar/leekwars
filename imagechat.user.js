// ==UserScript==
// @name		  [Leek Wars] Image Chat
// @namespace	 https://github.com/tagadanar/leekwars/
// @version		1.1
// @description	Transforme les liens vers des images en image dans le chat
// @author		Tagadanar
// @projectPage	https://github.com/tagadanar/leekwars/
// @updateURL	 https://github.com/tagadanar/leekwars/raw/master/imagechat.user.js
// @downloadURL	https://github.com/tagadanar/leekwars/raw/master/imagechat.user.js
// @match		 http://leekwars.com/*
// @grant		 none
// ==/UserScript==

(function() {
  function testImage(url, callback, timeout) {
      timeout = timeout || 5000;
      var timedOut = false, timer;
      var img = new Image();
      img.onerror = img.onabort = function() {
          if (!timedOut) {
              clearTimeout(timer);
              callback(url, "error");
          }
      };
      img.onload = function() {
          if (!timedOut) {
              clearTimeout(timer);
              callback(url, "success");
          }
      };
      img.src = url;
      timer = setTimeout(function() {
          timedOut = true;
          callback(url, "timeout");
      }, timeout); 
  }

  setInterval(function(){	
    $("div.chat-message-messages>div>a").each(function(index, elem) {
      testImage(elem.href, function(url, result){
        if(result=="success"){
            $(elem).replaceWith("<a href='"+ url + "' target='_blank'><img src='"+ url +"' alt='"+url+"' style='max-width:90%; 	max-height:200px;'  /></a>");
        }
      });
    });
  }, 5000);  
})();
