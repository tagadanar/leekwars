// ==UserScript==
// @name      [Leek Wars] Image Chat
// @namespace  https://github.com/tagadanar/leekwars/
// @version   1.1
// @description Transforme les liens vers des images en image dans le chat
// @author    Tagadanar
// @projectPage https://github.com/tagadanar/leekwars/
// @updateURL  https://github.com/tagadanar/leekwars/raw/master/imagechat.user.js
// @downloadURL https://github.com/tagadanar/leekwars/raw/master/imagechat.user.js
// @match    http://leekwars.com/*
// @grant    none
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
    
  function replaceImg(){
    $("div.chat-message-messages>div>a").each(function(index, elem) {
      if(!$(elem).data('imgload')){
          testImage(elem.href, function(url, result){
            if(result=="success"){
                // sidechat
                var beforeSideChat = {};
                var beforeMainChat = {};
                if($('div.chat-messages')[0]){ // sideChat
                    beforeSideChat.scrollTop = $('div.chat-messages')[0].scrollTop;
                    beforeSideChat.scrollHeight = $('div.chat-messages')[0].scrollHeight;
                }
                if($('div#chat-messages')[0]){ // mainChat
                    beforeMainChat.scrollTop = $('div#chat-messages')[0].scrollTop;
                    beforeMainChat.scrollHeight = $('div#chat-messages')[0].scrollHeight;
                }
                $(elem).replaceWith("<a href='"+ url + "' data-imgload='true' target='_blank'><img src='"+ url +"' alt='"+url+"' style='max-width:90%;  max-height:200px;'  /></a>");
                if($('div.chat-messages')[0]){
                    var change = beforeSideChat.scrollHeight-$('div.chat-messages')[0].scrollHeight;
                    var distScroll = beforeSideChat.scrollTop-$('div.chat-messages')[0].scrollTop;
                    if(change!=distScroll){
                        // utilisation d'un timeout parce que je trouve pas comment faire propre et attendre le rezise qui devrait être sync mais non en fait...
                        setTimeout(function(){
                            $('div.chat-messages').scrollTop($('div.chat-messages')[0].scrollTop-(change-distScroll));
                        }, 1000);
                    }
                }
                if($('div#chat-messages')[0]){
                    var change = beforeMainChat.scrollHeight-$('div#chat-messages')[0].scrollHeight;
                    var distScroll = beforeMainChat.scrollTop-$('div#chat-messages')[0].scrollTop;
                    if(change!=distScroll){
                        // utilisation d'un timeout parce que je trouve pas comment faire propre et attendre le rezise qui devrait être sync mais non en fait...
                        setTimeout(function(){
                            $('div#chat-messages').scrollTop($('div#chat-messages')[0].scrollTop-(change-distScroll));
                        }, 1000);
                    }
                }                
            }else{
                $(elem).data('imgload', true);
            }
          });
      }
    });
    setTimeout(replaceImg, 5000); 
  }

  setTimeout(replaceImg, 5000);  
})();
